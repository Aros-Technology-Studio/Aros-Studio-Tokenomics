import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { ProcessService } from '../processing/process.service';
import { PotService } from './pot.service';

describe('PotService (layer 04)', () => {
  async function setup() {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), {
      keys,
      requireRealCrypto: true,
    });
    await nc.ensureGenesis('system');
    const processes = new ProcessService(nc);
    const pot = new PotService(nc);
    return { nc, processes, pot };
  }

  it('returns verified=1 when P1–P4 and quorum hold', async () => {
    const { processes, pot } = await setup();
    const p = await processes.open({
      processId: 'AST-POT-OK-1',
      processType: 'primary_tokenization',
      institutionId: 'DEMO',
      valuation: '50.000000000',
      holderId: 'h1',
      institutionAllowlisted: true,
      hasDocuments: true,
      hasQualifiedSignature: true,
    });
    const v = await pot.verify(p, ['v1', 'v2', 'v3']);
    expect(v.verified).toBe(1);
    expect(v.criteriaResult.P1).toBe(true);
    expect(v.criteriaResult.P2).toBe(true);
    expect(v.criteriaResult.P3).toBe(true);
    expect(v.criteriaResult.P4).toBe(true);
    expect(v.reasonCodes).toHaveLength(0);
  });

  it('returns verified=0 with reason codes when allowlist fails', async () => {
    const { processes, pot } = await setup();
    const p = await processes.open({
      processId: 'AST-POT-FAIL-1',
      processType: 'primary_tokenization',
      institutionId: 'X',
      valuation: '50.000000000',
      holderId: 'h1',
      institutionAllowlisted: false,
      hasDocuments: true,
      hasQualifiedSignature: true,
    });
    const v = await pot.verify(p, ['v1', 'v2', 'v3']);
    expect(v.verified).toBe(0);
    expect(v.reasonCodes).toContain('P1_INSTITUTION_NOT_ALLOWLISTED');
  });

  it('fails quorum with fewer than 2/3 confirmers', async () => {
    const { processes, pot } = await setup();
    const p = await processes.open({
      processId: 'AST-POT-Q-1',
      processType: 'primary_tokenization',
      institutionId: 'DEMO',
      valuation: '10.000000000',
      holderId: 'h1',
      institutionAllowlisted: true,
      hasDocuments: true,
      hasQualifiedSignature: true,
    });
    const v = await pot.verify(p, ['v1'], ['v1', 'v2', 'v3']);
    expect(v.verified).toBe(0);
    expect(v.reasonCodes).toContain('QUORUM_SHORT');
  });
});
