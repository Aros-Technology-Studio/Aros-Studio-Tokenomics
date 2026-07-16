import { PotCriteriaId } from '../common/errors/error-codes';

export type PotServiceStatus = 'pending' | 'expired';

export interface CriteriaResult {
  P1: boolean;
  P2: boolean;
  P3: boolean;
  P4: boolean;
  reasonCodes?: Partial<Record<PotCriteriaId, string>>;
}

export interface PotEvidence {
  processId: string;
  executionSnapshot: { hash: string; prevHash: string };
  validatorIds: string[];
  /** Qualified e-signature material (opaque for v1 skeleton). */
  signatures: string[];
  criteriaResult: CriteriaResult;
}

export interface PotVerdict {
  processId: string;
  /** Binary economic gate (CANON). */
  verified: 0 | 1;
  status: PotServiceStatus | 'verified' | 'rejected';
  failedCriteria?: PotCriteriaId[];
  ledgerHeight?: number;
  contentHash?: string;
}
