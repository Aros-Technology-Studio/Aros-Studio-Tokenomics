import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { ProcessService } from '../processing/process.service';
import { PotService } from './pot.service';
import { PotError } from './types';
import { PotReason } from './reason-codes';

describe('PotService (layer 04 full)', () => {
  async function setup(potConfig: ConstructorParameters<typeof PotService>[1] = {}) {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), {
      keys,
      requireRealCrypto: true,
    });
    await nc.ensureGenesis('system');
    const processes = new ProcessService(nc);
    const pot = new PotService(nc, potConfig);
    return { nc, processes, pot };
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

  it('verified=1 when P1–P4 and quorum hold; evidence then verdict ordered', async () => {
    const { nc, processes, pot } = await setup();
    const p = await openOk(processes, 'AST-POT-OK-1');
    const v = await pot.verify(p, ['v1', 'v2', 'v3']);
    expect(v.verified).toBe(1);
    expect(v.final).toBe(true);
    expect(v.expired).toBe(false);
    expect(v.criteriaResult).toEqual({ P1: true, P2: true, P3: true, P4: true });
    expect(v.reasonCodes).toHaveLength(0);
    expect(v.evidenceHeight).toBeLessThan(v.ledgerHeight);
    expect(v.quorum.ok).toBe(true);

    const rows = await nc.listByProcessId('AST-POT-OK-1');
    const types = rows.map((r) => r.recordType);
    expect(types).toContain('pot_evidence');
    expect(types).toContain('pot_verdict');
    const evH = rows.find((r) => r.recordType === 'pot_evidence')!.height;
    const veH = rows.find((r) => r.recordType === 'pot_verdict')!.height;
    expect(evH).toBeLessThan(veH);
  });

  it('verified=0 with P1 when not allowlisted', async () => {
    const { processes, pot } = await setup();
    const p = await openOk(processes, 'AST-POT-FAIL-1', { institutionAllowlisted: false });
    const v = await pot.verify(p, ['v1', 'v2', 'v3']);
    expect(v.verified).toBe(0);
    expect(v.final).toBe(false);
    expect(v.reasonCodes).toContain(PotReason.P1_INSTITUTION_NOT_ALLOWLISTED);
  });

  it('verified=0 QUORUM_SHORT with 1 of 3', async () => {
    const { processes, pot } = await setup();
    const p = await openOk(processes, 'AST-POT-Q-1');
    const v = await pot.verify(p, ['v1'], ['v1', 'v2', 'v3']);
    expect(v.verified).toBe(0);
    expect(v.reasonCodes).toContain(PotReason.QUORUM_SHORT);
  });

  it('verified=0 QUORUM_K_BELOW_MIN when K=2', async () => {
    const { processes, pot } = await setup();
    const p = await openOk(processes, 'AST-POT-K-1');
    const v = await pot.verify(p, ['v1', 'v2'], ['v1', 'v2']);
    expect(v.verified).toBe(0);
    expect(v.reasonCodes).toContain(PotReason.QUORUM_K_BELOW_MIN);
  });

  it('verified=0 POT_TIMEOUT when open older than window', async () => {
    const { nc, processes, pot } = await setup({ timeoutMs: 50 });
    const p = await openOk(processes, 'AST-POT-TO-1');
    // backdate process_open on journal by re-append is hard; use short timeout + sleep
    await new Promise((r) => setTimeout(r, 60));
    // rebuild process state still ok; evidence uses journal open time
    // Force open timestamp by verifying after delay — open was just now, need longer
    // Use config timeout 1ms and open then wait
    const pot2 = new PotService(nc, { timeoutMs: 1 });
    await new Promise((r) => setTimeout(r, 5));
    const v = await pot2.verify(p, ['v1', 'v2', 'v3']);
    expect(v.verified).toBe(0);
    expect(v.expired).toBe(true);
    expect(v.reasonCodes).toContain(PotReason.POT_TIMEOUT);
  });

  it('throws POT_ALREADY_FINAL on second verify after success', async () => {
    const { processes, pot } = await setup();
    const p = await openOk(processes, 'AST-POT-DUP-1');
    await pot.verify(p, ['v1', 'v2', 'v3']);
    await expect(pot.verify(p, ['v1', 'v2', 'v3'])).rejects.toBeInstanceOf(PotError);
    await expect(pot.verify(p, ['v1', 'v2', 'v3'])).rejects.toMatchObject({
      code: PotReason.POT_ALREADY_FINAL,
    });
  });

  it('getFinalVerdict returns final after success', async () => {
    const { processes, pot } = await setup();
    const p = await openOk(processes, 'AST-POT-GET-1');
    await pot.verify(p, ['v1', 'v2', 'v3']);
    const f = await pot.getFinalVerdict('AST-POT-GET-1');
    expect(f?.verified).toBe(1);
    expect(f?.final).toBe(true);
  });

  it('P4 fails without documents', async () => {
    const { processes, pot } = await setup();
    const p = await openOk(processes, 'AST-POT-DOC-1', { hasDocuments: false });
    const v = await pot.verify(p, ['v1', 'v2', 'v3']);
    expect(v.verified).toBe(0);
    expect(v.reasonCodes).toContain(PotReason.P4_DOCUMENTS_MISSING);
  });
});
