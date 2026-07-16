import { Injectable } from '@nestjs/common';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode, PotCriteriaId } from '../common/errors/error-codes';
import { InvariantsService } from '../invariants/invariants.service';
import { NodechainService } from '../nodechain/nodechain.service';
import { CriteriaResult, PotEvidence, PotVerdict } from './pot.types';

/** Default PoT timeout: 15 minutes (CANON §XII). */
export const POT_TIMEOUT_MS = 15 * 60 * 1000;

@Injectable()
export class PotService {
  private readonly verifiedProcesses = new Set<string>();
  private readonly pendingSince = new Map<string, number>();

  constructor(
    private readonly nodechain: NodechainService,
    private readonly invariants: InvariantsService,
  ) {}

  /**
   * Submit confirmation evidence. Amounts are NOT computed here (pot pack).
   * M-of-N and signature crypto are simplified for skeleton; criteria all-pass is hard.
   */
  confirm(evidence: PotEvidence, opts?: { now?: number }): PotVerdict {
    const now = opts?.now ?? Date.now();
    const { processId } = evidence;

    if (this.verifiedProcesses.has(processId)) {
      throw new AstError(
        AstErrorCode.POT_DOUBLE_CONFIRM,
        'double confirmation rejected',
        { processId },
      );
    }

    if (!this.pendingSince.has(processId)) {
      this.pendingSince.set(processId, now);
    }
    const started = this.pendingSince.get(processId)!;
    if (now - started > POT_TIMEOUT_MS) {
      this.pendingSince.delete(processId);
      return {
        processId,
        verified: 0,
        status: 'expired',
      };
    }

    const failed = failedCriteria(evidence.criteriaResult);
    if (failed.length > 0) {
      return {
        processId,
        verified: 0,
        status: 'rejected',
        failedCriteria: failed,
      };
    }

    // All P1–P4 pass → verified = 1 (final)
    const record = this.nodechain.append({
      writerRole: 'quorum_validator',
      processId,
      recordType: 'pot_verdict',
      payload: {
        verified: 1,
        evidence: {
          processId,
          executionSnapshot: evidence.executionSnapshot,
          validatorIds: evidence.validatorIds,
          criteriaResult: evidence.criteriaResult,
        },
      },
    });

    this.invariants.assertInvariant('I1', {
      potVerified: 1,
      processId,
    });
    this.invariants.assertInvariant('I3', {
      significantEventOnNodeChain: true,
      processId,
    });

    this.verifiedProcesses.add(processId);
    this.pendingSince.delete(processId);

    return {
      processId,
      verified: 1,
      status: 'verified',
      ledgerHeight: record.height,
      contentHash: record.contentHash,
    };
  }

  isVerified(processId: string): boolean {
    return this.verifiedProcesses.has(processId);
  }

  /** pot does not emit amounts — only ok signal. */
  okToEmit(processId: string): boolean {
    return this.isVerified(processId);
  }
}

function failedCriteria(c: CriteriaResult): PotCriteriaId[] {
  const out: PotCriteriaId[] = [];
  (['P1', 'P2', 'P3', 'P4'] as PotCriteriaId[]).forEach((id) => {
    if (!c[id]) out.push(id);
  });
  return out;
}
