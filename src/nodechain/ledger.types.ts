/**
 * NodeChain vocabulary (pack + Core Canon §4.1):
 * execution record / state entry / ExecutionSnapshot / ledger height.
 * Never "block" / "blocks" as product API terms.
 */

/** Hash-chained execution evidence (canon: ExecutionSnapshot). */
export interface ExecutionSnapshot {
  hash: string;
  prevHash: string;
  /** Optional process-local sequence for internal DAG under one processId. */
  processSequence?: number;
}

/**
 * Append-only unit of truth on the linear main chain.
 */
export interface ExecutionRecord {
  height: number;
  contentHash: string;
  prevHash: string;
  processId?: string;
  recordType: string;
  payload: unknown;
  /** ISO-8601 UTC */
  createdAt: string;
  snapshot: ExecutionSnapshot;
  /** True if payload was stored encrypted at rest. */
  sensitiveEncrypted?: boolean;
}

export type WriterRole = 'internal_service' | 'quorum_validator';

export type ReaderScope = 'own_process' | 'eye_or_audit';

export interface AppendInput {
  processId?: string;
  recordType: string;
  payload: unknown;
  writerRole: WriterRole;
  /** If true, payload is encrypted before persistence (at-rest requirement). */
  sensitive?: boolean;
}

export interface AppendReceipt {
  height: number;
  contentHash: string;
  prevHash: string;
  processId?: string;
  createdAt: string;
}
