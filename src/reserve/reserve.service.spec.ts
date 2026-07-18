import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { ReserveService } from './reserve.service';
import { ReserveErrorCode } from './errors';
import { computeReserveIndex } from './index-math';

describe('ReserveService (layer 07 full)', () => {
  async function setup() {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    return { nc, reserve: new ReserveService(nc) };
  }

  it('accrues AST share and grows reserveIndex', async () => {
    const { reserve } = await setup();
    const before = reserve.reserveIndex();
    const out = await reserve.accrueFromCommission({
      processId: 'AST-RES-1',
      astShare: '0.450000000',
      processValuation: '1000.000000000',
    });
    expect(out.ownBalance).toBe('0.450000000');
    expect(out.reserveIndex).toBeGreaterThan(before);
    expect(reserve.snapshot().claims).toHaveLength(1);
  });

  it('blocks double accrual per process', async () => {
    const { reserve } = await setup();
    await reserve.accrueFromCommission({
      processId: 'AST-RES-2',
      astShare: '0.100000000',
      processValuation: '100.000000000',
    });
    await expect(
      reserve.accrueFromCommission({
        processId: 'AST-RES-2',
        astShare: '0.100000000',
        processValuation: '100.000000000',
      }),
    ).rejects.toMatchObject({ code: ReserveErrorCode.DOUBLE_ACCRUAL });
  });

  it('partial release hard-fails if insufficient', async () => {
    const { reserve } = await setup();
    await reserve.accrueFromCommission({
      processId: 'AST-RES-3',
      astShare: '1.000000000',
      processValuation: '100.000000000',
    });
    await expect(
      reserve.partialRelease({
        processId: 'AST-RES-3-rel',
        amount: '5.000000000',
      }),
    ).rejects.toMatchObject({ code: ReserveErrorCode.INSUFFICIENT });
  });

  it('partial release reduces balance and journals child claim', async () => {
    const { reserve, nc } = await setup();
    const acc = await reserve.accrueFromCommission({
      processId: 'AST-RES-4',
      astShare: '2.000000000',
      processValuation: '200.000000000',
    });
    const rel = await reserve.partialRelease({
      processId: 'AST-RES-4-rel',
      amount: '0.500000000',
      parentClaimId: acc.claimId,
      reason: 'ops',
    });
    expect(rel.ownBalance).toBe('1.500000000');
    const rows = await nc.listByProcessId('AST-RES-4-rel');
    expect(rows.some((r) => r.recordType === 'reserve_release')).toBe(true);
  });

  it('hydrates from journal', async () => {
    const { nc, reserve } = await setup();
    await reserve.accrueFromCommission({
      processId: 'AST-RES-5',
      astShare: '0.300000000',
      processValuation: '300.000000000',
    });
    const r2 = new ReserveService(nc);
    await r2.hydrateFromJournal();
    expect(r2.ownBalance()).toBe('0.300000000');
    expect(r2.reserveIndex()).toBeGreaterThan(0);
  });

  it('index math matches canon form', () => {
    // volume 999 arx = 0.000000999 ARO → log10(1+eps) small
    const idx = computeReserveIndex(1_000_000_000n); // 1 ARO
    expect(idx).toBeCloseTo(Math.log10(2), 10);
  });
});
