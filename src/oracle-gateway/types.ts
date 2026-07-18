export interface OracleAttestation {
  oracleId: string;
  /** Canonical payload fields the oracle signed over. */
  payload: {
    processId: string;
    /** Optional institutional reference price / observation (decimal string). */
    observedValue?: string;
    asOfUtc: string;
    note?: string;
  };
  /** Ed25519 signature over oracle digest (hex). */
  signature: string;
}

export interface OraclePackage {
  processId: string;
  /** Expected digest material version. */
  schemaVersion?: string;
  attestations: OracleAttestation[];
}

export interface OracleVerifyResult {
  ok: boolean;
  processId: string;
  required: number;
  validOracleIds: string[];
  invalidOracleIds: string[];
  reasonCodes: string[];
  digest: string;
}
