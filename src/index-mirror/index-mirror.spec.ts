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
      processId: 'AST-IDX-1',
      payload: { x: 1 },
      writerId: 'orchestrator',
      writerRole: 'orchestrator' });
    const mirror = new MemoryIndexMirror();
    const { count } = await mirror.replayFrom(nc);
    expect(count).toBeGreaterThanOrEqual(2);
    const rows = await mirror.getByProcessId('AST-IDX-1');
    expect(rows).toHaveLength(1);
    expect(rows[0].recordType).toBe('process_open');
  });
});
