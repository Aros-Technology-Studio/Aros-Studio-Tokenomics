import { Controller, Get } from '@nestjs/common';
import { CoreApiClient } from '../../common/core-client';

@Controller('v1/health')
export class HealthController {
  private readonly core = new CoreApiClient();

  @Get()
  health() {
    const coreUrl =
      process.env.CORE_API_URL ?? process.env.AST_CORE_URL ?? 'http://localhost:3000';
    const handoff = process.env.PORTAL_CORE_HANDOFF;
    return {
      status: 'ok',
      service: 'portal-backend',
      product: 'Aros Studio Tokenomics (AST) — Institutional Portal',
      version: '1.1.0',
      edge: 'up',
      coreHandOff: handoff === '0' || handoff === 'false' ? 'disabled' : 'live',
      coreApiUrl: coreUrl,
      time: new Date().toISOString(),
    };
  }

  /** Liveness + Core reachability (login / dashboard banners). */
  @Get('ready')
  async ready() {
    const base = this.health();
    if (!this.core.enabled) {
      return {
        ...base,
        ready: false,
        core: { reachable: false, reason: 'handoff_disabled' },
      };
    }
    try {
      const r = await this.core.getReleaseStatus();
      // Also treat any non-5xx as "edge can talk to core process"
      const reachable = r.statusCode > 0 && r.statusCode < 500;
      return {
        ...base,
        ready: reachable,
        core: {
          reachable,
          statusCode: r.statusCode,
        },
      };
    } catch (e) {
      return {
        ...base,
        ready: false,
        core: {
          reachable: false,
          reason: e instanceof Error ? e.message : String(e),
        },
      };
    }
  }
}
