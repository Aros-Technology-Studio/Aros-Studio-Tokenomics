import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { CommissionService } from './commission.service';
import { CommissionErrorCode } from './errors';
import { FeeScheduleRegistry } from './schedules';

describe('CommissionService (layer 06 full)', () => {
  async function setup() {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    return { nc, commission: new CommissionService(nc), keys };
  }

  it('settles 70/30 post-factum after pot', async () => {
    const { commission } = await setup();
    const r = await commission.settleCommission({
      processId: 'AST-FEE-1',
      valuation: '1000.000000000',
      feeRate: 0.0015,
      nodeWeights: { v1: 1, v2: 1, v3: 1 },
      potVerified: 1,
    });
    expect(r.fee).toBe('1.500000000');
    expect(r.nodesPool).toBe('1.050000000');
    expect(r.astShare).toBe('0.450000000');
    expect(r.split.nodes).toBeCloseTo(0.7);
    expect(r.split.ast).toBeCloseTo(0.3);
    expect(commission.nodeBalance('v1')).toBe('0.350000000');
  });

  it('refuses without pot', async () => {
    const { commission } = await setup();
    await expect(
      commission.settle({
        processId: 'AST-FEE-2',
        valuation: '100.000000000',
        feeRate: 0.0015,
        nodeWeights: { v1: 1 },
        potVerified: 0,
      }),
    ).rejects.toMatchObject({ code: CommissionErrorCode.POT_REQUIRED });
  });

  it('blocks double settlement', async () => {
    const { commission } = await setup();
    await commission.settleCommission({
      processId: 'AST-FEE-3',
      valuation: '100.000000000',
      nodeWeights: { v1: 1 },
      potVerified: 1,
      scheduleId: 'default',
    });
    await expect(
      commission.settleCommission({
        processId: 'AST-FEE-3',
        valuation: '100.000000000',
        nodeWeights: { v1: 1 },
        potVerified: 1,
      }),
    ).rejects.toMatchObject({ code: CommissionErrorCode.ALREADY_SETTLED });
  });

  it('applies fee waiver', async () => {
    const { commission } = await setup();
    const r = await commission.settleCommission({
      processId: 'AST-FEE-4',
      valuation: '1000.000000000',
      feeRate: 0.0015,
      feeWaiver: 1,
      nodeWeights: { v1: 1 },
      potVerified: 1,
    });
    expect(r.fee).toBe('0.000000000');
    expect(r.waiverApplied).toBe(true);
  });

  it('uses named schedule', async () => {
    const { commission } = await setup();
    const r = await commission.settleCommission({
      processId: 'AST-FEE-5',
      valuation: '1000.000000000',
      scheduleId: 'tier_priority',
      nodeWeights: { v1: 1 },
      potVerified: 1,
    });
    expect(r.scheduleId).toBe('tier_priority');
    expect(r.feeRate).toBe(0.003);
    expect(r.fee).toBe('3.000000000');
  });

  it('hydrates node credits from journal', async () => {
    const { nc, commission } = await setup();
    await commission.settleCommission({
      processId: 'AST-FEE-6',
      valuation: '1000.000000000',
      feeRate: 0.0015,
      nodeWeights: { n1: 1 },
      potVerified: 1,
    });
    const c2 = new CommissionService(nc);
    await c2.hydrateFromJournal();
    expect(c2.nodeBalance('n1')).toBe('1.050000000');
  });

  it('lists schedules', () => {
    const reg = new FeeScheduleRegistry();
    expect(reg.list().length).toBeGreaterThanOrEqual(2);
    expect(reg.get('sandbox').feeRate).toBe(0.0015);
  });
});
