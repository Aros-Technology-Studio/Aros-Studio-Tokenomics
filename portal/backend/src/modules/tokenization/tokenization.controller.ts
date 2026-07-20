import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpException,
  Inject,
  Post,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ProcessesService } from '../processes/processes.service';
import type { CreateProcessBody } from '../../common/shared-bridge';

export interface StartTokenizationRequest {
  assetType?: 'real_estate' | 'bond' | 'investment_package' | 'other';
  institutionalValuation: string;
  currency?: string;
  holderId: string;
  assetId?: string;
  hasQualifiedSignature: boolean;
  documentPackageHash: string;
  processId?: string;
  metadata?: Record<string, unknown>;
  note?: string;
}

/**
 * Product path: POST /v1/tokenization/start
 * Maps to ProcessesService.create (primary_tokenization). No mint.
 */
@Controller('v1/tokenization')
export class TokenizationController {
  constructor(
    @Inject(ProcessesService) private readonly processes: ProcessesService,
    @Inject(AuthService) private readonly auth: AuthService,
  ) {}

  @Post('start')
  @HttpCode(201)
  async start(
    @Body() body: StartTokenizationRequest,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('x-session-id') sessionId: string | undefined,
  ) {
    const s = this.auth.resolve(sessionId);
    if (!s) {
      throw new HttpException(
        { code: 'AUTH_SESSION', message: 'login required — POST /v1/auth/login' },
        401,
      );
    }
    if (!body.holderId?.trim()) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: 'holderId required' },
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

    const noteParts = [
      body.note?.trim(),
      body.assetType ? `assetType=${body.assetType}` : undefined,
      body.currency ? `currency=${body.currency}` : undefined,
      body.metadata ? `metadata=${JSON.stringify(body.metadata)}` : undefined,
    ].filter(Boolean);

    const createBody: CreateProcessBody = {
      processType: 'primary_tokenization',
      valuation: body.institutionalValuation,
      holderId: body.holderId,
      assetId: body.assetId,
      hasQualifiedSignature: true,
      documentPackageHash: body.documentPackageHash,
      processId: body.processId,
      note: noteParts.length ? noteParts.join(' | ').slice(0, 512) : undefined,
    };

    const result = await this.processes.create(
      createBody,
      s.institutionId,
      idempotencyKey,
      s.token,
    );
    if (result.statusCode >= 400) {
      throw new HttpException(result.body, result.statusCode);
    }

    const r = result.body as Record<string, unknown>;
    const status = String(r.status ?? 'awaiting_core');
    return {
      processId: r.processId,
      claimId: r.processId,
      status,
      currentStep: mapCurrentStep(status),
      institutionId: r.institutionId,
      valuation: r.valuation,
      holderId: r.holderId ?? body.holderId,
      assetType: body.assetType,
      documentPackageHash: r.documentPackageHash,
      idempotencyKey: r.idempotencyKey,
      message: r.message,
      core: r.core,
      coreError: r.coreError,
    };
  }
}

function mapCurrentStep(status: string): string {
  switch (status) {
    case 'documents_pending':
      return 'documents';
    case 'awaiting_core':
      return 'core_handoff';
    case 'submitted_to_core':
      return 'pot_or_settlement';
    case 'rejected':
      return 'failed';
    case 'duplicate':
      return 'idempotent_replay';
    default:
      return status;
  }
}
