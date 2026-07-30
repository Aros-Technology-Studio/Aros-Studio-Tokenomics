import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { MemoryIndexMirror } from './index-mirror';

describe('MemoryIndexMirror', () => {
  it('replays journal into process queries', async () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    await nc.append({
      recordType: 'process_open',
      processId: 'AST-IDX-20260730-abc123def456',
      payload: { x: 1 },
      writerId: 'orchestrator',
      writerRole: 'orchestrator',
    });
    const mirror = new MemoryIndexMirror();
    const { count } = await mirror.replayFrom(nc);
    expect(count).toBeGreaterThanOrEqual(2);
    const rows = await mirror.getByProcessId('AST-IDX-20260730-abc123def456');
    expect(rows).toHaveLength(1);
    expect(rows[0].recordType).toBe('process_open');
  });

  it('continuous upsert + status lag (B6)', async () => {
    const keys = bootstrapPipelineKeys();
    const mirror = new MemoryIndexMirror();
    const nc = new NodechainService(new MemoryJournalStore(), {
      keys,
      onRecordAppended: (r) => mirror.upsert(r),
    });
    await nc.ensureGenesis('system');
    await nc.append({
      recordType: 'system_boot',
      payload: { n: 1 },
      writerId: 'system',
      writerRole: 'system',
    });
    const st = await mirror.getStatus!(nc);
    expect(st.kind).toBe('memory');
    expect(st.ready).toBe(true);
    expect(st.journalHeight).toBe(1);
    expect(st.mirrorMaxHeight).toBe(1);
    expect(st.lagHeights).toBe(0);
    expect(st.recordCount).toBe(2);
  });
});
