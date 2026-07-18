import { Controller, Get, Query } from '@nestjs/common';
import { AllSeeingEyeService } from '../all-seeing-eye/all-seeing-eye.service';

/**
 * Observe-only All-Seeing Eye API — no veto/rollback endpoints.
 */
@Controller('v1/core/eye')
export class CoreEyeController {
  constructor(private readonly eye: AllSeeingEyeService) {}

  @Get('events')
  events(@Query('level') level?: string, @Query('limit') limit?: string) {
    let rows = this.eye.history();
    if (level) {
      rows = rows.filter((e) => e.level === level);
    }
    const n = Math.min(500, Math.max(1, Number(limit ?? 100) || 100));
    return {
      count: rows.length,
      events: rows.slice(-n),
      capabilities: {
        observe: true,
        notify: true,
        veto: false,
        rollback: false,
        mint: false,
      },
    };
  }

  @Get('health')
  health() {
    return {
      service: 'all-seeing-eye',
      mode: 'observe_notify',
      events: this.eye.history().length,
      critical: this.eye.history().filter((e) => e.level === 'critical').length,
      veto: false,
    };
  }
}
