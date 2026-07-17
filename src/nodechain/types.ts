/** NodeChain journal types — layer 01_NodeChain */

export type WriterRole =
  | 'system'
  | 'orchestrator'
  | 'pot'
  | 'emission'
  | 'token'
  | 'settlement'
  | 'nodes'
  | 'governance';

export interface RecordSignature {
  signerId: string;
  algorithm: string;
  signature: string;
  signedOver: 'contentHash' | 'envelope-v1';
}

export interface JournalRecord {
  recordId: string;
  schemaVersion: string;
  recordType: string;
  processId: string | null;
  writerId: string;
  writerRole: WriterRole;
  timestampUtc: string;
  prevHash: string;
  contentHash: string;
  height: number;
  payload: Record<string, unknown>;
  signatures: RecordSignature[];
  /** Full envelope hash used in the chain (includes height + prevHash). */
  envelopeHash: string;
}

export interface AppendRequest {
  clientRecordId?: string;
  recordType: string;
  processId?: string | null;
  payload: Record<string, unknown>;
  writerId: string;
  writerRole: WriterRole;
  /** Optional pre-supplied signatures; system may self-sign in local/dev. */
  signatures?: RecordSignature[];
}

export interface AppendResult {
  recordId: string;
  height: number;
  envelopeHash: string;
  timestampUtc: string;
  contentHash: string;
}

export interface Tip {
  height: number;
  tipHash: string;
}

export const GENESIS_PREV_HASH =
  '0000000000000000000000000000000000000000000000000000000000000000';

export const SCHEMA_VERSION = 'nc-record-1';
