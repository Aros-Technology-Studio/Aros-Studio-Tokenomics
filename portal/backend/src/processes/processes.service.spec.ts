import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ProcessesService } from './processes.service';
import { CoreApiClient } from '../core-client';

const hash = 'b'.repeat(64);
const goodBody = {
  processType: 'primary_tokenization' as const,
  valuation: '250000.50',
  holderId: 'holder-1',
  hasQualifiedSignature: true,
  documentPackageHash: hash,
};

class StubCore extends CoreApiClient {
  constructor(private readonly mode: 'ok' | 'down' | 'off') {
    super({ baseUrl: 'http://core.test' });
  }
  override get enabled() {
    return this.mode !== 'off';
  }
  override async createProcess() {
    if (this.mode === 'down') {
      return { statusCode: 503, body: { code: 'CORE_UNAVAILABLE', message: 'down' } };
    }
    return {
      statusCode: 202,
      body: {
        processId: 'AST-DEMO-20260719-fromcore',
        status: 'completed',
        mint: { amount: '250000.500000000' },
        verdict: { verified: 1 },
      },
    };
  }
  override async getProcess(processId: string) {
    if (this.mode === 'down') {
      return { statusCode: 503, body: { code: 'CORE_UNAVAILABLE' } };
    }
    return {
      statusCode: 200,
      body: { processId, status: 'settled', potVerified: 1, source: 'core' },
    };
  }
}

describe('ProcessesService (institutional portal edge)', () => {
  it('rejects without valuation / signature', async () => {
    const svc = new ProcessesService(new StubCore('off'));
    const r = await svc.create(
      { ...goodBody, hasQualifiedSignature: false },
      'DEMO',
      'idem-00000002',
    );
    assert.equal(r.statusCode, 422);
    assert.equal((r.body as { code: string }).code, 'MISSING_QUALIFIED_SIGNATURE');
  });

  it('hands off to core when available', async () => {
    const svc = new ProcessesService(new StubCore('ok'));
    const r = await svc.create(goodBody, 'DEMO', 'idem-core-ok-0001', 'demo-token');
    assert.equal(r.statusCode, 202);
    assert.equal(r.body.status, 'submitted_to_core');
    assert.ok(r.body.core);
  });

  it('lists processes for institution', async () => {
    const svc = new ProcessesService(new StubCore('off'));
    await svc.create(goodBody, 'DEMO', 'idem-list-0001');
    await svc.create(
      { ...goodBody, holderId: 'h2' },
      'DEMO',
      'idem-list-0002',
    );
    const list = svc.listForInstitution('DEMO');
    assert.equal(list.length, 2);
    assert.equal(svc.listForInstitution('ACME').length, 0);
  });

  it('keeps awaiting_core when core down (no edge mint)', async () => {
    const svc = new ProcessesService(new StubCore('down'));
    const r = await svc.create(goodBody, 'DEMO', 'idem-core-down-01');
    assert.equal(r.statusCode, 202);
    assert.equal(r.body.status, 'awaiting_core');
    assert.ok(r.body.coreError);
  });
});
