import { Controller, Get, Inject, Optional, Query } from '@nestjs/common';
import { AllSeeingEyeService } from '../all-seeing-eye/all-seeing-eye.service';
import { EventStreamService } from '../event-stream/event-stream.service';

/**
 * Observe-only All-Seeing Eye API — no veto/rollback endpoints.
 * B4: durable stream resume via /v1/core/eye/stream (fromSeq / fromHeight).
 */
@Controller('v1/core/eye')
export class CoreEyeController {
  constructor(
    private readonly eye: AllSeeingEyeService,
    @Optional() @Inject(EventStreamService) private readonly eventStream?: EventStreamService,
  ) {}

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
        durableStream: Boolean(this.eventStream),
      },
    };
  }

  /**
   * Durable observer stream (poll/resume).
   * Consumers track nextSeq for at-least-once de-dupe.
   */
  @Get('stream')
  async streamPage(
    @Query('fromSeq') fromSeqRaw?: string,
    @Query('fromHeight') fromHeightRaw?: string,
    @Query('types') typesRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    if (!this.eventStream) {
      return {
        events: [],
        nextSeq: 0,
        tipSeq: 0,
        durable: false,
        message: 'event stream not configured',
      };
    }
    const fromSeq = fromSeqRaw != null ? Number(fromSeqRaw) : 0;
    const fromHeight = fromHeightRaw != null ? Number(fromHeightRaw) : undefined;
    const types = typesRaw
      ?.split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const limit = limitRaw != null ? Number(limitRaw) : 100;
    const page = await this.eventStream.query({
      fromSeq: Number.isFinite(fromSeq) ? fromSeq : 0,
      fromHeight:
        fromHeight != null && Number.isFinite(fromHeight) ? fromHeight : undefined,
      types,
      limit: Number.isFinite(limit) ? limit : 100,
    });
    return {
      ...page,
      durable: true,
      capabilities: { observe: true, veto: false, append: false },
    };
  }

  @Get('health')
  health() {
    return {
      service: 'all-seeing-eye',
      mode: 'observe_notify',
      events: this.eye.history().length,
      critical: this.eye.history().filter((e) => e.level === 'critical').length,
      streamTipSeq: this.eventStream?.tipSeq() ?? null,
      veto: false,
    };
  }
}
