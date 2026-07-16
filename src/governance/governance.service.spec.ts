import { MemoryLedgerStore } from '../nodechain/memory-ledger.store';
import { NodechainService } from '../nodechain/nodechain.service';
import { GovernanceService } from './governance.service';

describe('GovernanceService', () => {
  let gov: GovernanceService;

  beforeEach(() => {
    gov = new GovernanceService(new NodechainService(new MemoryLedgerStore()));
  });

  it('L1 passes when docs signature allowlist ok', () => {
    const r = gov.evaluateL1({
      processId: 'AST-DEMO-20260716-g1',
      hasDocuments: true,
      hasQualifiedSignature: true,
      institutionAllowlisted: true,
    });
    expect(r.pass).toBe(true);
    expect(r.reasonCodes).toHaveLength(0);
  });

  it('L1 fails closed without signature', () => {
    const r = gov.evaluateL1({
      processId: 'AST-DEMO-20260716-g2',
      hasDocuments: true,
      hasQualifiedSignature: false,
      institutionAllowlisted: true,
    });
    expect(r.pass).toBe(false);
    expect(r.reasonCodes).toContain('L1_SIGNATURE_MISSING');
  });

  it('multi-step approval completes', () => {
    gov.open('release-1', 2);
    expect(gov.grant('release-1', 'a1')).toBe(false);
    expect(gov.grant('release-1', 'a2')).toBe(true);
    expect(gov.isComplete('release-1')).toBe(true);
  });
});
