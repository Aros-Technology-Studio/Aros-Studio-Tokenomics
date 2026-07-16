import { ExecutionRecord } from './ledger.types';

export const LEDGER_STORE = Symbol('LEDGER_STORE');

export type AppendRecordInput = {
  processId?: string;
  recordType: string;
  payload: unknown;
  createdAt: string;
  sensitiveEncrypted?: boolean;
};

/**
 * Primary append-only store.
 * Phase 1.1: memory implementation.
 * Phase 1.2: RocksDB primary (+ Postgres mirror separately).
 */
export interface LedgerStore {
  readonly height: number;
  tipHash(): string;
  append(record: AppendRecordInput): ExecutionRecord;
  getByHeight(height: number): ExecutionRecord | undefined;
  listByProcessId(processId: string): ExecutionRecord[];
  all(): readonly ExecutionRecord[];
  /** Verify linear chain integrity (I4 support). */
  verifyIntegrity(): { ok: boolean; error?: string };
}
