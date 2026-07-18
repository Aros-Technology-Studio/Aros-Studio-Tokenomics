import { NodechainService } from '../nodechain/nodechain.service';
import { L3AgentRegistry, type L3Context, type L3Result } from './l3-agents';
import { parseAro } from '../common/money';
import { defaultHardeningConfig } from '../hardening/hardening.policy';

export interface L2State {
  subjectId: string;
  required: number;
  granted: Set<string>;
  role: string;
}

/**
 * Layer 09 — L1 automated, L2 multi-step committee, L3 agent panel.
 * No token-holder voting. Does not mint.
 */
export class GovernanceService {
  private l2 = new Map<string, L2State>();
  private readonly l3: L3AgentRegistry;

  constructor(
    private readonly nodechain: NodechainService,
    l3?: L3AgentRegistry,
  ) {
    this.l3 = l3 ?? L3AgentRegistry.fromEnv();
  }

  evaluateL1(input: {
    processId: string;
    hasDocuments: boolean;
    hasQualifiedSignature: boolean;
    institutionAllowlisted: boolean;
  }): { pass: boolean; reasonCodes: string[]; level: 'L1' } {
    const reasonCodes: string[] = [];
    if (!input.institutionAllowlisted) reasonCodes.push('L1_INSTITUTION_NOT_ALLOWLISTED');
    if (!input.hasDocuments) reasonCodes.push('L1_DOCUMENTS_MISSING');
    if (!input.hasQualifiedSignature) reasonCodes.push('L1_SIGNATURE_MISSING');
    return { pass: reasonCodes.length === 0, reasonCodes, level: 'L1' };
  }

  openL2(subjectId: string, required: number, role = 'committee'): void {
    this.l2.set(subjectId, {
      subjectId,
      required: Math.max(1, required),
      granted: new Set(),
      role });
  }

  grantL2(
    subjectId: string,
    approverId: string,
  ): { complete: boolean; count: number; required: number } {
    const row = this.l2.get(subjectId);
    if (!row) {
      throw new Error('L2: no open approval');
    }
    if (!approverId || !approverId.trim()) {
      throw new Error('L2: approverId required');
    }
    row.granted.add(approverId);
    return {
      complete: row.granted.size >= row.required,
      count: row.granted.size,
      required: row.required };
  }

  isL2Complete(subjectId: string): boolean {
    const row = this.l2.get(subjectId);
    if (!row) return false;
    return row.granted.size >= row.required;
  }

  openApproval(subjectId: string, required: number): void {
    this.openL2(subjectId, required);
  }

  grant(subjectId: string, approverId: string): boolean {
    return this.grantL2(subjectId, approverId).complete;
  }

  async evaluateL3(
    ctx: Omit<L3Context, 'highValue'> & { highValue?: boolean },
  ): Promise<L3Result & { level: 'L3' }> {
    const threshold = parseAro(defaultHardeningConfig.highValueThreshold);
    let highValue = ctx.highValue;
    if (highValue === undefined) {
      try {
        highValue = parseAro(ctx.valuation) >= threshold;
      } catch {
        highValue = true;
      }
    }
    const result = await this.l3.runPanel({ ...ctx, highValue: !!highValue });
    return { ...result, level: 'L3' };
  }

  async recordGovernanceEvent(
    processId: string | null,
    kind: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.nodechain.append({
      clientRecordId: `gov:${kind}:${processId ?? 'sys'}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      recordType: 'param_change',
      processId,
      payload: { kind, governance: 'L1-L2-L3', ...payload },
      writerId: 'governance',
      writerRole: 'governance' });
  }

  async recordParamChange(processId: string | null, key: string, value: unknown): Promise<void> {
    await this.recordGovernanceEvent(processId, 'param_change', { key, value });
  }
}
