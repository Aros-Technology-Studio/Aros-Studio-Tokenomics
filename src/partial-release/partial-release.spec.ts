import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { ProcessService } from '../processing/process.service';
import { PotService } from '../pot/pot.service';
import { ArosCoinService } from '../aroscoin/aroscoin.service';
import { ReserveService } from '../reserve/reserve.service';
import { EncodingService } from '../tx-encoding/encoding.service';
import { PartialReleaseService } from './partial-release.service';
import { PartialReleaseErrorCode } from './errors';

async function journalOkToEmit(nc: NodechainService, processId: string) {
  await nc.append({
    clientRecordId: `pot-evidence:${processId}`,
    recordType: 'pot_evidence',
    processId,
    payload: {},
    writerId: 'pot',
    writerRole: 'pot',
  });
  await nc.append({
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
}

describe('PartialReleaseService', () => {
  async function setup() {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    const processes = new ProcessService(nc, new EncodingService());
    const pot = new PotService(nc);
    const aroscoin = new ArosCoinService(nc);
    const reserve = new ReserveService(nc);
    const pr = new PartialReleaseService(nc, processes, pot, aroscoin, reserve, keys);
    return { nc, processes, pot, aroscoin, reserve, pr, keys };
  }

  it('burns, creates reserve child, remints remainder after PoT', async () => {
    const { nc, aroscoin, reserve, pr } = await setup();
    // Fund holder via primary mint path
    const mintPid = 'AST-DEMO-20260719-prm1';
    await journalOkToEmit(nc, mintPid);
    await aroscoin.mintAfterPot({
      processId: mintPid,
      holderId: 'h1',
      amount: '100.000000000',
      potVerified: 1,
      potLedgerHeight: 2,
    });
    // Fund AST reserve for child release
    await reserve.accrueFromCommission({
      processId: 'AST-DEMO-20260719-rsv1',
      astShare: '50.000000000',
      processValuation: '1000.000000000',
    });

    const r = await pr.run({
      processId: 'AST-DEMO-20260719-pr1',
      institutionId: 'DEMO',
      holderId: 'h1',
      releaseAmount: '30.000000000',
      idempotencyKey: 'idem-partial-release-001',
      holderApproved: true,
      institutionApproved: true,
    });

    expect(r.releaseAmount).toBe('30.000000000');
    expect(r.remintAmount).toBe('70.000000000');
    expect(r.burn.amount).toBe('100.000000000'); // full balance burn
    expect(r.reserveChild.amount).toBe('30.000000000');
    expect(r.remint?.amount).toBe('70.000000000');
    expect(aroscoin.balanceOf('h1')).toBe('70.000000000');

    const rows = await nc.listByProcessId('AST-DEMO-20260719-pr1');
    expect(rows.some((x) => x.recordType === 'burn_fact')).toBe(true);
    expect(rows.some((x) => x.recordType === 'reserve_release')).toBe(true);
    expect(rows.some((x) => x.recordType === 'partial_release_fact')).toBe(true);
  });

  it('requires dual approval', async () => {
    const { pr } = await setup();
    await expect(
      pr.run({
        institutionId: 'DEMO',
        holderId: 'h1',
        releaseAmount: '1.0',
        idempotencyKey: 'idem-partial-fail-001',
        holderApproved: false,
        institutionApproved: true,
      }),
    ).rejects.toMatchObject({ code: PartialReleaseErrorCode.APPROVAL_REQUIRED });
  });
});
