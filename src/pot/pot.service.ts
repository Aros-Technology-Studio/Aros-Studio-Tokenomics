import { Injectable, Optional } from '@nestjs/common';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode, PotCriteriaId } from '../common/errors/error-codes';
import { InvariantsService } from '../invariants/invariants.service';
import { NodechainService } from '../nodechain/nodechain.service';
import { NodesService } from '../nodes/nodes.service';
import { CriteriaResult, PotEvidence, PotVerdict } from './pot.types';
import { quorumMet, requiredQuorum } from './quorum';

/** Default PoT timeout: 15 minutes (CANON §XII). */
export const POT_TIMEOUT_MS = 15 * 60 * 1000;

/**
 * PoT sole value gate. No amount math.
 * When NodesService has confirmers registered, assigned validators must be
 * active confirmers (suspended excluded). No fake pad validators in core path.
 */
@Injectable()
export class PotService {
  private readonly verifiedProcesses = new Set<string>();
  private readonly pendingSince = new Map<string, number>();
  /** processId → NodeChain height of verdict (write-ahead proof). */
  private readonly verdictHeights = new Map<string, number>();

  constructor(
    private readonly nodechain: NodechainService,
    private readonly invariants: InvariantsService,
    @Optional() private readonly nodes?: NodesService,
  ) {}

  /** Start confirmation window (orchestrator StartProcess / before confirm). */
  openPending(processId: string, now = Date.now()): void {
    if (this.verifiedProcesses.has(processId)) {
      throw new AstError(AstErrorCode.POT_DOUBLE_CONFIRM, 'already verified', {
        processId,
      });
    }
    if (!this.pendingSince.has(processId)) {
      this.pendingSince.set(processId, now);
    }
  }

  /**
   * Confirm work. Amounts are NOT computed here.
   * Order: eligibility → criteria → quorum → NodeChain append (write-ahead) → verified.
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
      return { processId, verified: 0, status: 'expired' };
    }

    const assigned =
      evidence.assignedValidatorIds?.length > 0
        ? evidence.assignedValidatorIds
        : evidence.validatorIds;
    const confirming = evidence.validatorIds;

    // Core integrity: when node registry is in use, only active confirmers may vote.
    const eligibility = this.checkValidatorEligibility(assigned, confirming);
    if (!eligibility.ok) {
      return {
        processId,
        verified: 0,
        status: 'rejected',
        failedCriteria: ['P1'],
        reasonCodes: { P1: eligibility.reasonCode ?? 'E_P1_VALIDATOR_NOT_ELIGIBLE' },
        quorumRequired: requiredQuorum(assigned.length),
        quorumActual: 0,
      };
    }

    const need = requiredQuorum(assigned.length);
    const actual = new Set(confirming.filter((id) => assigned.includes(id)))
      .size;

    if (
      evidence.signatures.length < confirming.length ||
      confirming.some((id, i) => !evidence.signatures[i])
    ) {
      return {
        processId,
        verified: 0,
        status: 'rejected',
        failedCriteria: ['P1'],
        reasonCodes: { P1: 'E_P1_SIGNATURE_MISSING' },
        quorumRequired: need,
        quorumActual: actual,
      };
    }

    if (!quorumMet(assigned, confirming)) {
      return {
        processId,
        verified: 0,
        status: 'rejected',
        failedCriteria: ['P2'],
        reasonCodes: { P2: 'E_P2_QUORUM_FAILED' },
        quorumRequired: need,
        quorumActual: actual,
      };
    }

    const failed = failedCriteria(evidence.criteriaResult);
    if (failed.length > 0) {
      const reasonCodes: Partial<Record<PotCriteriaId, string>> = {
        ...evidence.criteriaResult.reasonCodes,
      };
      for (const id of failed) {
        reasonCodes[id] = reasonCodes[id] ?? `E_${id}_FAILED`;
      }
      return {
        processId,
        verified: 0,
        status: 'rejected',
        failedCriteria: failed,
        reasonCodes,
        quorumRequired: need,
        quorumActual: actual,
      };
    }

    // Write-ahead: NodeChain record BEFORE verified flag is set
    const record = this.nodechain.append({
      writerRole: 'quorum_validator',
      processId,
      recordType: 'pot_verdict',
      payload: {
        verified: 1 as const,
        evidence: {
          processId,
          executionSnapshot: evidence.executionSnapshot,
          assignedValidatorIds: assigned,
          validatorIds: confirming,
          criteriaResult: evidence.criteriaResult,
        },
        writeAhead: true,
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
    this.verdictHeights.set(processId, record.height);
    this.pendingSince.delete(processId);

    return {
      processId,
      verified: 1,
      status: 'verified',
      ledgerHeight: record.height,
      contentHash: record.contentHash,
      quorumRequired: need,
      quorumActual: actual,
    };
  }

  isVerified(processId: string): boolean {
    return this.verifiedProcesses.has(processId);
  }

  /** Emission may proceed only if verified AND NodeChain write-ahead exists. */
  okToEmit(processId: string): boolean {
    if (!this.isVerified(processId)) return false;
    const h = this.verdictHeights.get(processId);
    if (h === undefined) return false;
    const rec = this.nodechain.getByHeight(h);
    return rec?.recordType === 'pot_verdict';
  }

  verdictHeight(processId: string): number | undefined {
    return this.verdictHeights.get(processId);
  }

  /**
   * If any confirmer is registered in NodesService, every assigned/confirming
   * id must be an active confirmer. Empty registry → unit-test mode (ids free).
   */
  private checkValidatorEligibility(
    assigned: string[],
    confirming: string[],
  ): { ok: boolean; reasonCode?: string } {
    if (!this.nodes) return { ok: true };
    const active = this.nodes.activeConfirmers();
    if (active.length === 0) return { ok: true };

    const eligible = new Set(active.map((n) => n.nodeId));
    for (const id of [...assigned, ...confirming]) {
      if (!eligible.has(id)) {
        return { ok: false, reasonCode: 'E_P1_VALIDATOR_NOT_ELIGIBLE' };
      }
    }
    return { ok: true };
  }
}

function failedCriteria(c: CriteriaResult): PotCriteriaId[] {
  const out: PotCriteriaId[] = [];
  (['P1', 'P2', 'P3', 'P4'] as PotCriteriaId[]).forEach((id) => {
    if (!c[id]) out.push(id);
  });
  return out;
}
