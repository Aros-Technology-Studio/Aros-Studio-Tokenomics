export class CommissionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'CommissionError';
  }
}

export const CommissionErrorCode = {
  POT_REQUIRED: 'COMM_POT_REQUIRED',
  ALREADY_SETTLED: 'COMM_ALREADY_SETTLED',
  INVALID_SCHEDULE: 'COMM_INVALID_SCHEDULE',
  INVALID_WEIGHTS: 'COMM_INVALID_WEIGHTS',
  INVALID_VALUATION: 'COMM_INVALID_VALUATION',
  INVALID_PROCESS: 'COMM_INVALID_PROCESS',
  WAIVER_INVALID: 'COMM_WAIVER_INVALID',
} as const;
