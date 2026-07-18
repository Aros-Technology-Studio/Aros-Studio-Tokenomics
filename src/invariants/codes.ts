/**
 * Core Canon §XI — hard invariants.
 * Fail-closed: violation throws InvariantError; never soft-warn into emission.
 */
export const InvariantId = {
  I1: 'I1',
  I2: 'I2',
  I3: 'I3',
  I4: 'I4',
  I5: 'I5',
  I6: 'I6',
  I7: 'I7',
  I8: 'I8',
  I9: 'I9',
} as const;

export type InvariantId = (typeof InvariantId)[keyof typeof InvariantId];

export const INVARIANT_TEXT: Record<InvariantId, string> = {
  I1: 'Value arises only when verified = 1 (PoT)',
  I2: 'Every emission / burn is bound to a confirmed process',
  I3: 'Every significant event is recorded in NodeChain',
  I4: 'Determinism: same input → one result',
  I5: 'What is earned is retained; speculative holding is forbidden',
  I6: 'AST holds only its own funds',
  I7: 'The token always reflects the current confirmed value of the asset',
  I8: 'Until Release Phase, circulation is limited to internal roles',
  I9: 'New emission is always distributed pro-rata to current holders',
};
