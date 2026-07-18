import type { OraclePackage } from '../oracle-gateway/types';

export type OrchestratorStepId =
  | 'start'
  | 'docs'
  | 'l1'
  | 'l2'
  | 'process_open'
  | 'oracle'
  | 'pot'
  | 'l3'
  | 'emission'
  | 'settlement'
  | 'reserve'
  | 'state'
  | 'end';

export interface OrchestratorStepLog {
  step: OrchestratorStepId;
  atUtc: string;
  ok: boolean;
  detail?: string;
}

export interface OrchestratorPrimaryInput {
  institutionId: string;
  valuation: string;
  holderId: string;
  /** Mandatory sole-entry idempotency (Orchestrator P2). */
  idempotencyKey: string;
  assetId?: string;
  processId?: string;
  feeRate?: number;
  confirmers?: string[];
  validators?: string[];
  requireL2?: boolean;
  l2Approvers?: string[];
  requireL3?: boolean;
  institutionAllowlisted?: boolean;
  hasDocuments?: boolean;
  hasQualifiedSignature?: boolean;
  documentPackageHash?: string;
  /**
   * Optional multi-oracle package. When set, orchestrator fail-closes on invalid quorum.
   * When omitted, oracle step is skipped.
   */
  oracle?: OraclePackage;
  /** When true, require oracle package (fail if missing). Default false. */
  requireOracle?: boolean;
}
