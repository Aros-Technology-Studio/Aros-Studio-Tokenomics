import { Injectable } from '@nestjs/common';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode } from '../common/errors/error-codes';
import { NodechainService } from '../nodechain/nodechain.service';

export interface L1Input {
  processId: string;
  hasDocuments: boolean;
  hasQualifiedSignature: boolean;
  institutionAllowlisted: boolean;
  /** Basic risk flag from policy engine (true = blocked). */
  basicRiskBlock?: boolean;
}

export interface L1Result {
  pass: boolean;
  reasonCodes: string[];
}

/**
 * Multi-step governance + L1 automated checks (release / large ops / intake policy).
 * No token-holder voting as value origin. Not Eye executive power.
 */
@Injectable()
export class GovernanceService {
  private readonly approvals = new Map<
    string,
    { required: number; granted: Set<string> }
  >();

  constructor(private readonly nodechain: NodechainService) {}

  /**
   * L1 — automated policy (docs + signature + allowlist + basic risk).
   * Real in v1 per orchestrator decisions.
   */
  evaluateL1(input: L1Input): L1Result {
    const reasonCodes: string[] = [];
    if (!input.institutionAllowlisted) reasonCodes.push('L1_INSTITUTION_NOT_ALLOWLISTED');
    if (!input.hasDocuments) reasonCodes.push('L1_DOCUMENTS_MISSING');
    if (!input.hasQualifiedSignature) reasonCodes.push('L1_SIGNATURE_MISSING');
    if (input.basicRiskBlock) reasonCodes.push('L1_BASIC_RISK_BLOCK');

    const pass = reasonCodes.length === 0;
    this.nodechain.append({
      writerRole: 'internal_service',
      processId: input.processId,
      recordType: 'governance_l1',
      payload: { pass, reasonCodes },
    });
    return { pass, reasonCodes };
  }

  requireL1(input: L1Input): void {
    const r = this.evaluateL1(input);
    if (!r.pass) {
      throw new AstError(AstErrorCode.INVALID_INPUT, 'L1 governance policy failed', {
        reasonCodes: r.reasonCodes,
      });
    }
  }

  open(subjectId: string, requiredSteps: number): void {
    this.approvals.set(subjectId, {
      required: Math.max(1, requiredSteps),
      granted: new Set(),
    });
  }

  grant(subjectId: string, approverId: string): boolean {
    const row = this.approvals.get(subjectId);
    if (!row) {
      throw new AstError(AstErrorCode.INVALID_INPUT, 'no open approval');
    }
    row.granted.add(approverId);
    this.nodechain.append({
      writerRole: 'internal_service',
      recordType: 'governance_grant',
      payload: {
        subjectId,
        approverId,
        count: row.granted.size,
        required: row.required,
      },
    });
    return this.isComplete(subjectId);
  }

  isComplete(subjectId: string): boolean {
    const row = this.approvals.get(subjectId);
    if (!row) return false;
    return row.granted.size >= row.required;
  }

  requireComplete(subjectId: string): void {
    if (!this.isComplete(subjectId)) {
      throw new AstError(
        AstErrorCode.INVALID_INPUT,
        'governance approval incomplete',
      );
    }
  }
}
