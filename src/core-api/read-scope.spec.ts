import {
  canReadProcess,
  canReadRecord,
  filterNodesForPrincipal,
  isSystemJournalRow,
  publicNodechainReadEnabled,
  resolveReadPrincipal,
} from './read-scope';
import { InstitutionAuthService } from '../intake/institution-auth';
import type { JournalRecord } from '../nodechain/types';

function rec(partial: Partial<JournalRecord> & Pick<JournalRecord, 'recordType'>): JournalRecord {
  return {
    recordId: partial.recordId ?? 'r1',
    schemaVersion: 'nc-record-1',
    recordType: partial.recordType,
    processId: partial.processId ?? null,
    writerId: 'w',
    writerRole: 'system',
    timestampUtc: new Date().toISOString(),
    prevHash: '0'.repeat(64),
    contentHash: 'a'.repeat(64),
    height: partial.height ?? 0,
    payload: partial.payload ?? {},
    signatures: [],
    envelopeHash: 'b'.repeat(64),
  };
}

describe('read-scope (B3)', () => {
  const auth = new InstitutionAuthService([
    { institutionId: 'DEMO', token: 'demo-token', allowlisted: true },
    { institutionId: 'BANK', token: 'bank-token', allowlisted: true },
  ]);

  beforeEach(() => {
    delete process.env.AST_OPS_READ_TOKEN;
    process.env.AST_NODECHAIN_PUBLIC_READ = '1';
  });

  it('resolves institution principal', () => {
    const p = resolveReadPrincipal(
      { institutionId: 'demo', institutionToken: 'demo-token' },
      auth,
    );
    expect(p).toEqual({ kind: 'institution', institutionId: 'DEMO' });
  });

  it('rejects bad institution token', () => {
    expect(() =>
      resolveReadPrincipal({ institutionId: 'DEMO', institutionToken: 'wrong' }, auth),
    ).toThrow();
  });

  it('resolves ops principal', () => {
    process.env.AST_OPS_READ_TOKEN = 'ops-secret';
    const p = resolveReadPrincipal({ opsToken: 'ops-secret' }, auth);
    expect(p.kind).toBe('ops');
  });

  it('institution can only read own process', () => {
    const inst = { kind: 'institution' as const, institutionId: 'DEMO' };
    expect(canReadProcess(inst, 'AST-DEMO-20260730-abc123def456')).toBe(true);
    expect(canReadProcess(inst, 'AST-BANK-20260730-abc123def456')).toBe(false);
  });

  it('system records readable by institution', () => {
    const inst = { kind: 'institution' as const, institutionId: 'DEMO' };
    expect(canReadRecord(inst, rec({ recordType: 'genesis', processId: null }))).toBe(true);
    expect(
      canReadRecord(
        inst,
        rec({
          recordType: 'process_open',
          processId: 'AST-BANK-20260730-abc123def456',
        }),
      ),
    ).toBe(false);
  });

  it('filters nodes list for institution', () => {
    const inst = { kind: 'institution' as const, institutionId: 'DEMO' };
    const nodes = [
      { height: 2, type: 'process_open', processId: 'AST-BANK-20260730-abc123def456', payload: { x: 1 } },
      { height: 1, type: 'process_open', processId: 'AST-DEMO-20260730-abc123def456', payload: { y: 2 } },
      { height: 0, type: 'genesis', processId: null as string | null, payload: {} },
    ];
    const f = filterNodesForPrincipal(inst, nodes);
    expect(f.map((n) => n.height)).toEqual([1, 0]);
  });

  it('isSystemJournalRow', () => {
    expect(isSystemJournalRow({ processId: null, recordType: 'genesis' })).toBe(true);
    expect(
      isSystemJournalRow({ processId: 'AST-DEMO-20260730-abc123def456', type: 'process_open' }),
    ).toBe(false);
  });

  it('public read flag', () => {
    process.env.AST_NODECHAIN_PUBLIC_READ = '0';
    expect(publicNodechainReadEnabled()).toBe(false);
    const anon = { kind: 'anonymous' as const };
    expect(canReadProcess(anon, 'AST-DEMO-20260730-abc123def456')).toBe(false);
  });
});
