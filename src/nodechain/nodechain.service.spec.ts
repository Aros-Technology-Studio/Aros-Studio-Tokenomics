import { MemoryLedgerStore } from './memory-ledger.store';
import { NodechainService } from './nodechain.service';

describe('NodechainService (Phase 1.1 core)', () => {
  let service: NodechainService;
  let store: MemoryLedgerStore;

  beforeEach(() => {
    store = new MemoryLedgerStore();
    service = new NodechainService(store);
  });

  it('appends linear chain with ExecutionSnapshot and content hashing', () => {
    const a = service.append({
      writerRole: 'internal_service',
      recordType: 'state_entry',
      payload: { n: 1 },
      processId: 'AST-DEMO-20260716-p1',
    });
    const b = service.append({
      writerRole: 'quorum_validator',
      recordType: 'state_entry',
      payload: { n: 2 },
      processId: 'AST-DEMO-20260716-p1',
    });

    expect(a.height).toBe(1);
    expect(b.height).toBe(2);
    expect(b.prevHash).toBe(a.contentHash);

    const recA = service.getByHeight(1)!;
    expect(recA.snapshot.hash).toBe(a.contentHash);
    expect(recA.snapshot.prevHash).toBe(a.prevHash);
    expect(service.verifyIntegrity().ok).toBe(true);
  });

  it('rejects unauthorized writers (fail-closed)', () => {
    expect(() =>
      service.append({
        writerRole: 'anonymous' as 'internal_service',
        recordType: 'x',
        payload: {},
      }),
    ).toThrow(/unauthorized/i);
  });

  it('scopes institution read to own processId only', () => {
    service.append({
      writerRole: 'internal_service',
      processId: 'P-A',
      recordType: 't',
      payload: { a: 1 },
    });
    service.append({
      writerRole: 'internal_service',
      processId: 'P-B',
      recordType: 't',
      payload: { b: 1 },
    });

    const own = service.read('own_process', { processId: 'P-A' });
    expect(own).toHaveLength(1);
    expect(own[0].processId).toBe('P-A');

    const all = service.read('eye_or_audit', {});
    expect(all).toHaveLength(2);
  });

  it('requires processId for own_process scope', () => {
    expect(() => service.read('own_process', {})).toThrow(/processId/i);
  });

  it('encrypts sensitive payload at rest and decrypts on read', () => {
    service.append({
      writerRole: 'internal_service',
      processId: 'P-S',
      recordType: 'sensitive_doc',
      payload: { secret: 'value-1' },
      sensitive: true,
    });
    const raw = store.getByHeight(1)!;
    expect(raw.sensitiveEncrypted).toBe(true);
    expect((raw.payload as { ciphertext?: string }).ciphertext).toBeDefined();

    const read = service.listOwnProcess('P-S');
    expect(read[0].payload).toEqual({ secret: 'value-1' });
  });

  it('is immediately immutable (no update API; chain verifies)', () => {
    service.append({
      writerRole: 'internal_service',
      recordType: 't',
      payload: { x: 1 },
    });
    expect(service.verifyIntegrity().ok).toBe(true);
    // Tamper simulation
    const rec = store.getByHeight(1)!;
    (rec as { payload: unknown }).payload = { x: 999 };
    expect(service.verifyIntegrity().ok).toBe(false);
  });
});
