import type { ProcessStage } from './types';
import { TERMINAL_STAGES } from './types';
import { ProcessError, ProcessErrorCode } from './errors';

/**
 * Explicit allowed edges for the process FSM.
 * Open is atomic (lands on awaiting_pot); subsequent steps are single edges.
 *
 * Layer 03 owns lifecycle only — no mint, fee, or PoT evaluation here.
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

/** Canonical stage order for docs / diagnostics (not a path guarantee). */
export const STAGE_ORDER: readonly ProcessStage[] = [
  'opened',
  'documents',
  'encoded',
  'awaiting_pot',
  'pot_done',
  'settled',
  'closed',
  'aborted',
];

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

/** All FSM edges as { from, to } pairs (for docs / tests). */
export function listFsmEdges(): Array<{ from: ProcessStage; to: ProcessStage }> {
  const out: Array<{ from: ProcessStage; to: ProcessStage }> = [];
  for (const from of Object.keys(ALLOWED) as ProcessStage[]) {
    for (const to of ALLOWED[from]) {
      out.push({ from, to });
    }
  }
  return out;
}

export function isProcessStage(value: string): value is ProcessStage {
  return (STAGE_ORDER as readonly string[]).includes(value);
}
