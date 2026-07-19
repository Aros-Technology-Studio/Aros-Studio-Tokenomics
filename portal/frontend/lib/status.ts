export type BadgeTone = 'ok' | 'warn' | 'danger' | 'info' | '';

export function statusTone(status: string | undefined): BadgeTone {
  const s = (status ?? '').toLowerCase();
  if (
    s === 'submitted_to_core' ||
    s === 'settled' ||
    s === 'completed' ||
    s === 'verified'
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
  return status.replace(/_/g, ' ');
}

/** Pipeline steps shown on status page (portal edge view). */
export const PIPELINE_STEPS = [
  { id: 'admitted', title: 'Admitted at edge', desc: 'Valuation + package hash accepted' },
  { id: 'core', title: 'Core hand-off', desc: 'Orchestrator received process' },
  { id: 'pot', title: 'PoT verification', desc: 'Proof of Transaction on NodeChain' },
  { id: 'mint', title: 'Economic settle', desc: 'Mint only after PoT (Core only)' },
] as const;
