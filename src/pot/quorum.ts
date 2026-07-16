/**
 * M-of-N quorum (default 2/3 of assigned validators).
 * Multi-node same institution counts as separate node ids here;
 * institutional 1-vote policy is applied by callers when building assigned lists.
 */
export function requiredQuorum(assignedCount: number, ratio = 2 / 3): number {
  if (assignedCount <= 0) return Infinity;
  return Math.ceil(assignedCount * ratio);
}

export function quorumMet(
  assignedValidatorIds: string[],
  confirmingValidatorIds: string[],
  ratio = 2 / 3,
): boolean {
  const assigned = new Set(assignedValidatorIds);
  if (assigned.size === 0) return false;
  const uniqueConfirming = [
    ...new Set(confirmingValidatorIds.filter((id) => assigned.has(id))),
  ];
  return uniqueConfirming.length >= requiredQuorum(assigned.size, ratio);
}
