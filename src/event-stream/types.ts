/**
 * Observer event stream (B4) — outbound only, at-least-once, resume by seq / height.
 * Payloads: ids and hashes only (no raw document bytes).
 */

export type ObserverEventType =
  | 'eye.notification'
  | 'record_appended'
  | 'tip_advanced'
  | 'append_rejected'
  | 'read_only_entered';

export interface ObserverEvent {
  /** Monotonic durable sequence (1-based). */
  seq: number;
  at: string;
  type: ObserverEventType | string;
  /** Journal height when applicable. */
  height?: number;
  recordId?: string;
  recordType?: string;
  processId?: string | null;
  writerId?: string;
  tipHash?: string;
  code?: string;
  level?: string;
  source?: string;
  message?: string;
  /** Non-sensitive structured fields only. */
  data?: Record<string, unknown>;
}

export interface AppendObserverEventInput {
  type: ObserverEventType | string;
  height?: number;
  recordId?: string;
  recordType?: string;
  processId?: string | null;
  writerId?: string;
  tipHash?: string;
  code?: string;
  level?: string;
  source?: string;
  message?: string;
  data?: Record<string, unknown>;
}
