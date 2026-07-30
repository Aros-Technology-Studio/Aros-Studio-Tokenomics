#!/usr/bin/env tsx
/**
 * D2 — document-first e2e against running portal edge (home stack).
 *
 * Flow: login → extract → hash → verify-signature → tokenization/start → poll → certificate
 * Uses a real PDF file (fixture or --pdf path). Edge stores hash only; no mint on portal.
 *
 * Prerequisites: npm run home:up
 *
 * Usage:
 *   npm run demo:pdf-e2e
 *   npm run demo:pdf-e2e -- --pdf /path/to/signed.pdf --amount 500000 --currency USD
 */
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { writeDemoValuationPdf } from './generate-demo-pdf';

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv: string[]) {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return {
    pdf: get('--pdf'),
    amount: get('--amount') ?? '250000.00',
    currency: (get('--currency') ?? 'USD').toUpperCase(),
    base: (get('--base') ?? process.env.PORTAL_EDGE_URL ?? 'http://127.0.0.1:3100').replace(
      /\/$/,
      '',
    ),
    login: get('--login') ?? process.env.AST_DEMO_LOGIN ?? 'pilot',
    /** Explicit salt; if omitted, resolved from env / secrets file / pilot default */
    salt: get('--salt'),
    holderId: get('--holder') ?? 'holder-demo-pdf',
  };
}

/**
 * When home-up loads data/institution-secrets.json, demo pilot/pilot is replaced
 * by the file token. Prefer --salt, then AST_PILOT_SALT, then secrets file, then "pilot".
 */
async function resolveSalt(login: string, explicit: string | undefined): Promise<string> {
  if (explicit?.trim()) return explicit.trim();
  if (process.env.AST_PILOT_SALT?.trim()) return process.env.AST_PILOT_SALT.trim();

  const filePath =
    process.env.AST_INSTITUTION_SECRETS_FILE?.trim() ||
    path.join(ROOT, 'data', 'institution-secrets.json');
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Array<{ institutionId?: string; token?: string }>;
    if (Array.isArray(parsed)) {
      const key = login.trim().toUpperCase();
      const acc = parsed.find((a) => String(a.institutionId ?? '').toUpperCase() === key);
      if (acc?.token?.trim()) {
        console.log(`      salt from ${filePath} (${key})`);
        return acc.token.trim();
      }
    }
  } catch {
    /* fallthrough */
  }
  return 'pilot';
}

async function api(
  base: string,
  method: string,
  p: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const res = await fetch(`${base}${p}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    json = { message: res.statusText };
  }
  return { status: res.status, json };
}

function sessionIdFromLogin(json: Record<string, unknown>): string | null {
  if (typeof json.sessionId === 'string') return json.sessionId;
  const session = json.session as { sessionId?: string } | undefined;
  if (session?.sessionId) return session.sessionId;
  return null;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  console.log('D2 PDF e2e — document-first edge path\n');

  const health = await api(args.base, 'GET', '/v1/health');
  if (health.status >= 400 || health.json.status !== 'ok') {
    console.error('FAIL: edge not healthy. Start stack: npm run home:up');
    console.error(health);
    process.exit(1);
  }
  console.log('PASS  edge health');

  let pdfPath: string;
  if (args.pdf) {
    pdfPath = path.resolve(args.pdf);
  } else {
    const w = await writeDemoValuationPdf();
    pdfPath = w.path;
  }
  const pdfBuf = await fs.readFile(pdfPath);
  if (pdfBuf.length < 100) {
    console.error('FAIL: PDF too small or missing', pdfPath);
    process.exit(1);
  }
  console.log(`PASS  pdf loaded (${pdfBuf.length} bytes)`);
  console.log(`      ${pdfPath}`);

  const salt = await resolveSalt(args.login, args.salt);
  const login = await api(args.base, 'POST', '/v1/auth/login', {
    institutionId: args.login,
    token: salt,
  });
  const sessionId = sessionIdFromLogin(login.json);
  if (login.status >= 400 || !sessionId) {
    console.error('FAIL: login', login);
    console.error(
      'Hint: use --salt from data/institution-credentials.txt, or pilot/pilot when no secrets file',
    );
    process.exit(1);
  }
  console.log(`PASS  login as ${args.login}`);

  const sessionHeaders = { 'x-session-id': sessionId };
  const b64 = pdfBuf.toString('base64');
  const fileName = path.basename(pdfPath);

  const extract = await api(
    args.base,
    'POST',
    '/v1/documents/extract',
    { fileName, contentBase64: b64 },
    sessionHeaders,
  );
  if (extract.status >= 400) {
    console.error('FAIL: extract', extract);
    process.exit(1);
  }
  console.log('PASS  extract assist');

  const hashRes = await api(
    args.base,
    'POST',
    '/v1/documents/hash',
    {
      parts: [{ name: fileName, content: b64, encoding: 'base64' }],
    },
    sessionHeaders,
  );
  const documentPackageHash = String(hashRes.json.documentPackageHash ?? '');
  if (hashRes.status >= 400 || !/^[a-f0-9]{64}$/i.test(documentPackageHash)) {
    console.error('FAIL: hash', hashRes);
    process.exit(1);
  }
  console.log(`PASS  documentPackageHash=${documentPackageHash.slice(0, 16)}…`);

  const sig = await api(
    args.base,
    'POST',
    '/v1/documents/verify-signature',
    {
      documentPackageHash,
      fileName,
      hasQualifiedSignature: true,
      signatureAttestation: 'ATTESTED-DEMO-KEP-20260730-E2E',
      signerId: 'DEMO-INSTITUTION-KEP',
    },
    sessionHeaders,
  );
  if (sig.status >= 400 || sig.json.verified !== true) {
    console.error('FAIL: verify-signature', sig);
    process.exit(1);
  }
  console.log('PASS  e-sign attestation', sig.json.verificationId);

  const valuationNum = Number(String(args.amount).replace(/,/g, ''));
  if (!Number.isFinite(valuationNum) || valuationNum <= 0) {
    console.error('FAIL: invalid --amount');
    process.exit(1);
  }
  const amountFromDocument = valuationNum.toFixed(2);
  const institutionalValuation = valuationNum.toFixed(9);

  const start = await api(
    args.base,
    'POST',
    '/v1/tokenization/start',
    {
      assetType: 'real_estate',
      institutionalValuation,
      valuationCurrency: args.currency,
      amountFromDocument,
      institutionalAroPerUnit: '1',
      holderId: args.holderId,
      assetId: `asset-pdf-demo-${Date.now().toString(36)}`,
      hasQualifiedSignature: true,
      documentPackageHash,
      note: `D2 e2e package ${fileName}`,
    },
    {
      ...sessionHeaders,
      'idempotency-key': `d2-e2e-${randomBytes(8).toString('hex')}`,
    },
  );
  if (start.status >= 400) {
    console.error('FAIL: tokenization/start', start);
    process.exit(1);
  }
  const processId = String(start.json.processId ?? '');
  if (!processId.startsWith('AST-')) {
    console.error('FAIL: no processId', start.json);
    process.exit(1);
  }
  console.log(`PASS  tokenization started processId=${processId} status=${start.json.status}`);

  let lastStatus = String(start.json.status ?? '');
  let body: Record<string, unknown> = start.json;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 500));
    const st = await api(
      args.base,
      'GET',
      `/v1/processes/${encodeURIComponent(processId)}`,
      undefined,
      sessionHeaders,
    );
    if (st.status >= 400) {
      console.error('FAIL: get process', st);
      process.exit(1);
    }
    body = st.json;
    lastStatus = String(body.status ?? '');
    const progress = body.progress as { percent?: number } | undefined;
    process.stdout.write(
      `  … poll ${i + 1} status=${lastStatus} progress=${progress?.percent ?? '?'}\n`,
    );
    // Terminal or stable pilot statuses — stop early (edge may map completed → closed)
    if (
      [
        'completed',
        'closed',
        'settled',
        'minted',
        'failed',
        'rejected',
        'awaiting_core',
        'submitted',
        'processing',
        'pot_done',
        'in_progress',
      ].includes(lastStatus)
    ) {
      break;
    }
  }
  console.log(`PASS  process status=${lastStatus}`);

  const cert = await api(
    args.base,
    'GET',
    `/v1/processes/${encodeURIComponent(processId)}/certificate`,
    undefined,
    sessionHeaders,
  );
  if (cert.status >= 400) {
    console.warn(
      'WARN  certificate not available yet',
      cert.status,
      cert.json.code ?? cert.json.message,
    );
  } else {
    console.log(
      'PASS  certificate',
      JSON.stringify({
        processId: cert.json.processId,
        hasVerify: Boolean(cert.json.verifyUrl || cert.json.qrPayload || cert.json.publicLookupPath),
      }),
    );
  }

  const out = {
    ok: true,
    demo: 'D2-pdf-e2e',
    processId,
    status: lastStatus,
    documentPackageHash,
    pdfPath,
    amount: amountFromDocument,
    currency: args.currency,
    ui: `http://127.0.0.1:3200/tokenization/${encodeURIComponent(processId)}`,
    nodechain: `http://127.0.0.1:3200/nodechain?processId=${encodeURIComponent(processId)}`,
    note: 'Portal never mints; mint only on Core after PoT when hand-off succeeds.',
  };
  console.log('\n' + JSON.stringify(out, null, 2));
  console.log('\nD2 PDF E2E PASS');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
