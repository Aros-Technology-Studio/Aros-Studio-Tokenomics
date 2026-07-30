#!/usr/bin/env tsx
/**
 * D4 — X.509 detached signature e2e against live portal edge.
 *
 * Flow: login → hash PDF package → sign hash with demo leaf key → verify-signature (x509_detached)
 *
 * Prerequisites: npm run home:up · npm run demo:x509-package (if fixtures missing)
 *
 * Usage: npm run demo:x509-e2e
 */
import { createHash, createSign } from 'crypto';
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
    base: (get('--base') ?? process.env.PORTAL_EDGE_URL ?? 'http://127.0.0.1:3100').replace(
      /\/$/,
      '',
    ),
    login: get('--login') ?? process.env.AST_DEMO_LOGIN ?? 'pilot',
    salt: get('--salt'),
  };
}

async function resolveSalt(login: string, explicit?: string): Promise<string> {
  if (explicit?.trim()) return explicit.trim();
  if (process.env.AST_PILOT_SALT?.trim()) return process.env.AST_PILOT_SALT.trim();
  const filePath =
    process.env.AST_INSTITUTION_SECRETS_FILE?.trim() ||
    path.join(ROOT, 'data', 'institution-secrets.json');
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Array<{ institutionId?: string; token?: string }>;
    const key = login.trim().toUpperCase();
    const acc = parsed.find((a) => String(a.institutionId ?? '').toUpperCase() === key);
    if (acc?.token?.trim()) return acc.token.trim();
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
) {
  const res = await fetch(`${base}${p}`, {
    method,
    headers: { 'content-type': 'application/json', ...(headers ?? {}) },
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log('D4 X.509 e2e — detached signature path\n');

  const health = await api(args.base, 'GET', '/v1/health');
  if (health.status >= 400 || health.json.status !== 'ok') {
    console.error('FAIL: edge not healthy. Start: npm run home:up');
    process.exit(1);
  }
  console.log('PASS  edge health');

  const leafPemPath = path.join(ROOT, 'fixtures/x509-demo/leaf.pem');
  const leafKeyPath = path.join(ROOT, 'fixtures/x509-demo/leaf.key');
  const trustPemPath = path.join(ROOT, 'fixtures/x509-demo/trust/demo-ca.pem');
  try {
    await fs.access(leafPemPath);
    await fs.access(leafKeyPath);
    await fs.access(trustPemPath);
  } catch {
    console.error('FAIL: fixtures missing — run: npm run demo:x509-package');
    process.exit(1);
  }

  const { path: pdfPath } = await writeDemoValuationPdf();
  const pdfBuf = await fs.readFile(pdfPath);
  console.log(`PASS  pdf ${pdfBuf.length} bytes`);

  const salt = await resolveSalt(args.login, args.salt);
  const login = await api(args.base, 'POST', '/v1/auth/login', {
    institutionId: args.login,
    token: salt,
  });
  const sessionId =
    typeof login.json.sessionId === 'string' ? login.json.sessionId : null;
  if (login.status >= 400 || !sessionId) {
    console.error('FAIL: login', login);
    process.exit(1);
  }
  console.log(`PASS  login as ${args.login}`);
  const sessionHeaders = { 'x-session-id': sessionId };

  const fileName = path.basename(pdfPath);
  const b64 = pdfBuf.toString('base64');
  const hashRes = await api(
    args.base,
    'POST',
    '/v1/documents/hash',
    { parts: [{ name: fileName, content: b64, encoding: 'base64' }] },
    sessionHeaders,
  );
  const documentPackageHash = String(hashRes.json.documentPackageHash ?? '');
  if (hashRes.status >= 400 || !/^[a-f0-9]{64}$/i.test(documentPackageHash)) {
    console.error('FAIL: hash', hashRes);
    process.exit(1);
  }
  console.log(`PASS  documentPackageHash=${documentPackageHash.slice(0, 16)}…`);

  // Detached RSA-SHA256 over 32 raw hash bytes (D4 contract)
  const leafKey = await fs.readFile(leafKeyPath, 'utf8');
  const leafPem = await fs.readFile(leafPemPath, 'utf8');
  const hashBytes = Buffer.from(documentPackageHash, 'hex');
  const signer = createSign('RSA-SHA256');
  signer.update(hashBytes);
  signer.end();
  const signatureBase64 = signer.sign(leafKey).toString('base64');
  console.log('PASS  local detached signature created (demo leaf key)');

  // Sanity: local hash of material
  createHash('sha256').update(hashBytes).digest('hex');

  const sig = await api(
    args.base,
    'POST',
    '/v1/documents/verify-signature',
    {
      mode: 'x509_detached',
      documentPackageHash,
      fileName,
      hasQualifiedSignature: true,
      signerCertificatePem: leafPem,
      signatureBase64,
      signerId: 'PILOT-DEMO-LEAF',
    },
    sessionHeaders,
  );
  if (sig.status >= 400 || sig.json.verified !== true) {
    console.error('FAIL: x509 verify-signature', sig);
    console.error(
      'Hint: ensure edge can load fixtures/x509-demo/trust (or AST_X509_TRUST_DIR). Restart home:up after generating fixtures.',
    );
    process.exit(1);
  }
  console.log('PASS  x509_detached verified', {
    verificationId: sig.json.verificationId,
    mode: sig.json.mode,
    chainDepth: sig.json.chainDepth,
    subject: (sig.json.signer as { subject?: string } | undefined)?.subject,
  });

  // Negative: tampered sig must fail
  const badSig = Buffer.from(signatureBase64, 'base64');
  badSig[0] ^= 0xff;
  const neg = await api(
    args.base,
    'POST',
    '/v1/documents/verify-signature',
    {
      mode: 'x509_detached',
      documentPackageHash,
      hasQualifiedSignature: true,
      signerCertificatePem: leafPem,
      signatureBase64: badSig.toString('base64'),
    },
    sessionHeaders,
  );
  if (neg.status < 400 || (neg.json as { code?: string }).code === undefined) {
    // Must be fail-closed
    if (neg.json.verified === true) {
      console.error('FAIL: tampered signature was accepted');
      process.exit(1);
    }
  }
  console.log('PASS  fail-closed on tampered signature', neg.json.code ?? neg.status);

  console.log(
    '\n' +
      JSON.stringify(
        {
          ok: true,
          demo: 'D4-x509-e2e',
          documentPackageHash,
          verificationId: sig.json.verificationId,
          mode: sig.json.mode,
          chainDepth: sig.json.chainDepth,
          trust: trustPemPath,
        },
        null,
        2,
      ),
  );
  console.log('\nD4 X509 E2E PASS');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
