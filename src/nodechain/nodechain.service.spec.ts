import { NodechainService } from './nodechain.service';
import { MemoryJournalStore } from './memory.store';
import { NodeChainError, NcErrorCode } from './errors';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';

describe('NodechainService', () => {
  let nc: NodechainService;

  beforeEach(() => {
    const keys = bootstrapPipelineKeys();
    nc = new NodechainService(new MemoryJournalStore(), {
      keys });
  });

  it('writes genesis at height 0', async () => {
    const g = await nc.ensureGenesis('system');
    expect(g.height).toBe(0);
    const tip = await nc.getTip();
    expect(tip?.height).toBe(0);
    const v = await nc.verifyChain();
    expect(v.ok).toBe(true);
  });

  it('writes first operational record after genesis', async () => {
    await nc.ensureGenesis();
    const first = await nc.append({
      clientRecordId: 'first-boot',
      recordType: 'system_boot',
      payload: {
        event: 'first_journal_record',
        layer: '01_NodeChain',
        note: 'journal is live' },
      writerId: 'system',
      writerRole: 'system' });
    expect(first.height).toBe(1);
    const rec = await nc.getByHeight(1);
    expect(rec?.recordType).toBe('system_boot');
    expect(rec?.prevHash).toBe((await nc.getByHeight(0))!.envelopeHash);
    const v = await nc.verifyChain();
    expect(v.ok).toBe(true);
    expect(v.height).toBe(1);
  });

  it('rejects process-scoped type without processId', async () => {
    await nc.ensureGenesis();
    await expect(
      nc.append({
        recordType: 'process_open',
        payload: {},
        writerId: 'orchestrator',
        writerRole: 'orchestrator' }),
    ).rejects.toMatchObject({ code: NcErrorCode.PROCESS_REQUIRED });
  });

  it('is idempotent on clientRecordId', async () => {
    await nc.ensureGenesis();
    const a = await nc.append({
      clientRecordId: 'idem-1',
      recordType: 'system_boot',
      payload: { n: 1 },
      writerId: 'system',
      writerRole: 'system' });
    const b = await nc.append({
      clientRecordId: 'idem-1',
      recordType: 'system_boot',
      payload: { n: 1 },
      writerId: 'system',
      writerRole: 'system' });
    expect(b.recordId).toBe(a.recordId);
    expect(b.height).toBe(a.height);
  });

  it('fails closed without genesis', async () => {
    await expect(
      nc.append({
        recordType: 'system_boot',
        payload: {},
        writerId: 'system',
        writerRole: 'system' }),
    ).rejects.toBeInstanceOf(NodeChainError);
  });

  it('memory ledger is append-only (no height overwrite, records frozen)', async () => {
    await nc.ensureGenesis();
    const a = await nc.append({
      clientRecordId: 'append-only-1',
      recordType: 'system_boot',
      payload: { n: 1 },
      writerId: 'system',
      writerRole: 'system',
    });
    const rec = await nc.getByHeight(a.height);
    expect(rec).toBeTruthy();
    expect(Object.isFrozen(rec)).toBe(true);
    expect(() => {
      (rec as { recordType: string }).recordType = 'tamper';
    }).toThrow();
    // cannot re-append same height via store — chain tip advances only by append
    const tip1 = await nc.getTip();
    await nc.append({
      clientRecordId: 'append-only-2',
      recordType: 'system_boot',
      payload: { n: 2 },
      writerId: 'system',
      writerRole: 'system',
    });
    const tip2 = await nc.getTip();
    expect(tip2!.height).toBe(tip1!.height + 1);
  });
});
