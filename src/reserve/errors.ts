export class ReserveError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ReserveError';
  }
}

export const ReserveErrorCode = {
  INVALID_AMOUNT: 'RESERVE_INVALID_AMOUNT',
  INSUFFICIENT: 'RESERVE_INSUFFICIENT',
  INVALID_PROCESS: 'RESERVE_INVALID_PROCESS',
  INVALID_ASSET: 'RESERVE_INVALID_ASSET',
  UNKNOWN_CLAIM: 'RESERVE_UNKNOWN_CLAIM',
  DOUBLE_ACCRUAL: 'RESERVE_DOUBLE_ACCRUAL',
} as const;
