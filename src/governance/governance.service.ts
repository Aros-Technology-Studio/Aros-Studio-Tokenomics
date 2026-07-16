import { Injectable } from '@nestjs/common';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode } from '../common/errors/error-codes';
import { NodechainService } from '../nodechain/nodechain.service';

/**
 * Multi-step governance approvals (release / large ops).
 * Simplified step counter — not Eye executive power.
 */
@Injectable()
export class GovernanceService {
  private readonly approvals = new Map<
    string,
    { required: number; granted: Set<string> }
  >();

  constructor(private readonly nodechain: NodechainService) {}

  open(subjectId: string, requiredSteps: number): void {
    this.approvals.set(subjectId, {
      required: Math.max(1, requiredSteps),
      granted: new Set(),
    });
  }

  grant(subjectId: string, approverId: string): boolean {
    const row = this.approvals.get(subjectId);
    if (!row) {
      throw new AstError(AstErrorCode.INVALID_AMOUNT, 'no open approval');
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
        AstErrorCode.INVALID_AMOUNT,
        'governance approval incomplete',
      );
    }
  }
}
