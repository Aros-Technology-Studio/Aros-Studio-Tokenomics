import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { GovernanceService } from './governance.service';
import { runAgentPanel } from './ai-hierarchy';

describe('Governance L1/L2/L3', () => {
  it('L2 requires multiple grants', () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys, requireRealCrypto: true });
    const gov = new GovernanceService(nc);
    gov.openL2('subj', 2);
    expect(gov.grantL2('subj', 'a').complete).toBe(false);
    expect(gov.grantL2('subj', 'b').complete).toBe(true);
  });

  it('L3 panel passes healthy context', () => {
    const r = runAgentPanel({
      processId: 'p',
      valuation: '100.000000000',
      potVerified: 1,
      institutionAllowlisted: true,
      stagesCompleted: ['opened', 'documents', 'encoded'],
      eyeCriticalCount: 0,
      highValue: false,
    });
    expect(r.pass).toBe(true);
    expect(r.opinions).toHaveLength(5);
  });

  it('L3 fails when pot not verified', () => {
    const r = runAgentPanel({
      processId: 'p',
      valuation: '100.000000000',
      potVerified: 0,
      institutionAllowlisted: true,
      stagesCompleted: ['opened'],
      eyeCriticalCount: 0,
      highValue: false,
    });
    expect(r.pass).toBe(false);
  });
});
