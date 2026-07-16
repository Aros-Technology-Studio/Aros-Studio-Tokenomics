/**
 * NodeChain uses execution records / state entries — never "blocks" (nodechain pack).
 */
export interface ExecutionRecord {
  height: number;
  contentHash: string;
  prevHash: string;
  processId?: string;
  recordType: string;
  payload: unknown;
  createdAt: string; // ISO UTC
}

export interface AppendInput {
  processId?: string;
  recordType: string;
  payload: unknown;
  /** Role-authorized writer (internal service or quorum validator path). */
  writerRole: 'internal_service' | 'quorum_validator';
}
