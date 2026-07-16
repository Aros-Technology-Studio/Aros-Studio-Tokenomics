export interface OracleAttestation {
  oracleId: string;
  /** Opaque attested payload (e.g. market transport — not AST self-appraisal). */
  payload: unknown;
  /** Signature over payload (verified in service). */
  signature: string;
  publicKey: string;
}

export interface OracleGatewayResult {
  ok: boolean;
  processId: string;
  acceptedCount: number;
  requiredCount: number;
  reasonCode?: string;
}
