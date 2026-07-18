import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { CommissionService } from './commission.service';

describe('CommissionService (layer 06)', () => {
  it('settles 70/30 post-factum after pot', async () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), {
      keys });
    await nc.ensureGenesis('system');
    const c = new CommissionService(nc);
    const r = await c.settle({
      processId: 'AST-FEE-1',
      valuation: '1000.000000000',
      feeRate: 0.0015,
      nodeWeights: { v1: 1, v2: 1, v3: 1 },
      potVerified: 1 });
    expect(r.fee).toBe('1.500000000');
    expect(r.nodesPool).toBe('1.050000000');
    expect(r.astShare).toBe('0.450000000');
    expect(r.split).toEqual({ nodes: 0.7, ast: 0.3 });
    const rows = await nc.listByProcessId('AST-FEE-1');
    expect(rows.some((x) => x.recordType === 'commission_settled')).toBe(true);
    expect(rows.filter((x) => x.recordType === 'payment_credited')).toHaveLength(3);
  });

  it('refuses settle without pot', async () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), {
      keys });
    await nc.ensureGenesis('system');
    const c = new CommissionService(nc);
    await expect(
      c.settle({
        processId: 'AST-FEE-2',
        valuation: '100.000000000',
        feeRate: 0.0015,
        nodeWeights: { v1: 1 },
        potVerified: 0 }),
    ).rejects.toThrow(/pot not verified/);
  });
});
