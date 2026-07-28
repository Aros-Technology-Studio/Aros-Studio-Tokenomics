import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeDocumentText, roughExtractText } from './document-extract';

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
});
