import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { FileLedgerStore } from './file-ledger.store';
import { LEDGER_STORE } from './ledger-store.interface';
import { MemoryLedgerStore } from './memory-ledger.store';
import { NodechainService } from './nodechain.service';
import { PostgresIndexMirror } from './postgres-index-mirror';

describe('NodechainService (Phase 1.1–1.2)', () => {
  describe('memory primary', () => {
    let service: NodechainService;
    let store: MemoryLedgerStore;

    beforeEach(() => {
      store = new MemoryLedgerStore();
      service = new NodechainService(store);
    });

    it('appends linear chain with ExecutionSnapshot', () => {
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
      expect(b.prevHash).toBe(a.contentHash);
      expect(service.verifyIntegrity().ok).toBe(true);
    });

    it('rejects unauthorized writers', () => {
      expect(() =>
        service.append({
          writerRole: 'anonymous' as 'internal_service',
          recordType: 'x',
          payload: {},
        }),
      ).toThrow(/unauthorized/i);
    });

    it('scopes own_process vs eye_or_audit', () => {
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
      expect(service.read('own_process', { processId: 'P-A' })).toHaveLength(1);
      expect(service.read('eye_or_audit', {})).toHaveLength(2);
    });

    it('encrypts sensitive payload at rest', () => {
      service.append({
        writerRole: 'internal_service',
        processId: 'P-S',
        recordType: 'sensitive_doc',
        payload: { secret: 'value-1' },
        sensitive: true,
      });
      const raw = store.getByHeight(1)!;
      expect(raw.sensitiveEncrypted).toBe(true);
      expect(service.listOwnProcess('P-S')[0].payload).toEqual({
        secret: 'value-1',
      });
    });
  });

  describe('file durable primary', () => {
    let dir: string;

    beforeEach(() => {
      dir = mkdtempSync(join(tmpdir(), 'ast-ledger-'));
    });

    afterEach(() => {
      rmSync(dir, { recursive: true, force: true });
    });

    it('persists across store re-open', () => {
      const s1 = new FileLedgerStore(dir);
      const svc1 = new NodechainService(s1);
      const receipt = svc1.append({
        writerRole: 'internal_service',
        processId: 'P1',
        recordType: 't',
        payload: { v: 42 },
      });

      const s2 = new FileLedgerStore(dir);
      const svc2 = new NodechainService(s2);
      expect(svc2.getHeight()).toBe(1);
      expect(svc2.getByHeight(1)?.contentHash).toBe(receipt.contentHash);
      expect(svc2.verifyIntegrity().ok).toBe(true);
    });
  });

  describe('postgres mirror is never SoT', () => {
    it('append succeeds when mirror is disabled', () => {
      const store = new MemoryLedgerStore();
      const mirror = new PostgresIndexMirror();
      const service = new NodechainService(store, mirror);
      expect(service.isIndexMirrorEnabled()).toBe(false);
      const r = service.append({
        writerRole: 'internal_service',
        recordType: 't',
        payload: { ok: true },
      });
      expect(r.height).toBe(1);
    });
  });
});

// Ensure DI token constant is exported for modules
describe('LEDGER_STORE token', () => {
  it('is defined', () => {
    expect(LEDGER_STORE).toBeDefined();
  });
});
