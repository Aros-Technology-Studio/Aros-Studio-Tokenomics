import type { PotReasonCode } from './reason-codes';
import type { ConfirmerAttestation } from './attestation';

export const POT_EVIDENCE_SCHEMA = 'pot-evidence-2';
export const POT_VERDICT_SCHEMA = 'pot-verdict-2';

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
  schemaVersion: typeof POT_EVIDENCE_SCHEMA | string;
  institutionAllowlisted: boolean;
  hasDocuments: boolean;
  hasQualifiedSignature: boolean;
  stagesCompleted: string[];
  requiredStages: string[];
  journalHeights: number[];
  processOpenHeight: number | null;
  tipHeight: number;
  tipHash: string;
  /** Eligible validators after registry filter. */
  validatorIds: string[];
  /** Confirmer ids that produced valid attestations. */
  confirmers: string[];
  attestationDigest: string;
  attestations: ConfirmerAttestation[];
  openedAtUtc: string | null;
  evaluatedAtUtc: string;
  valuationPresent: boolean;
  holderPresent: boolean;
}

export interface PotVerdict {
  processId: string;
  schemaVersion: typeof POT_VERDICT_SCHEMA | string;
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
  attestationDigest: string;
  tipHeight: number;
  tipHash: string;
  final: boolean;
  expired: boolean;
  challengeBlocked: boolean;
}

export interface PotConfig {
  timeoutMs: number;
  quorumRatio: number;
  kMin: number;
  /** Override required stages; if empty, process-type catalog is used. */
  requiredStages?: string[];
  /** Require Ed25519 attestations from confirmers (default true). */
  requireAttestations: boolean;
}

export const defaultPotConfig: PotConfig = {
  timeoutMs: POT_TIMEOUT_MS,
  quorumRatio: 2 / 3,
  kMin: 3,
  requireAttestations: true,
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
