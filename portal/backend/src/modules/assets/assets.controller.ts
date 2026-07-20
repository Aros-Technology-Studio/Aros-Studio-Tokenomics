import {
  Controller,
  Get,
  Headers,
  HttpException,
  Inject,
  Param,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { AssetsService } from './assets.service';

@Controller('v1/assets')
export class AssetsController {
  constructor(
    @Inject(AssetsService) private readonly assets: AssetsService,
    @Inject(AuthService) private readonly auth: AuthService,
  ) {}

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

  @Get()
  list(@Headers('x-session-id') sessionId: string | undefined) {
    const s = this.requireSession(sessionId);
    const claims = this.assets.listClaims(s.institutionId);
    return {
      institutionId: s.institutionId,
      count: claims.length,
      claims,
    };
  }

  @Get(':claimId')
  get(
    @Param('claimId') claimId: string,
    @Headers('x-session-id') sessionId: string | undefined,
  ) {
    const s = this.requireSession(sessionId);
    const claim = this.assets.getClaim(s.institutionId, claimId);
    if (!claim) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: `unknown claim ${claimId}` },
        404,
      );
    }
    return {
      ...claim,
      processHistory: [],
      ownership: [],
    };
  }
}

