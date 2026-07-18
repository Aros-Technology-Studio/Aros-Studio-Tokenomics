import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { ReserveService } from './reserve.service';

describe('ReserveService (layer 07)', () => {
  it('accrues AST own share only and grows reserveIndex', async () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), {
      keys });
    await nc.ensureGenesis('system');
    const r = new ReserveService(nc);
    const before = r.reserveIndex();
    const out = await r.accrueFromCommission({
      processId: 'AST-RES-1',
      astShare: '0.450000000',
      processValuation: '1000.000000000' });
    expect(out.ownBalance).toBe('0.450000000');
    expect(out.reserveIndex).toBeGreaterThan(before);
  });
});
