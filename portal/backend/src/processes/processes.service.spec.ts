import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ProcessesService } from './processes.service';

const hash = 'b'.repeat(64);
const goodBody = {
  processType: 'primary_tokenization' as const,
  valuation: '250000.50',
  holderId: 'holder-1',
  hasQualifiedSignature: true,
  documentPackageHash: hash,
};

describe('ProcessesService (portal edge stub)', () => {
  let svc: ProcessesService;

  beforeEach(() => {
    svc = new ProcessesService();
  });

  it('rejects without institutional valuation', () => {
    const r = svc.create(
      { ...goodBody, valuation: 'not-a-number' },
      'DEMO',
      'idem-00000001',
    );
    assert.equal(r.statusCode, 422);
    assert.equal((r.body as { code: string }).code, 'MISSING_VALUATION');
  });

  it('rejects without qualified signature', () => {
    const r = svc.create(
      { ...goodBody, hasQualifiedSignature: false },
      'DEMO',
      'idem-00000002',
    );
    assert.equal(r.statusCode, 422);
    assert.equal((r.body as { code: string }).code, 'MISSING_QUALIFIED_SIGNATURE');
  });

  it('accepts valid submission and is idempotent', () => {
    const a = svc.create(goodBody, 'DEMO', 'idem-same-key-01');
    assert.equal(a.statusCode, 202);
    const processId = (a.body as { processId: string }).processId;
    assert.match(processId, /^AST-DEMO-\d{8}-[A-Z0-9]+$/i);

    const b = svc.create(goodBody, 'DEMO', 'idem-same-key-01');
    assert.equal(b.statusCode, 202);
    assert.equal((b.body as { processId: string }).processId, processId);
    assert.equal((b.body as { status: string }).status, 'duplicate');
  });

  it('detects idempotency payload mismatch', () => {
    svc.create(goodBody, 'DEMO', 'idem-mismatch-01');
    const r = svc.create(
      { ...goodBody, valuation: '1.0' },
      'DEMO',
      'idem-mismatch-01',
    );
    assert.equal(r.statusCode, 409);
    assert.equal((r.body as { code: string }).code, 'IDEMPOTENCY_PAYLOAD_MISMATCH');
  });
});
