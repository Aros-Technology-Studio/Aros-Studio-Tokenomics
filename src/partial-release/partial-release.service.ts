import { Injectable } from '@nestjs/common';
import { isAtLeastDust, parseDecimal } from '../common/money/money';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode } from '../common/errors/error-codes';
import { AroscoinService } from '../aroscoin/aroscoin.service';
import { NodechainService } from '../nodechain/nodechain.service';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { PotService } from '../pot/pot.service';
import { ReleaseService } from '../release/release.service';
import { ReserveService } from '../reserve/reserve.service';

export interface PartialReleaseRequest {
  /** Holder via Portal */
  holderId: string;
  institutionCode: string;
  /** Institutional approval flag (edge must set true only after approval). */
  institutionalApproval: boolean;
  amountAro: string;
  sourceClaimId: string;
  idempotencyKey: string;
  institutionalValuation: string;
  currency: string;
  /** If true, allow only when Release Phase active for external effects; internal always ok. */
  externalIntent?: boolean;
}

/**
 * Separate from Release Phase module (P4).
 * Full orchestrator process + new processId; atomic burn + reserve child + remint.
 */
@Injectable()
export class PartialReleaseService {
  constructor(
    private readonly orchestrator: OrchestratorService,
    private readonly pot: PotService,
    private readonly aroscoin: AroscoinService,
    private readonly reserve: ReserveService,
    private readonly release: ReleaseService,
    private readonly nodechain: NodechainService,
  ) {}

  request(input: PartialReleaseRequest): {
    processId: string;
    newClaimId?: string;
    status: string;
  } {
    if (!input.institutionalApproval) {
      throw new AstError(
        AstErrorCode.INVALID_AMOUNT,
        'institutional approval required',
      );
    }
    if (!isAtLeastDust(input.amountAro)) {
      throw new AstError(AstErrorCode.INVALID_AMOUNT, 'below dust');
    }
    if (input.externalIntent) {
      this.release.assertExternalActionAllowed('external_transfer');
    }

    const { processId } = this.orchestrator.startProcess({
      institutionCode: input.institutionCode,
      idempotencyKey: `partial-${input.idempotencyKey}`,
      institutionalValuation: input.institutionalValuation,
      currency: input.currency,
      assetType: 'other',
      holderId: input.holderId,
    });

    // Document path assumed done for skeleton; run PoT then atomic burn/remint
    const pot = this.pot.confirm({
      processId,
      executionSnapshot: { hash: 'pr-snap', prevHash: 'pr-prev' },
      assignedValidatorIds: ['v1', 'v2', 'v3'],
      validatorIds: ['v1', 'v2'],
      signatures: ['s1', 's2'],
      criteriaResult: { P1: true, P2: true, P3: true, P4: true },
    });

    if (pot.verified !== 1) {
      return { processId, status: 'failed' };
    }

    const amount = parseDecimal(input.amountAro).toFixed(9);

    // Atomic sequence: burn source, child reserve, remint new claim
    this.aroscoin.burn({
      processId,
      holderId: input.holderId,
      amountAro: amount,
      claimId: input.sourceClaimId,
    });

    this.reserve.partialReleaseChild({
      bagId: 'AST_OWN',
      assetKey: 'ASSET',
      amount,
      processId,
    });

    const newClaimId = `claim-${processId}-partial`;
    this.aroscoin.mint({
      processId,
      claimId: newClaimId,
      amountAro: amount,
      holderId: input.holderId,
    });

    this.nodechain.append({
      writerRole: 'internal_service',
      processId,
      recordType: 'partial_release',
      payload: {
        sourceClaimId: input.sourceClaimId,
        newClaimId,
        amountAro: amount,
        holderId: input.holderId,
        proRata: true,
      },
    });

    return { processId, newClaimId, status: 'completed' };
  }
}
