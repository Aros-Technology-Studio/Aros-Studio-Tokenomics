export class PartialReleaseError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'PartialReleaseError';
  }
}

export const PartialReleaseErrorCode = {
  APPROVAL_REQUIRED: 'PR_APPROVAL_REQUIRED',
  INVALID_AMOUNT: 'PR_INVALID_AMOUNT',
  INSUFFICIENT_BALANCE: 'PR_INSUFFICIENT_BALANCE',
  POT_REQUIRED: 'PR_POT_REQUIRED',
  DUST: 'PR_DUST',
  INVALID_PROCESS: 'PR_INVALID_PROCESS',
} as const;
