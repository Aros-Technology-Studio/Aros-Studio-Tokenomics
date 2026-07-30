import { promises as fs } from 'fs';
import * as path from 'path';
import type { AppendObserverEventInput, ObserverEvent } from './types';

/**
 * Append-only durable observer event log (JSONL).
 * Memory mode when path is null — tests / ephemeral.
 */
export class DurableEventLog {
  private seq = 0;
  private readonly memory: ObserverEvent[] = [];
  private ready: Promise<void> = Promise.resolve();

  private constructor(private readonly filePath: string | null) {
    if (filePath) {
      this.ready = this.load();
    }
  }

  static memory(): DurableEventLog {
    return new DurableEventLog(null);
  }

  static async open(filePath: string): Promise<DurableEventLog> {
    const log = new DurableEventLog(path.resolve(filePath));
    await log.ready;
    return log;
  }

  /** Resolve path from env; null if disabled. */
  static async openFromEnv(): Promise<DurableEventLog> {
    const explicit = process.env.AST_EVENT_STREAM_PATH?.trim();
    if (explicit === '0' || explicit === 'off' || explicit === 'memory') {
      return DurableEventLog.memory();
    }
    if (explicit) {
      return DurableEventLog.open(explicit);
    }
    const dir = process.env.AST_JOURNAL_DIR?.trim() || 'data/journal';
    return DurableEventLog.open(path.join(dir, 'observer-events.jsonl'));
  }

  private async load(): Promise<void> {
    if (!this.filePath) return;
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      for (const line of raw.split('\n')) {
        if (!line.trim()) continue;
        const ev = JSON.parse(line) as ObserverEvent;
        this.memory.push(ev);
        if (ev.seq > this.seq) this.seq = ev.seq;
      }
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    }
  }

  async append(input: AppendObserverEventInput): Promise<ObserverEvent> {
    await this.ready;
    this.seq += 1;
    const ev: ObserverEvent = {
      seq: this.seq,
      at: new Date().toISOString(),
      ...input,
    };
    this.memory.push(ev);
    if (this.filePath) {
      await fs.appendFile(this.filePath, JSON.stringify(ev) + '\n', 'utf8');
    }
    return ev;
  }

  /**
   * Resume: events with seq > fromSeq (exclusive cursor).
   * Optional filters: types, fromHeight (inclusive journal height).
   */
  async query(opts?: {
    fromSeq?: number;
    fromHeight?: number;
    types?: string[];
    limit?: number;
  }): Promise<{ events: ObserverEvent[]; nextSeq: number; tipSeq: number }> {
    await this.ready;
    const fromSeq = Math.max(0, Math.floor(opts?.fromSeq ?? 0));
    const fromHeight =
      opts?.fromHeight != null ? Math.max(0, Math.floor(opts.fromHeight)) : undefined;
    const typeSet = opts?.types?.length ? new Set(opts.types) : null;
    const limit = Math.min(1000, Math.max(1, opts?.limit ?? 100));

    let rows = this.memory.filter((e) => e.seq > fromSeq);
    if (fromHeight != null) {
      rows = rows.filter((e) => e.height == null || e.height >= fromHeight);
    }
    if (typeSet) {
      rows = rows.filter((e) => typeSet.has(e.type));
    }
    const events = rows.slice(0, limit);
    const nextSeq =
      events.length > 0 ? events[events.length - 1].seq : fromSeq;
    return { events, nextSeq, tipSeq: this.seq };
  }

  tipSeq(): number {
    return this.seq;
  }

  /** In-memory snapshot (tests). */
  all(): ObserverEvent[] {
    return [...this.memory];
  }
}
