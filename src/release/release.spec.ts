import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { ReserveService } from '../reserve/reserve.service';
import { ArosCoinService } from '../aroscoin/aroscoin.service';
import { ReleaseDaemon } from './release-daemon';
import { assertInternalCirculation } from './release-gate';
import { InvariantError } from '../invariants';
import { VelocityTracker } from './velocity-tracker';

describe('Release stack (velocity + daemon + gate)', () => {
  async function setup(threshold = 0, target = 0) {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    const reserve = new ReserveService(nc);
    const aroscoin = new ArosCoinService(nc);
    const daemon = new ReleaseDaemon(nc, reserve, aroscoin, { threshold, target });
    return { nc, reserve, aroscoin, daemon, keys };
  }

  it('velocity is processVolume_24h / supply', async () => {
    const { nc } = await setup();
    await nc.append({
      clientRecordId: 'mint-v',
      recordType: 'mint_fact',
      processId: 'AST-DEMO-20260719-vel1',
      payload: { amount: '100.000000000' },
      writerId: 'token',
      writerRole: 'token',
    });
    const v = await new VelocityTracker(nc).compute('100.000000000');
    expect(v.velocity).toBeGreaterThan(0);
  });

  it('daemon activates when reserveIndex and velocity exceed config', async () => {
    const { nc, reserve, daemon } = await setup(0, 0);
    await reserve.accrueFromCommission({
      processId: 'AST-DEMO-20260719-rel1',
      astShare: '1.000000000',
      processValuation: '1000.000000000',
    });
    // process_open volume for velocity
    await nc.append({
      clientRecordId: 'po-rel',
      recordType: 'process_open',
      processId: 'AST-DEMO-20260719-rel2',
      payload: { valuation: '1000.000000000' },
      writerId: 'orchestrator',
      writerRole: 'orchestrator',
    });
    await nc.append({
      clientRecordId: 'mint-rel',
      recordType: 'mint_fact',
      processId: 'AST-DEMO-20260719-rel2',
      payload: { amount: '100.000000000' },
      writerId: 'token',
      writerRole: 'token',
    });

    expect(daemon.isActive()).toBe(false);
    const st = await daemon.tick();
    expect(st.active).toBe(true);
    expect(st.reserveIndex).toBeGreaterThan(0);
    expect(daemon.isActive()).toBe(true);
  });

  it('gate blocks external circulation before release', async () => {
    const { daemon } = await setup(999, 999);
    expect(() =>
      assertInternalCirculation(daemon, 'holder', 'cex_list'),
    ).toThrow(InvariantError);
    expect(() =>
      assertInternalCirculation(daemon, 'holder', 'internal_transfer'),
    ).not.toThrow();
  });
});
