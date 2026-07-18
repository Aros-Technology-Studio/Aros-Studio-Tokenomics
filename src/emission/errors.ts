export class EmissionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'EmissionError';
  }
}

export const EmissionErrorCode = {
  POT_REQUIRED: 'EMISSION_POT_REQUIRED',
  INVALID_VALUATION: 'EMISSION_INVALID_VALUATION',
  INVALID_PROCESS: 'EMISSION_INVALID_PROCESS',
  ZERO_DELTA: 'EMISSION_ZERO_DELTA',
  CAP_EXCEEDED: 'EMISSION_CAP_EXCEEDED',
} as const;
