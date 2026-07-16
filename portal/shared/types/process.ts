/**
 * Shared process view models for Portal FE/BE.
 * processId format: AST-{INST}-{YYYYMMDD}-<UUIDv7> (orchestrator pack / CANON defaults).
 */

export type ProcessStatus =
  | 'created'
  | 'documents_pending'
  | 'validating'
  | 'pot_pending'
  | 'settling'
  | 'completed'
  | 'failed'
  | 'expired';

export interface Process {
  processId: string;
  status: ProcessStatus;
  createdAt: string;
  currentStep?: string;
  claimId?: string;
}

export interface StartTokenizationRequest {
  assetType: 'real_estate' | 'bond' | 'investment_package' | 'other';
  /** Decimal string — institutional valuation; AST does not compute this. */
  institutionalValuation: string;
  currency: string;
  /** Mandatory StartProcess dedupe key. */
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}
