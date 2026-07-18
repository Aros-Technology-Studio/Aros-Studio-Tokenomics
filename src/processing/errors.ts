export class ProcessError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: string[],
  ) {
    super(message);
    this.name = 'ProcessError';
  }
}

export const ProcessErrorCode = {
  ALREADY_EXISTS: 'PROC_ALREADY_EXISTS',
  NOT_FOUND: 'PROC_NOT_FOUND',
  INVALID_TRANSITION: 'PROC_INVALID_TRANSITION',
  TERMINAL: 'PROC_TERMINAL',
  INVALID_INPUT: 'PROC_INVALID_INPUT',
  ENCODING_FAILED: 'PROC_ENCODING_FAILED',
  HYDRATE_FAILED: 'PROC_HYDRATE_FAILED',
  ALREADY_SETTLED: 'PROC_ALREADY_SETTLED',
  ABORT_REASON_REQUIRED: 'PROC_ABORT_REASON_REQUIRED',
} as const;
