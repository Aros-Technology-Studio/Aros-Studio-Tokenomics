import type { PotReasonCode } from './reason-codes';

export const POT_EVIDENCE_SCHEMA = 'pot-evidence-1';
export const POT_VERDICT_SCHEMA = 'pot-verdict-1';

/** Default PoT confirmation window (Core Canon §XII). */
export const POT_TIMEOUT_MS = 15 * 60 * 1000;

export const DEFAULT_REQUIRED_STAGES = ['opened', 'documents', 'encoded'] as const;

export interface CriteriaResult {
  P1: boolean;
  P2: boolean;
  P3: boolean;
  P4: boolean;
}

export interface QuorumResult {
  ok: boolean;
  K: number;
  Q: number;
  confirmerCount: number;
  reasonCodes: PotReasonCode[];
}

export interface PotEvidencePackage {
  processId: string;
  processType: string;
  schemaVersion: typeof POT_EVIDENCE_SCHEMA;
  institutionAllowlisted: boolean;
  hasDocuments: boolean;
  hasQualifiedSignature: boolean;
  stagesCompleted: string[];
  requiredStages: string[];
  journalHeights: number[];
  processOpenHeight: number | null;
  tipHeight: number;
  tipHash: string;
  validatorIds: string[];
  confirmers: string[];
  openedAtUtc: string | null;
  evaluatedAtUtc: string;
  valuationPresent: boolean;
  holderPresent: boolean;
}

export interface PotVerdict {
  processId: string;
  schemaVersion: typeof POT_VERDICT_SCHEMA;
  verified: 0 | 1;
  reasonCodes: PotReasonCode[];
  criteriaResult: CriteriaResult;
  quorum: QuorumResult;
  evidenceRecordId: string;
  evidenceHeight: number;
  verdictRecordId: string;
  ledgerHeight: number;
  validatorIds: string[];
  confirmers: string[];
  tipHeight: number;
  tipHash: string;
  final: boolean;
  expired: boolean;
}

export interface PotConfig {
  timeoutMs: number;
  quorumRatio: number;
  kMin: number;
  requiredStages: string[];
}

export const defaultPotConfig: PotConfig = {
  timeoutMs: POT_TIMEOUT_MS,
  quorumRatio: 2 / 3,
  kMin: 3,
  requiredStages: [...DEFAULT_REQUIRED_STAGES],
};

export class PotError extends Error {
  constructor(
    public readonly code: PotReasonCode,
    message: string,
  ) {
    super(message);
    this.name = 'PotError';
  }
}
