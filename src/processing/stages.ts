import type { ProcessStage } from './types';
import { TERMINAL_STAGES } from './types';
import { ProcessError, ProcessErrorCode } from './errors';

/**
 * Explicit allowed edges for the process FSM.
 * Open is atomic (lands on awaiting_pot); subsequent steps are single edges.
 */
const ALLOWED: Record<ProcessStage, readonly ProcessStage[]> = {
  opened: ['documents', 'aborted'],
  documents: ['encoded', 'aborted'],
  encoded: ['awaiting_pot', 'aborted'],
  awaiting_pot: ['pot_done', 'aborted'],
  pot_done: ['settled', 'closed', 'aborted'],
  settled: ['closed', 'aborted'],
  closed: [],
  aborted: [],
};

export function canTransition(from: ProcessStage, to: ProcessStage): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

export function assertTransition(from: ProcessStage, to: ProcessStage, processId: string): void {
  if (TERMINAL_STAGES.has(from)) {
    throw new ProcessError(
      ProcessErrorCode.TERMINAL,
      `process ${processId} is terminal (${from}); cannot move to ${to}`,
    );
  }
  if (!canTransition(from, to)) {
    throw new ProcessError(
      ProcessErrorCode.INVALID_TRANSITION,
      `invalid transition ${from} → ${to} for ${processId}`,
      [`from=${from}`, `to=${to}`],
    );
  }
}

export function isTerminal(stage: ProcessStage): boolean {
  return TERMINAL_STAGES.has(stage);
}

export function allowedNext(from: ProcessStage): readonly ProcessStage[] {
  return ALLOWED[from] ?? [];
}
