export type ProcessTypeId =
  | 'primary_tokenization'
  | 'revaluation'
  | 'ownership_transfer';

export type EdgeProcessStatus =
  | 'accepted'
  | 'awaiting_core'
  | 'documents_pending'
  | 'submitted_to_core'
  | 'rejected'
  | 'duplicate';

export interface CreateProcessBody {
  processId?: string;
  processType: ProcessTypeId;
  valuation: string;
  holderId: string;
  assetId?: string;
  hasQualifiedSignature: boolean;
  documentPackageHash: string;
  note?: string;
}

export interface AttachDocumentsBody {
  documentPackageHash: string;
  hasQualifiedSignature: boolean;
  documentCount?: number;
}

export interface ProcessRecord {
  processId: string;
  institutionId: string;
  processType: ProcessTypeId;
  status: EdgeProcessStatus;
  valuation: string;
  holderId: string;
  assetId?: string;
  hasQualifiedSignature: boolean;
  documentPackageHash: string;
  idempotencyKey: string;
  payloadFingerprint: string;
  createdAt: string;
  updatedAt: string;
  note?: string;
}

export type PortalErrorCode =
  | 'VALIDATION_ERROR'
  | 'MISSING_VALUATION'
  | 'MISSING_QUALIFIED_SIGNATURE'
  | 'MISSING_DOCUMENTS'
  | 'INVALID_PROCESS_ID'
  | 'IDEMPOTENCY_REQUIRED'
  | 'IDEMPOTENCY_PAYLOAD_MISMATCH'
  | 'NOT_FOUND'
  | 'FORBIDDEN';

export interface PortalErrorBody {
  code: PortalErrorCode;
  message: string;
  details?: string[];
}
