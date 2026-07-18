export class OrchestratorError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'OrchestratorError';
  }
}

export const OrchestratorErrorCode = {
  IDEMPOTENCY_REQUIRED: 'ORCH_IDEMPOTENCY_REQUIRED',
  IDEMPOTENCY_CONFLICT: 'ORCH_IDEMPOTENCY_CONFLICT',
  INVALID_PROCESS_ID: 'ORCH_INVALID_PROCESS_ID',
  L1_FAILED: 'ORCH_L1_FAILED',
  L2_FAILED: 'ORCH_L2_FAILED',
  L3_FAILED: 'ORCH_L3_FAILED',
  POT_FAILED: 'ORCH_POT_FAILED',
  ORACLE_FAILED: 'ORCH_ORACLE_FAILED',
  CONCURRENT_LIMIT: 'ORCH_CONCURRENT_LIMIT',
  KILL_SWITCH: 'ORCH_KILL_SWITCH',
} as const;
