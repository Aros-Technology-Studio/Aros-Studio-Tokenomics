import { Injectable } from '@nestjs/common';
import { buildProcessId } from '../common/ids/process-id';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode } from '../common/errors/error-codes';
import { AroscoinService } from '../aroscoin/aroscoin.service';
import { CommissionService } from '../commission/commission.service';
import { EmissionService } from '../emission/emission.service';
import { NodechainService } from '../nodechain/nodechain.service';
import { PotService } from '../pot/pot.service';
import { CriteriaResult } from '../pot/pot.types';
import { ReserveService } from '../reserve/reserve.service';

export type PipelineStep =
  | 'StartProcess'
  | 'DocumentValidation'
  | 'OracleGateway'
  | 'PoTEvaluation'
  | 'NodeChainRecord'
  | 'EmissionBurn'
  | 'Settlement'
  | 'StateUpdate'
  | 'EndProcess';

export interface StartProcessInput {
  institutionCode: string;
  idempotencyKey: string;
  institutionalValuation: string;
  currency: string;
  assetType: string;
  holderId: string;
}

/**
 * Sole economic entry. Fixed 9-step pipeline (orchestrator pack).
 * Compensation only before verified=1.
 */
@Injectable()
export class OrchestratorService {
  private readonly byIdempotency = new Map<string, string>();
  private readonly processes = new Map<
    string,
    {
      step: PipelineStep;
      valuation: string;
      holderId: string;
      claimId?: string;
      verified?: 0 | 1;
    }
  >();
  private concurrentByInst = new Map<string, number>();

  constructor(
    private readonly pot: PotService,
    private readonly emission: EmissionService,
    private readonly aroscoin: AroscoinService,
    private readonly commission: CommissionService,
    private readonly reserve: ReserveService,
    private readonly nodechain: NodechainService,
  ) {}

  startProcess(input: StartProcessInput): { processId: string; step: PipelineStep } {
    const idemKey = `${input.institutionCode}:${input.idempotencyKey}`;
    const existing = this.byIdempotency.get(idemKey);
    if (existing) {
      return { processId: existing, step: this.processes.get(existing)!.step };
    }

    const conc = this.concurrentByInst.get(input.institutionCode) ?? 0;
    if (conc >= 10) {
      throw new AstError(AstErrorCode.INVALID_AMOUNT, 'max concurrent processes');
    }

    const processId = buildProcessId(input.institutionCode);
    this.byIdempotency.set(idemKey, processId);
    this.processes.set(processId, {
      step: 'StartProcess',
      valuation: input.institutionalValuation,
      holderId: input.holderId,
    });
    this.concurrentByInst.set(input.institutionCode, conc + 1);

    this.nodechain.append({
      writerRole: 'internal_service',
      processId,
      recordType: 'process_started',
      payload: {
        assetType: input.assetType,
        currency: input.currency,
        institutionalValuation: input.institutionalValuation,
      },
    });

    this.processes.get(processId)!.step = 'DocumentValidation';
    return { processId, step: 'DocumentValidation' };
  }

  /**
   * Advance after documents validated: run PoT with provided criteria, then emission+settle.
   */
  runFromPot(
    processId: string,
    criteria: CriteriaResult,
    nodeWeights: Record<string, string>,
  ): {
    processId: string;
    verified: 0 | 1;
    claimId?: string;
    step: PipelineStep;
  } {
    const proc = this.processes.get(processId);
    if (!proc) {
      throw new AstError(AstErrorCode.INVALID_PROCESS_ID, 'unknown process');
    }

    proc.step = 'PoTEvaluation';
    const verdict = this.pot.confirm({
      processId,
      executionSnapshot: { hash: 'snap', prevHash: 'prev' },
      validatorIds: Object.keys(nodeWeights),
      signatures: Object.keys(nodeWeights).map((id) => `sig-${id}`),
      criteriaResult: criteria,
    });

    proc.verified = verdict.verified;
    if (verdict.verified !== 1) {
      proc.step = 'EndProcess';
      return { processId, verified: 0, step: 'EndProcess' };
    }

    // After verified: not compensatable
    proc.step = 'EmissionBurn';
    this.reserve.credit('AST_OWN', proc.valuation ? 'ASSET' : 'ASSET', proc.valuation);
    this.reserve.lock('AST_OWN', 'ASSET', proc.valuation);

    const plan = this.emission.plan({
      processId,
      institutionalValuation: proc.valuation,
      deltaValue: proc.valuation,
    });

    const claimId = `claim-${processId}`;
    if (parseFloat(plan.mintAro) > 0) {
      this.aroscoin.mint({
        processId,
        claimId,
        amountAro: plan.mintAro,
        holderId: proc.holderId,
      });
      proc.claimId = claimId;
    }

    this.reserve.recordConfirmedVolume(proc.valuation);

    proc.step = 'Settlement';
    this.commission.settleCommission({
      processId,
      valuation: proc.valuation,
      feeRate: '0.0015',
      nodeWeights,
    });

    proc.step = 'EndProcess';
    return {
      processId,
      verified: 1,
      claimId: proc.claimId,
      step: 'EndProcess',
    };
  }
}
