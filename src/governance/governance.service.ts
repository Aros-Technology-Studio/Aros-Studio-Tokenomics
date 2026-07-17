import { NodechainService } from '../nodechain/nodechain.service';

/**
 * Layer 09 — multi-step + L1 policy. No token-holder voting.
 * AI hierarchy: L1 automated checks (documented); L2/L3 reserved for committee.
 */
export class GovernanceService {
  private approvals = new Map<string, { required: number; granted: Set<string> }>();

  constructor(private readonly nodechain: NodechainService) {}

  evaluateL1(input: {
    processId: string;
    hasDocuments: boolean;
    hasQualifiedSignature: boolean;
    institutionAllowlisted: boolean;
  }): { pass: boolean; reasonCodes: string[] } {
    const reasonCodes: string[] = [];
    if (!input.institutionAllowlisted) reasonCodes.push('L1_INSTITUTION_NOT_ALLOWLISTED');
    if (!input.hasDocuments) reasonCodes.push('L1_DOCUMENTS_MISSING');
    if (!input.hasQualifiedSignature) reasonCodes.push('L1_SIGNATURE_MISSING');
    return { pass: reasonCodes.length === 0, reasonCodes };
  }

  openApproval(subjectId: string, required: number): void {
    this.approvals.set(subjectId, { required, granted: new Set() });
  }

  grant(subjectId: string, approverId: string): boolean {
    const row = this.approvals.get(subjectId);
    if (!row) throw new Error('no open approval');
    row.granted.add(approverId);
    return row.granted.size >= row.required;
  }

  async recordParamChange(processId: string | null, key: string, value: unknown): Promise<void> {
    await this.nodechain.append({
      clientRecordId: `param:${key}:${Date.now()}`,
      recordType: 'param_change',
      processId,
      payload: { key, value, governance: 'role-based' },
      writerId: 'governance',
      writerRole: 'governance',
    });
  }
}
