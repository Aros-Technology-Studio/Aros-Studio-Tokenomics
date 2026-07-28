export type BadgeTone = 'ok' | 'warn' | 'danger' | 'info' | '';

export function statusTone(status: string | undefined): BadgeTone {
  const s = (status ?? '').toLowerCase();
  if (
    s === 'submitted_to_core' ||
    s === 'settled' ||
    s === 'completed' ||
    s === 'verified' ||
    s === 'pot_done'
  ) {
    return 'ok';
  }
  if (s === 'rejected' || s === 'failed' || s === 'aborted') return 'danger';
  if (s === 'awaiting_core' || s === 'documents_pending' || s === 'duplicate') {
    return 'warn';
  }
  if (s === 'accepted' || s === 'running') return 'info';
  return '';
}

export function statusLabel(status: string | undefined): string {
  if (!status) return '—';
  const map: Record<string, string> = {
    awaiting_core: 'Waiting for Core hand-off',
    submitted_to_core: 'Handed off to Core',
    completed: 'Completed',
    settled: 'Settled (mint recorded)',
    pot_done: 'PoT done',
    documents_pending: 'Documents pending',
    rejected: 'Rejected',
    duplicate: 'Duplicate (idempotent)',
  };
  return map[status] ?? status.replace(/_/g, ' ');
}

/** Pipeline steps shown on status page (portal edge view). */
export const PIPELINE_STEPS = [
  { id: 'admitted', title: 'Admitted at edge', desc: 'Valuation + package hash accepted' },
  { id: 'core', title: 'Core hand-off', desc: 'Orchestrator received process' },
  { id: 'pot', title: 'PoT verification', desc: 'Proof of Transaction on NodeChain' },
  { id: 'mint', title: 'Economic settle', desc: 'Mint only after PoT (Core only)' },
] as const;

export type ProgressStep = {
  id: string;
  title: string;
  state: 'done' | 'active' | 'pending';
  detail?: string;
};

export type ProgressPayload = {
  percent: number;
  currentStepId: string;
  currentTitle: string;
  currentDetail: string;
  handedOff: boolean;
  potDone: boolean;
  mintDone: boolean;
  steps: ProgressStep[];
  message: string;
  coreErrorCode?: string | null;
  coreErrorMessage?: string | null;
};
