import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EnrichmentService } from './enrichment.service';

describe('EnrichmentService', () => {
  it('mock returns signals and disclaimer', async () => {
    process.env.AST_ENRICHMENT_PROVIDER = 'mock';
    const s = new EnrichmentService();
    const r = await s.check({
      institutionId: 'PILOT',
      assetType: 'real_estate',
      holderId: 'H1',
      assetId: 'A1',
      documentPackageHash: 'a'.repeat(64),
      amountFromDocument: '100000.00',
      currency: 'USD',
    });
    assert.equal(r.ok, true);
    assert.equal(r.provider, 'mock');
    assert.ok(r.enrichmentId.startsWith('enrich-'));
    assert.ok(['unknown', 'likely', 'mismatch'].includes(r.signals.identityMatch));
    assert.ok(r.disclaimer.toLowerCase().includes('does not appraise'));
  });
});
