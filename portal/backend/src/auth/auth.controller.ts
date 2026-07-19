import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Inject,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('v1/auth')
export class AuthController {
  // Explicit @Inject: tsx does not emit design:paramtypes for Nest DI
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Get('institutions')
  institutions() {
    return { institutions: this.auth.listInstitutionsPublic() };
  }

  @Post('login')
  login(@Body() body: { institutionId?: string; token?: string }) {
    const r = this.auth.login(body.institutionId, body.token);
    if (!r.ok) {
      throw new HttpException({ code: r.code, message: r.message }, 401);
    }
    return {
      sessionId: r.session.sessionId,
      institutionId: r.session.institutionId,
      displayName: r.session.displayName,
      expiresAt: r.session.expiresAt,
    };
  }

  @Get('me')
  me(@Headers('x-session-id') sessionId: string | undefined) {
    const s = this.auth.resolve(sessionId);
    if (!s) {
      throw new HttpException(
        { code: 'AUTH_SESSION', message: 'not authenticated' },
        401,
      );
    }
    return {
      institutionId: s.institutionId,
      displayName: s.displayName,
      expiresAt: s.expiresAt,
    };
  }

  @Post('logout')
  logout(@Headers('x-session-id') sessionId: string | undefined) {
    this.auth.logout(sessionId);
    return { ok: true };
  }
}
