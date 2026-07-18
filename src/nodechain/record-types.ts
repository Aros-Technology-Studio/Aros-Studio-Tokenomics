/** Registered record types for v1 (see docs/layers/01_NodeChain). */

export const PROCESS_SCOPED_TYPES = new Set([
  'process_open',
  'process_stage',
  'process_close',
  'process_abort',
  'pot_evidence',
  'pot_verdict',
  'mint_fact',
  'burn_fact',
  'transfer_fact',
  'revaluation_fact',
  'commission_settled',
  'payment_credited',
  'reserve_accrual',
  'reserve_release',
]);

export const KNOWN_TYPES = new Set([
  'genesis',
  'execution_snapshot',
  'node_register',
  'node_suspend',
  'node_restore',
  'param_change',
  ...PROCESS_SCOPED_TYPES,
  /** First application record after genesis — marks journal operational. */
  'system_boot',
]);

export function isProcessScoped(recordType: string): boolean {
  return PROCESS_SCOPED_TYPES.has(recordType);
}
