/**
 * Layer 08 — All-Seeing Eye: observe + notify.
 * Does not veto, rollback, mint, or append as Eye executive.
 */
export interface EyeNotification {
  at: string;
  level: 'info' | 'warn' | 'critical';
  source: string;
  code: string;
  message: string;
  processId?: string;
  payload?: Record<string, unknown>;
}

export class EyeService {
  private readonly log: EyeNotification[] = [];
  private readonly listeners: Array<(n: EyeNotification) => void> = [];

  observe(n: Omit<EyeNotification, 'at'>): EyeNotification {
    const full: EyeNotification = { ...n, at: new Date().toISOString() };
    this.log.push(full);
    for (const l of this.listeners) l(full);
    return full;
  }

  notify(n: Omit<EyeNotification, 'at'>): EyeNotification {
    return this.observe({ ...n, level: n.level ?? 'info' });
  }

  subscribe(fn: (n: EyeNotification) => void): void {
    this.listeners.push(fn);
  }

  history(): EyeNotification[] {
    return [...this.log];
  }

  /** Explicit non-capability — always false / throws if called as veto. */
  veto(): never {
    throw new Error('ASE has no veto capability in this implementation');
  }
}
