/**
 * Layer 08 — All-Seeing Eye: observe + notify.
 * Does not veto, rollback, mint, or append as All-Seeing Eye executive.
 */
export interface AllSeeingEyeNotification {
  at: string;
  level: 'info' | 'warn' | 'critical';
  source: string;
  code: string;
  message: string;
  processId?: string;
  payload?: Record<string, unknown>;
}

export class AllSeeingEyeService {
  private readonly log: AllSeeingEyeNotification[] = [];
  private readonly listeners: Array<(n: AllSeeingEyeNotification) => void> = [];

  observe(n: Omit<AllSeeingEyeNotification, 'at'>): AllSeeingEyeNotification {
    const full: AllSeeingEyeNotification = { ...n, at: new Date().toISOString() };
    this.log.push(full);
    for (const l of this.listeners) l(full);
    return full;
  }

  notify(n: Omit<AllSeeingEyeNotification, 'at'>): AllSeeingEyeNotification {
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
