import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { ProcessService } from '../processing/process.service';
import { PotService } from './pot.service';
import { PotError } from './types';
import { PotReason } from './reason-codes';
import { ValidatorRegistry } from './validator-registry';

describe('PotService (deep)', () => {
  async function setup(potConfig: ConstructorParameters<typeof PotService>[1] = {}) {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    await nc.ensureGenesis('system');
    const processes = new ProcessService(nc);
    const validators = new ValidatorRegistry();
    validators.registerMany(['v1', 'v2', 'v3']);
    const pot = new PotService(nc, potConfig, validators);
    return { nc, processes, pot, keys, validators };
  }

  async function openOk(
    processes: ProcessService,
    processId: string,
    flags: Partial<{
      institutionAllowlisted: boolean;
      hasDocuments: boolean;
      hasQualifiedSignature: boolean;
    }> = {},
  ) {
    return processes.open({
      processId,
      processType: 'primary_tokenization',
      institutionId: 'DEMO',
      valuation: '50.000000000',
      holderId: 'h1',
      institutionAllowlisted: flags.institutionAllowlisted ?? true,
      hasDocuments: flags.hasDocuments ?? true,
      hasQualifiedSignature: flags.hasQualifiedSignature ?? true,
    });
  }

  it('verified=1 with signed attestations + ordered evidence/verdict', async () => {
    const { nc, processes, pot, keys } = await setup();
    const p = await openOk(processes, 'AST-DEMO-20260718-potok1');
    const v = await pot.verify({
      process: p,
      confirmers: ['v1', 'v2', 'v3'],
      validatorIds: ['v1', 'v2', 'v3'],
      keys,
    });
    expect(v.verified).toBe(1);
    expect(v.final).toBe(true);
    expect(v.attestationDigest.length).toBe(64);
    expect(v.evidenceHeight).toBeLessThan(v.ledgerHeight);
    const rows = await nc.listByProcessId('AST-DEMO-20260718-potok1');
    expect(rows.some((r) => r.recordType === 'pot_evidence')).toBe(true);
    expect(rows.some((r) => r.recordType === 'pot_verdict')).toBe(true);
  });

  it('blocks positive when challenge open', async () => {
    const { processes, pot, keys } = await setup();
    const p = await openOk(processes, 'AST-DEMO-20260718-potch1');
    await pot.openChallenge(p.processId, 'v1', 'suspicious package');
    const v = await pot.verify({
      process: p,
      confirmers: ['v1', 'v2', 'v3'],
      validatorIds: ['v1', 'v2', 'v3'],
      keys,
    });
    expect(v.verified).toBe(0);
    expect(v.challengeBlocked).toBe(true);
    expect(v.reasonCodes).toContain(PotReason.CHALLENGE_OPEN);
  });

  it('allows after challenge closed', async () => {
    const { processes, pot, keys } = await setup();
    const p = await openOk(processes, 'AST-DEMO-20260718-potch2');
    await pot.openChallenge(p.processId, 'v1', 'check');
    await pot.closeChallenge(p.processId, 'committee', 'resolved');
    const v = await pot.verify({
      process: p,
      confirmers: ['v1', 'v2', 'v3'],
      validatorIds: ['v1', 'v2', 'v3'],
      keys,
    });
    expect(v.verified).toBe(1);
  });

  it('excludes suspended validators from eligible set', async () => {
    const { processes, pot, keys, validators } = await setup();
    validators.suspend('v3', 'timeout');
    const p = await openOk(processes, 'AST-DEMO-20260718-potsus1');
    // only v1,v2 active of proposed 3 — K=2 < kMin after filter
    const v = await pot.verify({
      process: p,
      confirmers: ['v1', 'v2'],
      validatorIds: ['v1', 'v2', 'v3'],
      keys,
    });
    // eligible is active only → K=2 → QUORUM_K_BELOW_MIN
    expect(v.verified).toBe(0);
    expect(v.reasonCodes).toContain(PotReason.QUORUM_K_BELOW_MIN);
  });

  it('verified=0 P1 not allowlisted', async () => {
    const { processes, pot, keys } = await setup();
    const p = await openOk(processes, 'AST-DEMO-20260718-potfail1', { institutionAllowlisted: false });
    const v = await pot.verify({
      process: p,
      confirmers: ['v1', 'v2', 'v3'],
      keys,
    });
    expect(v.verified).toBe(0);
    expect(v.reasonCodes).toContain(PotReason.P1_INSTITUTION_NOT_ALLOWLISTED);
  });

  it('verified=0 when all attestation signatures invalid', async () => {
    const { processes, pot, keys } = await setup();
    const p = await openOk(processes, 'AST-DEMO-20260718-potbad2');
    const tip = await (pot as unknown as { nodechain: NodechainService }).nodechain.getTip();
    const atts = pot.createAttestations(
      keys,
      p,
      tip!.tipHash,
      tip!.height,
      ['v1', 'v2', 'v3'],
      {
        institutionAllowlisted: true,
        hasDocuments: true,
        hasQualifiedSignature: true,
        stagesCompleted: ['opened', 'documents', 'encoded'],
      },
    );
    for (const a of atts) {
      a.signature = Buffer.from('deadbeefdeadbeef').toString('base64');
    }
    const v = await pot.verify({
      process: p,
      attestations: atts,
      validatorIds: ['v1', 'v2', 'v3'],
      keys,
    });
    expect(v.verified).toBe(0);
    expect(v.confirmers).toHaveLength(0);
  });

  it('timeout', async () => {
    const { processes, pot, keys, nc } = await setup({ timeoutMs: 1 });
    const p = await openOk(processes, 'AST-DEMO-20260718-potto1');
    await new Promise((r) => setTimeout(r, 5));
    const pot2 = new PotService(nc, { timeoutMs: 1 }, pot.validators);
    const v = await pot2.verify({
      process: p,
      confirmers: ['v1', 'v2', 'v3'],
      keys,
    });
    expect(v.verified).toBe(0);
    expect(v.expired).toBe(true);
    expect(v.reasonCodes).toContain(PotReason.POT_TIMEOUT);
  });

  it('double final throws', async () => {
    const { processes, pot, keys } = await setup();
    const p = await openOk(processes, 'AST-DEMO-20260718-potdup1');
    await pot.verify({ process: p, confirmers: ['v1', 'v2', 'v3'], keys });
    await expect(
      pot.verify({ process: p, confirmers: ['v1', 'v2', 'v3'], keys }),
    ).rejects.toBeInstanceOf(PotError);
  });
});
