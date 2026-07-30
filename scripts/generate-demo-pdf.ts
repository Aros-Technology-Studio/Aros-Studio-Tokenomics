#!/usr/bin/env tsx
/**
 * Write a minimal valid PDF with extractable valuation text (D2 fixture).
 * Not a legal instrument — pilot assist only.
 */
import { promises as fs } from 'fs';
import * as path from 'path';

function escapePdf(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/** Minimal PDF 1.4 with Helvetica text lines. */
export function buildMinimalPdf(lines: string[]): Buffer {
  const streamLines = lines
    .map((line, i) => {
      const y = 780 - i * 16;
      return `BT /F1 11 Tf 50 ${y} Td (${escapePdf(line)}) Tj ET`;
    })
    .join('\n');
  const stream = `${streamLines}\n`;
  const streamLen = Buffer.byteLength(stream, 'utf8');

  const objects: string[] = [];
  objects.push('1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n');
  objects.push('2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n');
  objects.push(
    '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n',
  );
  objects.push(
    `4 0 obj<< /Length ${streamLen} >>stream\n${stream}endstream\nendobj\n`,
  );
  objects.push('5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n');

  let body = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(body, 'utf8'));
    body += obj;
  }
  const xrefPos = Buffer.byteLength(body, 'utf8');
  let xref = `xref\n0 ${objects.length + 1}\n`;
  xref += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  body += xref;
  body += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  body += `startxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(body, 'utf8');
}

export async function writeDemoValuationPdf(
  outPath = path.join(process.cwd(), 'fixtures/demo-package/valuation-sample.pdf'),
): Promise<{ path: string; bytes: number }> {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  const pdf = buildMinimalPdf([
    'Aros Studio Tokenomics (AST) — DEMO PACKAGE',
    'Not a legal instrument. Pilot document-first e2e only.',
    '',
    'Institution: PILOT / DEMO',
    'Document type: Institutional asset valuation annex',
    '',
    'Asset: Sample commercial property (demo)',
    'Address: 1 Demo Street, Tbilisi (fictional)',
    '',
    'Institutional Valuation Amount: 250000.00 USD',
    'Currency: USD',
    'Valuation date: 2026-07-30',
    '',
    'Qualified electronic signature: ATTESTED-DEMO-KEP-20260730',
    'Signer: DEMO-INSTITUTION-KEP',
    '',
    'Hash of package is computed by portal edge (SHA-256).',
    'AST does not re-appraise the asset.',
  ]);
  await fs.writeFile(outPath, pdf);
  return { path: outPath, bytes: pdf.length };
}

const isMain =
  process.argv[1]?.includes('generate-demo-pdf') ||
  process.argv[1]?.endsWith('generate-demo-pdf.ts');

if (isMain) {
  writeDemoValuationPdf()
    .then((r) => {
      console.log(JSON.stringify({ ok: true, ...r }, null, 2));
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
