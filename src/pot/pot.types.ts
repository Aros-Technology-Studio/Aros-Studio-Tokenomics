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
  /** Full assigned set for this process (N). */
  assignedValidatorIds: string[];
  /** Validators that submitted confirmation (subset of assigned). */
  validatorIds: string[];
  /** One signature per confirming validator (aligned with validatorIds). */
  signatures: string[];
  criteriaResult: CriteriaResult;
}

export interface PotVerdict {
  processId: string;
  verified: 0 | 1;
  status: PotServiceStatus | 'verified' | 'rejected';
  failedCriteria?: PotCriteriaId[];
  reasonCodes?: Partial<Record<PotCriteriaId, string>>;
  ledgerHeight?: number;
  contentHash?: string;
  quorumRequired?: number;
  quorumActual?: number;
}
