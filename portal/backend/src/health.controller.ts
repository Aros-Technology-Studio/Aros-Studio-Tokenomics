import { Controller, Get } from '@nestjs/common';

@Controller('v1/health')
export class HealthController {
  @Get()
  health() {
    const coreUrl =
      process.env.CORE_API_URL ?? process.env.AST_CORE_URL ?? 'http://localhost:3000';
    const handoff = process.env.PORTAL_CORE_HANDOFF;
    return {
      status: 'ok',
      service: 'portal-backend',
      coreHandOff: handoff === '0' || handoff === 'false' ? 'disabled' : 'live',
      coreApiUrl: coreUrl,
    };
  }
}
