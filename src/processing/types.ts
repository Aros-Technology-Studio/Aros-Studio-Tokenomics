import type { ProcessTxBody } from '../tx-encoding/types';

/**
 * Process lifecycle stages (layer 03).
 * Happy path: opened → documents → encoded → awaiting_pot → pot_done → settled → closed
 * Fail path: any non-terminal → aborted
 */
export type ProcessStage =
  | 'opened'
  | 'documents'
  | 'encoded'
  | 'awaiting_pot'
  | 'pot_done'
  | 'settled'
  | 'closed'
  | 'aborted';

/** Terminal stages — no further transitions. */
export const TERMINAL_STAGES: ReadonlySet<ProcessStage> = new Set(['closed', 'aborted']);

/** Stages completed atomically on successful open (v1: encode + document flags in one open). */
export const OPEN_COMPLETED_STAGES: readonly ProcessStage[] = [
  'opened',
  'documents',
  'encoded',
  'awaiting_pot',
];

export interface ProcessAdmissibilityFlags {
  institutionAllowlisted: boolean;
  hasDocuments: boolean;
  hasQualifiedSignature: boolean;
}

export interface ProcessState {
  processId: string;
  processType: string;
  institutionId: string;
  stage: ProcessStage;
  stagesCompleted: ProcessStage[];
  payloadHash: string;
  encoded: string;
  schemaVersion: string;
  valuation?: string;
  holderId?: string;
  body: ProcessTxBody;
  flags: ProcessAdmissibilityFlags;
  openedAtUtc: string;
  abortReason?: string;
  settledAtUtc?: string;
  closedAtUtc?: string;
  abortedAtUtc?: string;
  potDoneAtUtc?: string;
}

export interface OpenProcessInput {
  processId: string;
  processType: string;
  institutionId: string;
  /** Full body for encoding (preferred for reval/transfer). */
  body?: ProcessTxBody;
  /** Primary-tokenization convenience fields. */
  valuation?: string;
  holderId?: string;
  institutionAllowlisted: boolean;
  hasDocuments: boolean;
  hasQualifiedSignature: boolean;
  /** Writer id for journal appends (default orchestrator). */
  writerId?: string;
}

export interface StageTransitionEvent {
  processId: string;
  from: ProcessStage;
  to: ProcessStage;
  atUtc: string;
  reason?: string;
}
