/**
 * Print-ready HTML for the digitization certificate (digital/technical layout + QR).
 */

export type CertificateLike = Record<string, unknown>;

const PRODUCT_NAME = 'Aros Studio Tokenomics (AST)';

export function buildVerifyUrl(processId: string, qrPath?: string | null): string {
  if (typeof window === 'undefined') {
    return qrPath ?? `/explore?processId=${encodeURIComponent(processId)}`;
  }
  const path =
    qrPath && String(qrPath).startsWith('http')
      ? String(qrPath)
      : `${window.location.origin}${qrPath ?? `/explore?processId=${encodeURIComponent(processId)}`}`;
  return path;
}

export function certificatePrintHtml(input: {
  cert: CertificateLike;
  processId: string;
  qrDataUrl: string;
  verifyUrl: string;
  potDone: boolean;
  mintAmount: string | null;
  submitted: boolean;
}): string {
  const { cert, processId, qrDataUrl, verifyUrl, potDone, mintAmount, submitted } = input;
  const title = String(cert.title ?? 'Certificate of asset digitization and process registration');
  const serial = String(cert.certificateSerial ?? `AST-CERT-${processId}`);
  // Always brand as AST — ignore any legacy issuer strings on stored certs.
  const issuer = PRODUCT_NAME;
  const issuedAt = String(cert.issuedAt ?? new Date().toISOString());
  const statements = (cert.statements as string[] | undefined) ?? [];
  const pipe = (cert.pipeline as Record<string, boolean> | undefined) ?? {};

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #111827;
      margin: 0;
      background: #fff;
      font-size: 12px;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }
    .sheet {
      max-width: 190mm;
      margin: 0 auto;
      border: 1px solid #d1d5db;
      padding: 14mm 12mm;
      min-height: 250mm;
    }
    .top {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .brand {
      font-size: 11px;
      color: #6b7280;
      font-weight: 500;
    }
    .brand strong {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin-top: 4px;
      letter-spacing: 0;
      text-transform: none;
    }
    .serial {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 10px;
      color: #4b5563;
      text-align: right;
      line-height: 1.5;
    }
    h1 {
      font-family: inherit;
      font-size: 16px;
      font-weight: 600;
      text-align: left;
      margin: 0 0 6px;
      color: #111827;
      line-height: 1.35;
    }
    .sub {
      text-align: left;
      color: #6b7280;
      font-size: 11px;
      margin: 0 0 18px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 140px;
      gap: 20px;
      align-items: start;
    }
    .fields { font-size: 12px; }
    .fields p { margin: 0 0 10px; }
    .label {
      display: block;
      color: #6b7280;
      font-size: 10px;
      font-weight: 500;
      margin-bottom: 2px;
      text-transform: none;
      letter-spacing: 0;
    }
    .value { font-weight: 500; color: #111827; }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 11px;
      word-break: break-all;
      font-weight: 400;
    }
    .qr-box {
      text-align: center;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 10px 8px;
      background: #fafafa;
    }
    .qr-box img { width: 120px; height: 120px; display: block; margin: 0 auto 8px; }
    .qr-box .qlabel { font-size: 9px; color: #6b7280; line-height: 1.35; }
    .section { margin-top: 18px; }
    .section h2 {
      font-size: 11px;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin: 0 0 8px;
      text-transform: none;
      letter-spacing: 0;
    }
    ul { margin: 0; padding-left: 16px; font-size: 11px; color: #374151; }
    li { margin-bottom: 3px; }
    .wallet-note {
      margin-top: 12px;
      padding: 8px 10px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      font-size: 10px;
      color: #4b5563;
    }
    .seal-row {
      display: flex;
      justify-content: space-between;
      margin-top: 28px;
      gap: 24px;
    }
    .seal {
      flex: 1;
      text-align: left;
      font-size: 10px;
      color: #6b7280;
    }
    .seal .line {
      margin-top: 28px;
      border-top: 1px solid #d1d5db;
      padding-top: 6px;
    }
    .foot {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
      font-size: 9px;
      color: #9ca3af;
      line-height: 1.45;
    }
    @media print {
      body { background: #fff; }
      .sheet { border-color: #d1d5db; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="top">
      <div class="brand">
        Digital registration certificate
        <strong>${esc(issuer)}</strong>
      </div>
      <div class="serial">
        Serial<br/>${esc(serial)}<br/><br/>
        Issued<br/>${esc(formatWhen(issuedAt))}
      </div>
    </div>

    <h1>${esc(title)}</h1>
    <p class="sub">Machine-readable attestation · QR verify · NodeChain is SoT after PoT</p>

    <div class="grid">
      <div class="fields">
        <p><span class="label">Process ID</span><span class="value mono">${esc(String(cert.processId ?? processId))}</span></p>
        <p><span class="label">Institution</span><span class="value">${esc(String(cert.institutionId ?? '—'))}</span></p>
        <p><span class="label">Rights holder</span><span class="value">${esc(String(cert.holderId ?? '—'))}</span></p>
        <p><span class="label">Wallet (representation)</span><span class="value mono">${esc(String(cert.holderWallet ?? '— not bound —'))}</span></p>
        <p><span class="label">Asset reference</span><span class="value mono">${esc(String(cert.assetId ?? '—'))}</span></p>
        <p><span class="label">Amount on document</span><span class="value mono">${esc(
          cert.amountFromDocument
            ? `${cert.amountFromDocument} ${cert.valuationCurrency ?? ''}`.trim()
            : String(cert.institutionalValuation ?? '—'),
        )}</span></p>
        <p><span class="label">Currency (document)</span><span class="value">${esc(String(cert.valuationCurrency ?? '—'))}</span></p>
        <p><span class="label">ARO mint (network unit)</span><span class="value mono">${esc(String(mintAmount ?? cert.mintAmountAro ?? cert.institutionalValuation ?? 'pending'))}</span></p>
        <p><span class="label">Document package hash</span><span class="value mono">${esc(String(cert.documentPackageHash ?? '—'))}</span></p>
        <p><span class="label">Status</span><span class="value">${esc(String(cert.status ?? '—'))} · PoT ${potDone ? 'verified' : 'pending'} · Hand-off ${submitted ? 'yes' : 'no'}</span></p>
      </div>
      <div class="qr-box">
        <img src="${qrDataUrl}" alt="Verification QR code" width="120" height="120" />
        <div class="qlabel">${esc(String(cert.qrLabel ?? 'Scan to verify'))}</div>
        <div class="qlabel mono" style="margin-top:6px;font-size:8px;word-break:break-all;">${esc(verifyUrl)}</div>
      </div>
    </div>

    <div class="section">
      <h2>Pipeline</h2>
      <ul>
        <li>Documents admitted: ${pipe.documentsAdmitted ? 'yes' : 'no'}</li>
        <li>Electronic signature confirmed: ${pipe.electronicSignatureConfirmed ? 'yes' : 'no'}</li>
        <li>Handed off to Core: ${pipe.handedOffToCore || submitted ? 'yes' : 'no'}</li>
        <li>PoT complete: ${pipe.potComplete || potDone ? 'yes' : 'no'}</li>
        <li>Economic mint recorded: ${pipe.economicMintRecorded || !!mintAmount ? 'yes' : 'no'}</li>
      </ul>
    </div>

    <div class="section">
      <h2>Statements</h2>
      <ul>
        ${statements.map((s) => `<li>${esc(s)}</li>`).join('')}
      </ul>
    </div>

    <div class="wallet-note">
      <strong>Wallet compatibility:</strong>
      ERC-721-style metadata + optional EIP-681 / CAIP-19 in JSON export.
      On-chain balance is representation only — NodeChain remains SoT.
      ${
        cert.holderWallet
          ? ` Bound wallet: <span class="mono">${esc(String(cert.holderWallet))}</span>.`
          : ' No wallet bound.'
      }
    </div>

    <div class="seal-row">
      <div class="seal"><div class="line">Institutional officer</div></div>
      <div class="seal"><div class="line">System attestation (edge)</div></div>
    </div>

    <div class="foot">
      ${esc(String(cert.disclaimer ?? ''))}
      <br/><br/>
      ${esc(PRODUCT_NAME)} · QR encodes public verification URL · Portal never mints ARO.
    </div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
}
