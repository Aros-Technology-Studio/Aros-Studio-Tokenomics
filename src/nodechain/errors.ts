export class NodeChainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'NodeChainError';
  }
}

export const NcErrorCode = {
  UNAUTHENTICATED: 'E_UNAUTHENTICATED',
  UNAUTHORIZED: 'E_UNAUTHORIZED',
  SCHEMA: 'E_SCHEMA',
  HASH_MISMATCH: 'E_HASH_MISMATCH',
  BAD_SIGNATURE: 'E_BAD_SIGNATURE',
  IDEMPOTENT_CONFLICT: 'E_IDEMPOTENT_CONFLICT',
  PROCESS_REQUIRED: 'E_PROCESS_REQUIRED',
  UNKNOWN_TYPE: 'E_UNKNOWN_TYPE',
  READ_ONLY: 'E_READ_ONLY',
  STORAGE: 'E_STORAGE',
  NOT_FOUND: 'E_NOT_FOUND',
  ALREADY_GENESIS: 'E_ALREADY_GENESIS',
  NO_GENESIS: 'E_NO_GENESIS' } as const;
