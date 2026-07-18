export const TX_SCHEMA_VERSION = 'ast-tx-2';
export const TX_CONTENT_TYPE = 'application/vnd.ast.tx+json';

export type ProcessTypeId =
  | 'primary_tokenization'
  | 'revaluation'
  | 'ownership_transfer'
  | string;

export interface ProcessTxBody {
  institutionId: string;
  valuation?: string;
  holderId?: string;
  fromHolderId?: string;
  toHolderId?: string;
  amount?: string;
  assetId?: string;
  previousValue?: string;
  newValue?: string;
  documentPackageHash?: string;
  /** Extension fields allowed if declared in schema extraKeys policy */
  [key: string]: unknown;
}

export interface ProcessTxInput {
  processId: string;
  processType: ProcessTypeId;
  body: ProcessTxBody;
  /** Optional metadata excluded from identity if not in canonical set */
  meta?: {
    epoch?: string;
    note?: string;
  };
}

export interface EncodedProcessTx {
  schemaVersion: string;
  contentType: string;
  processId: string;
  processType: string;
  /** Canonical UTF-8 JSON string (deterministic). */
  encoded: string;
  /** SHA-256 hex of encoded UTF-8 bytes. */
  payloadHash: string;
  /** Canonical body object (post-validation, post-normalize). */
  body: ProcessTxBody;
}

export interface DecodeResult {
  processId: string;
  processType: string;
  schemaVersion: string;
  body: ProcessTxBody;
  payloadHash: string;
  valid: boolean;
  reasonCodes: string[];
}
