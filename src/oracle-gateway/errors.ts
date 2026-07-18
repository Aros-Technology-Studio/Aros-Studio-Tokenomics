export class OracleError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: string[],
  ) {
    super(message);
    this.name = 'OracleError';
  }
}

export const OracleErrorCode = {
  FAIL_CLOSED: 'ORACLE_FAIL_CLOSED',
  INSUFFICIENT: 'ORACLE_INSUFFICIENT',
  BAD_SIGNATURE: 'ORACLE_BAD_SIGNATURE',
  UNKNOWN_ORACLE: 'ORACLE_UNKNOWN',
  EMPTY: 'ORACLE_EMPTY',
  PROCESS_MISMATCH: 'ORACLE_PROCESS_MISMATCH',
} as const;
