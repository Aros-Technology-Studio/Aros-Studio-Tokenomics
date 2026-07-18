export class EncodingError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: string[],
  ) {
    super(message);
    this.name = 'EncodingError';
  }
}

export const EncodingErrorCode = {
  SCHEMA: 'TX_SCHEMA',
  INVALID_PROCESS_ID: 'TX_INVALID_PROCESS_ID',
  INVALID_PROCESS_TYPE: 'TX_INVALID_PROCESS_TYPE',
  INVALID_AMOUNT: 'TX_INVALID_AMOUNT',
  MISSING_FIELD: 'TX_MISSING_FIELD',
  FORBIDDEN_FIELD: 'TX_FORBIDDEN_FIELD',
  HASH_MISMATCH: 'TX_HASH_MISMATCH',
  DECODE_FAILED: 'TX_DECODE_FAILED',
  EMPTY_BODY: 'TX_EMPTY_BODY',
} as const;
