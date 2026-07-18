import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
  Param,
  Post,
} from '@nestjs/common';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { OrchestratorError } from '../orchestrator/errors';
import { isValidProcessId } from '../common/process-id';
import { globalKillSwitch } from '../hardening/kill-switch';

export interface CoreCreateProcessBody {
  processType?: string;
  valuation: string;
  holderId: string;
  assetId?: string;
  processId?: string;
  hasQualifiedSignature: boolean;
  documentPackageHash?: string;
  feeRate?: number;
  confirmers?: string[];
  validators?: string[];
  requireL2?: boolean;
  l2Approvers?: string[];
  requireL3?: boolean;
  institutionAllowlisted?: boolean;
  hasDocuments?: boolean;
  note?: string;
}

/**
 * Core HTTP surface for Portal / internal clients.
 * POST /v1/core/processes → Orchestrator sole entry (primary tokenization).
 */
@Controller('v1/core/processes')
export class CoreProcessesController {
  constructor(private readonly orchestrator: OrchestratorService) {}

  @Post()
  @HttpCode(202)
  async create(
    @Body() body: CoreCreateProcessBody,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('x-institution-id') institutionId: string | undefined,
  ) {
    if (globalKillSwitch.isEngaged()) {
      throw new HttpException(
        { code: 'KILL_SWITCH', message: 'kill-switch engaged — writes disabled' },
        503,
      );
    }
    if (!institutionId?.trim()) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'X-Institution-Id required' },
        403,
      );
    }
    if (!idempotencyKey?.trim() || idempotencyKey.trim().length < 8) {
      throw new HttpException(
        { code: 'IDEMPOTENCY_REQUIRED', message: 'Idempotency-Key required (min 8 chars)' },
        422,
      );
    }
    if (body.hasQualifiedSignature !== true) {
      throw new HttpException(
        {
          code: 'MISSING_QUALIFIED_SIGNATURE',
          message: 'hasQualifiedSignature must be true',
        },
        422,
      );
    }
    if (!body.valuation?.trim() || !body.holderId?.trim()) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: 'valuation and holderId required' },
        422,
      );
    }
    if (body.processId && !isValidProcessId(body.processId)) {
      throw new HttpException(
        { code: 'INVALID_PROCESS_ID', message: 'invalid processId pattern' },
        422,
      );
    }

    try {
      const result = await this.orchestrator.runPrimary({
        institutionId: institutionId.trim(),
        valuation: body.valuation,
        holderId: body.holderId,
        assetId: body.assetId,
        processId: body.processId,
        idempotencyKey: idempotencyKey.trim(),
        feeRate: body.feeRate,
        confirmers: body.confirmers,
        validators: body.validators,
        requireL2: body.requireL2,
        l2Approvers: body.l2Approvers,
        requireL3: body.requireL3,
        institutionAllowlisted: body.institutionAllowlisted ?? true,
        hasDocuments: body.hasDocuments ?? true,
        hasQualifiedSignature: true,
        documentPackageHash: body.documentPackageHash,
      });

      return {
        processId: result.processId,
        status: 'completed',
        institutionId: institutionId.trim(),
        valuation: body.valuation,
        holderId: body.holderId,
        hasQualifiedSignature: true,
        mint: result.mint,
        emission: {
          mode: result.emission.mode,
          amount: result.emission.amount,
        },
        settlement: {
          fee: result.settlement.fee,
          nodesPool: result.settlement.nodesPool,
          astShare: result.settlement.astShare,
        },
        reserveIndex: result.reserveIndex,
        reserveOwnBalance: result.reserve.ownBalance,
        verdict: {
          verified: result.verdict.verified,
          ledgerHeight: result.verdict.ledgerHeight,
          criteriaResult: result.verdict.criteriaResult,
        },
        tip: result.tip,
        chainOk: result.chain.ok,
        steps: result.steps.map((s) => s.step),
      };
    } catch (e) {
      if (e instanceof OrchestratorError) {
        const status =
          e.code.includes('IDEMPOTENCY') ? 409 : e.code.includes('L1') || e.code.includes('POT') ? 422 : 400;
        throw new HttpException({ code: e.code, message: e.message }, status);
      }
      throw new HttpException(
        { code: 'CORE_ERROR', message: e instanceof Error ? e.message : String(e) },
        500,
      );
    }
  }

  @Get(':processId')
  async get(
    @Param('processId') processId: string,
    @Headers('x-institution-id') institutionId: string | undefined,
  ) {
    if (!isValidProcessId(processId)) {
      throw new HttpException(
        { code: 'INVALID_PROCESS_ID', message: 'invalid processId' },
        400,
      );
    }
    const state = this.orchestrator.processes.get(processId);
    const history = await this.orchestrator.nodechain.listByProcessId(processId);
    if (!state && history.length === 0) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: `unknown process ${processId}` },
        404,
      );
    }
    if (
      institutionId &&
      state?.institutionId &&
      state.institutionId !== institutionId.trim()
    ) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'institution mismatch' }, 403);
    }

    const pot = history.find((r) => r.recordType === 'pot_verdict');
    const mint = history.find((r) => r.recordType === 'mint_fact');
    const commission = history.find((r) => r.recordType === 'commission_settled');

    return {
      processId,
      status: state?.stage ?? (mint ? 'settled' : pot ? 'pot_done' : 'unknown'),
      institutionId: state?.institutionId,
      valuation: state?.valuation,
      holderId: state?.holderId,
      payloadHash: state?.payloadHash,
      potVerified: pot?.payload?.verified === 1 ? 1 : 0,
      mintAmount: mint?.payload?.amount,
      commissionFee: commission?.payload?.fee,
      recordTypes: history.map((r) => r.recordType),
      tip: await this.orchestrator.nodechain.getTip(),
    };
  }
}
