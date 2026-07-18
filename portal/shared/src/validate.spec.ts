import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateCreateProcess } from './validate';
import { isValidProcessId, makeProcessId } from './process-id';
import { payloadFingerprint } from './idempotency';

describe('portal shared admission', () => {
  it('accepts valid create body', () => {
    const err = validateCreateProcess(
      {
        processType: 'primary_tokenization',
        valuation: '100.000000000',
        holderId: 'h1',
        hasQualifiedSignature: true,
        documentPackageHash: 'a'.repeat(64),
      },
      'idem-key-001',
      'DEMO',
    );
    assert.equal(err, null);
  });

  it('rejects missing valuation and signature', () => {
    const err = validateCreateProcess(
      {
        processType: 'primary_tokenization',
        valuation: '',
        holderId: 'h1',
        hasQualifiedSignature: false,
        documentPackageHash: 'a'.repeat(64),
      } as never,
      'idem-key-001',
      'DEMO',
    );
    assert.ok(err);
    assert.equal(err!.code, 'MISSING_VALUATION');
  });

  it('processId aligns with Core pattern', () => {
    const id = makeProcessId('DEMO');
    assert.equal(isValidProcessId(id), true);
    assert.equal(isValidProcessId('AST-BAD'), false);
  });

  it('fingerprint is order-independent', () => {
    const a = payloadFingerprint({ b: 1, a: 2 });
    const b = payloadFingerprint({ a: 2, b: 1 });
    assert.equal(a, b);
  });
});
