import { Injectable, Optional, Inject } from '@nestjs/common';
import { EventStreamService } from '../event-stream/event-stream.service';

/**
 * Layer 08 — All-Seeing Eye: observe + notify.
 * Does not veto, rollback, mint, or append as All-Seeing Eye executive.
 * B4: optional durable stream via EventStreamService (at-least-once, resume by seq).
 */
export interface AllSeeingEyeNotification {
  at: string;
  level: 'info' | 'warn' | 'critical';
  source: string;
  code: string;
  message: string;
  processId?: string;
  payload?: Record<string, unknown>;
  /** Durable stream sequence when event stream is attached. */
  seq?: number;
}

@Injectable()
export class AllSeeingEyeService {
  private readonly log: AllSeeingEyeNotification[] = [];
  private readonly listeners: Array<(n: AllSeeingEyeNotification) => void> = [];

  constructor(
    @Optional() @Inject(EventStreamService) private readonly eventStream?: EventStreamService | null,
  ) {}

  observe(n: Omit<AllSeeingEyeNotification, 'at' | 'seq'>): AllSeeingEyeNotification {
    const full: AllSeeingEyeNotification = { ...n, at: new Date().toISOString() };
    this.log.push(full);
    for (const l of this.listeners) l(full);

    // Fire-and-forget durable publish (sync path keeps in-memory first)
    if (this.eventStream) {
      void this.eventStream
        .publish({
          type: 'eye.notification',
          level: full.level,
          source: full.source,
          code: full.code,
          message: full.message,
          processId: full.processId,
          data: full.payload
            ? {
                // never dump raw document bytes — shallow keys only
                keys: Object.keys(full.payload).slice(0, 32),
              }
            : undefined,
        })
        .then((ev) => {
          full.seq = ev.seq;
        })
        .catch(() => {
          /* durable path must not break observe */
        });
    }
    return full;
  }

  /** Async observe that awaits durable append (tests / strict paths). */
  async observeDurable(
    n: Omit<AllSeeingEyeNotification, 'at' | 'seq'>,
  ): Promise<AllSeeingEyeNotification> {
    const full: AllSeeingEyeNotification = { ...n, at: new Date().toISOString() };
    this.log.push(full);
    for (const l of this.listeners) l(full);
    if (this.eventStream) {
      const ev = await this.eventStream.publish({
        type: 'eye.notification',
        level: full.level,
        source: full.source,
        code: full.code,
        message: full.message,
        processId: full.processId,
        data: full.payload ? { keys: Object.keys(full.payload).slice(0, 32) } : undefined,
      });
      full.seq = ev.seq;
    }
    return full;
  }

  notify(n: Omit<AllSeeingEyeNotification, 'at' | 'seq'>): AllSeeingEyeNotification {
    return this.observe({ ...n, level: n.level ?? 'info' });
  }

  subscribe(fn: (n: AllSeeingEyeNotification) => void): void {
    this.listeners.push(fn);
  }

  history(): AllSeeingEyeNotification[] {
    return [...this.log];
  }

  /** Explicit non-capability — always throws if called as veto. */
  veto(): never {
    throw new Error('All-Seeing Eye has no veto capability in this implementation');
  }
}
