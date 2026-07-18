import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpException,
  Post,
} from '@nestjs/common';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { PartialReleaseError } from '../partial-release/errors';
import type { OraclePackage } from '../oracle-gateway/types';
import { globalKillSwitch } from '../hardening/kill-switch';
import { isValidProcessId } from '../common/process-id';

export interface PartialReleaseBody {
  holderId: string;
  releaseAmount: string;
  remintAmount?: string;
  processId?: string;
  parentProcessId?: string;
  parentClaimId?: string;
  assetId?: string;
  holderApproved: boolean;
  institutionApproved: boolean;
  confirmers?: string[];
  validators?: string[];
  oracle?: OraclePackage;
  hasDocuments?: boolean;
  hasQualifiedSignature?: boolean;
}

@Controller('v1/core')
export class CorePartialReleaseController {
  constructor(private readonly orchestrator: OrchestratorService) {}

  @Post('partial-release')
  @HttpCode(202)
  async partialRelease(
    @Body() body: PartialReleaseBody,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('x-institution-id') institutionId: string | undefined,
  ) {
    if (globalKillSwitch.isEngaged()) {
      throw new HttpException(
        { code: 'KILL_SWITCH', message: 'kill-switch engaged' },
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
        { code: 'IDEMPOTENCY_REQUIRED', message: 'Idempotency-Key required' },
        422,
      );
    }
    if (body.processId && !isValidProcessId(body.processId)) {
      throw new HttpException(
        { code: 'INVALID_PROCESS_ID', message: 'invalid processId' },
        422,
      );
    }

    try {
      const result = await this.orchestrator.partialRelease.run({
        institutionId: institutionId.trim(),
        holderId: body.holderId,
        releaseAmount: body.releaseAmount,
        remintAmount: body.remintAmount,
        processId: body.processId,
        parentProcessId: body.parentProcessId,
        parentClaimId: body.parentClaimId,
        assetId: body.assetId,
        idempotencyKey: idempotencyKey.trim(),
        holderApproved: body.holderApproved === true,
        institutionApproved: body.institutionApproved === true,
        confirmers: body.confirmers,
        validators: body.validators,
        oracle: body.oracle,
        hasDocuments: body.hasDocuments,
        hasQualifiedSignature: body.hasQualifiedSignature,
      });
      return {
        status: 'completed',
        ...result,
      };
    } catch (e) {
      if (e instanceof PartialReleaseError) {
        throw new HttpException({ code: e.code, message: e.message }, 422);
      }
      throw new HttpException(
        {
          code: 'PARTIAL_RELEASE_ERROR',
          message: e instanceof Error ? e.message : String(e),
        },
        500,
      );
    }
  }
}
