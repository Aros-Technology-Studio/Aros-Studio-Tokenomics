import { Controller, Get, Headers, HttpException, Inject, Query } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import {
  getEvidenceRequirements,
  listAssetTypes,
} from './asset-evidence-catalog';

@Controller('v1/catalog')
export class CatalogController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  private requireSession(sessionId: string | undefined) {
    const s = this.auth.resolve(sessionId);
    if (!s) {
      throw new HttpException(
        { code: 'AUTH_SESSION', message: 'login required' },
        401,
      );
    }
    return s;
  }

  /** Public list of asset types (still requires session — cabinet path). */
  @Get('asset-types')
  assetTypes(@Headers('x-session-id') sessionId: string | undefined) {
    this.requireSession(sessionId);
    return {
      assetTypes: listAssetTypes(),
      note: 'Select type before uploading evidence. AST does not appraise.',
    };
  }

  @Get('evidence-requirements')
  evidence(
    @Headers('x-session-id') sessionId: string | undefined,
    @Query('assetType') assetType?: string,
  ) {
    this.requireSession(sessionId);
    if (!assetType?.trim()) {
      throw new HttpException(
        { code: 'VALIDATION_ERROR', message: 'assetType query required' },
        400,
      );
    }
    const def = getEvidenceRequirements(assetType);
    if (!def) {
      throw new HttpException(
        { code: 'UNKNOWN_ASSET_TYPE', message: `unknown assetType: ${assetType}` },
        404,
      );
    }
    return {
      assetType: def.id,
      label: def.label,
      description: def.description,
      slots: def.slots,
      packageRule:
        'All slot files are hashed together as one document package. Required slots must be non-empty.',
    };
  }
}
