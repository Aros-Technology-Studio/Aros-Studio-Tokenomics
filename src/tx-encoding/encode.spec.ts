import { encodeProcessTx, payloadHash } from './encode';

describe('tx-encoding', () => {
  it('is deterministic', () => {
    const a = encodeProcessTx({
      processId: 'AST-DEMO-20260718-1',
      processType: 'primary_tokenization',
      body: { b: 2, a: 1 } });
    const b = encodeProcessTx({
      processId: 'AST-DEMO-20260718-1',
      processType: 'primary_tokenization',
      body: { a: 1, b: 2 } });
    expect(a.payloadHash).toBe(b.payloadHash);
    expect(payloadHash({ z: 1, a: 2 })).toBe(payloadHash({ a: 2, z: 1 }));
  });
});
