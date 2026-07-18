import { MemoryJournalStore } from '../nodechain/memory.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { GovernanceService } from './governance.service';
import { L3AgentRegistry, runAgentPanel } from './l3-agents';

describe('Governance L1/L2/L3', () => {
  it('L2 requires multiple grants', () => {
    const keys = bootstrapPipelineKeys();
    const nc = new NodechainService(new MemoryJournalStore(), { keys });
    const gov = new GovernanceService(nc);
    gov.openL2('subj', 2);
    expect(gov.grantL2('subj', 'a').complete).toBe(false);
    expect(gov.grantL2('subj', 'b').complete).toBe(true);
  });

  it('L3 policy panel passes healthy context', async () => {
    const r = await runAgentPanel({
      processId: 'p',
      valuation: '100.000000000',
      potVerified: 1,
      institutionAllowlisted: true,
      stagesCompleted: ['opened', 'documents', 'encoded'],
      allSeeingEyeCriticalCount: 0,
      highValue: false });
    expect(r.pass).toBe(true);
    expect(r.opinions).toHaveLength(5);
    expect(r.opinions.every((o) => o.backend === 'policy')).toBe(true);
  });

  it('L3 fails when pot not verified', async () => {
    const r = await runAgentPanel({
      processId: 'p',
      valuation: '100.000000000',
      potVerified: 0,
      institutionAllowlisted: true,
      stagesCompleted: ['opened'],
      allSeeingEyeCriticalCount: 0,
      highValue: false });
    expect(r.pass).toBe(false);
  });

  it('registry is not empty by default', () => {
    expect(L3AgentRegistry.defaultPolicyPanel().list().length).toBe(5);
  });
});
