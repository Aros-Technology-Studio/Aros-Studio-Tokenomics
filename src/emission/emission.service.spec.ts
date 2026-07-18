import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { ArosCoinService } from '../aroscoin/aroscoin.service';
import { EmissionService } from './emission.service';
import { EmissionErrorCode } from './errors';

async function journalOkToEmit(nc: NodechainService, processId: string): Promise<number> {
  await nc.append({
    clientRecordId: `pot-evidence:${processId}`,
    recordType: 'pot_evidence',
    processId,
    payload: {},
    writerId: 'pot',
    writerRole: 'pot',
  });
  const v = await nc.append({
    clientRecordId: `pot-verdict:${processId}`,
    recordType: 'pot_verdict',
    processId,
    payload: {
      verified: 1,
      criteriaResult: { P1: true, P2: true, P3: true, P4: true },
    },
    writerId: 'pot',
    writerRole: 'pot',
  });
  return v.height;
}

describe('EmissionService', () => {
  async function setup() {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    const aroscoin = new ArosCoinService(nc);
    const emission = new EmissionService(nc, aroscoin);
    return { nc, aroscoin, emission };
  }

  it('emits ARO equal to institutional valuation after ok-to-emit', async () => {
    const { nc, aroscoin, emission } = await setup();
    const processId = 'AST-DEMO-20260719-emit1';
    const h = await journalOkToEmit(nc, processId);
    const r = await emission.emitFromValuation({
      processId,
      holderId: 'h1',
      valuation: '100.000000000',
      potLedgerHeight: h,
    });
    expect(r.mode).toBe('primary_valuation');
    expect(r.amount).toBe('100.000000000');
    expect(aroscoin.balanceOf('h1')).toBe('100.000000000');
    expect(aroscoin.totalSupply()).toBe('100.000000000');
    const rows = await nc.listByProcessId(processId);
    expect(rows.some((x) => x.recordType === 'mint_fact')).toBe(true);
    expect(rows.some((x) => x.recordType === 'emission_fact')).toBe(true);
  });

  it('refuses emission without PoT journal gate', async () => {
    const { emission } = await setup();
    await expect(
      emission.emitFromValuation({
        processId: 'AST-DEMO-20260719-emitfail',
        holderId: 'h1',
        valuation: '10.000000000',
      }),
    ).rejects.toMatchObject({ code: EmissionErrorCode.POT_REQUIRED });
  });

  it('burns via aroscoin', async () => {
    const { nc, aroscoin, emission } = await setup();
    const processId = 'AST-DEMO-20260719-emitburn';
    const h = await journalOkToEmit(nc, processId);
    await emission.emitFromValuation({
      processId,
      holderId: 'h1',
      valuation: '10.000000000',
      potLedgerHeight: h,
    });
    const b = await emission.burn({
      processId: 'AST-DEMO-20260719-burn1',
      holderId: 'h1',
      amount: '3.000000000',
    });
    expect(b.mode).toBe('burn');
    expect(aroscoin.balanceOf('h1')).toBe('7.000000000');
  });
});
