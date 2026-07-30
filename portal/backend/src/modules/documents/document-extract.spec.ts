import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeDocumentText,
  extractFromBuffer,
  roughExtractText,
} from './document-extract';
import { detectImageKind } from './ocr';

describe('document-extract', () => {
  it('suggests largest amount as valuation', () => {
    const text = `
      Property extract
      Owner: ACME-HOLD-001
      Cadastral id: 01:02:000345
      Market valuation: 1,250,000.50 GEL
      Fee: 150.00
    `;
    const h = analyzeDocumentText(text);
    assert.ok(h.suggestedValuation);
    assert.ok(Number(h.suggestedValuation) >= 1000);
    assert.equal(h.suggestedHolderId, 'ACME-HOLD-001');
    assert.ok(h.suggestedAssetId);
  });

  it('handles empty', () => {
    const h = analyzeDocumentText('');
    assert.equal(h.mode, 'empty');
    assert.equal(h.suggestedValuation, null);
  });

  it('roughExtractText finds printable runs', () => {
    const buf = Buffer.from('%PDF-1.4\n(Hello Valuation 99999.50)\n');
    const t = roughExtractText(buf);
    assert.ok(t.includes('99999') || t.includes('Hello'));
  });

  it('D5 detects PNG magic and returns image_no_ocr without engine', () => {
    // Minimal PNG header + IHDR-ish noise (not a valid full PNG — enough for magic)
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde,
    ]);
    assert.equal(detectImageKind(png, 'scan.png'), 'png');
    const prev = process.env.AST_OCR_DISABLED;
    process.env.AST_OCR_DISABLED = '1';
    try {
      const h = extractFromBuffer(png, 'scan.png');
      assert.equal(h.mode, 'image_no_ocr');
      assert.ok(h.notes.some((n) => /OCR|image/i.test(n)));
    } finally {
      if (prev === undefined) delete process.env.AST_OCR_DISABLED;
      else process.env.AST_OCR_DISABLED = prev;
    }
  });

  it('D5 scan_suspect when PDF has almost no text', () => {
    const buf = Buffer.from('%PDF-1.4\n% binary\x00\x01\x02\x03\n');
    const h = extractFromBuffer(buf, 'scan.pdf');
    assert.ok(h.mode === 'scan_suspect' || h.mode === 'empty');
  });
});
