import { Body, Controller, Headers, HttpException, Inject, Post } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { EnrichmentService } from './enrichment.service';
import { isKnownAssetType } from '../catalog/asset-evidence-catalog';

@Controller('v1/enrichment')
export class EnrichmentController {
  constructor(
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(EnrichmentService) private readonly enrichment: EnrichmentService,
  ) {}

  @Post('check')
  async check(
    @Headers('x-session-id') sessionId: string | undefined,
    @Body()
    body: {
      assetType?: string;
      holderId?: string;
      assetId?: string;
      documentPackageHash?: string;
      amountFromDocument?: string;
      currency?: string;
    },
  ) {
    const s = this.auth.resolve(sessionId);
    if (!s) {
      throw new HttpException(
        { code: 'AUTH_SESSION', message: 'login required' },
        401,
      );
    }
    if (!body.assetType?.trim() || !isKnownAssetType(body.assetType)) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: 'known assetType required' },
        422,
      );
    }
    if (body.documentPackageHash && !/^[a-f0-9]{64}$/i.test(body.documentPackageHash)) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: 'documentPackageHash must be 64 hex' },
        422,
      );
    }
    try {
      return await this.enrichment.check({
        assetType: body.assetType.trim().toLowerCase(),
        holderId: body.holderId?.trim(),
        assetId: body.assetId?.trim(),
        documentPackageHash: body.documentPackageHash?.trim().toLowerCase(),
        amountFromDocument: body.amountFromDocument?.trim(),
        currency: body.currency?.trim(),
        institutionId: s.institutionId,
      });
    } catch (e) {
      throw new HttpException(
        {
          code: 'ENRICHMENT_FAILED',
          message: e instanceof Error ? e.message : 'enrichment failed',
        },
        502,
      );
    }
  }
}
