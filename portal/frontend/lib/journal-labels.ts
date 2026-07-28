/**
 * Human-readable labels for NodeChain journal records (blockchain-style explorer).
 * Technical codes stay in API; UI shows plain language. English only.
 */

export type EventKind =
  | 'genesis'
  | 'process'
  | 'proof'
  | 'token'
  | 'settlement'
  | 'governance'
  | 'system'
  | 'other';

export interface EventLabel {
  /** Short title for tables */
  title: string;
  /** One-line plain description */
  description: string;
  kind: EventKind;
}

const LABELS: Record<string, EventLabel> = {
  genesis: {
    title: 'Journal open',
    description: 'First chain record — journal created and ready for registration.',
    kind: 'genesis',
  },
  system_boot: {
    title: 'System boot',
    description: 'Operational start after genesis.',
    kind: 'system',
  },
  process_open: {
    title: 'Process opened',
    description: 'A new process (case / deal) was registered.',
    kind: 'process',
  },
  process_stage: {
    title: 'Process stage',
    description: 'Process moved to the next processing stage.',
    kind: 'process',
  },
  process_close: {
    title: 'Process closed',
    description: 'Process completed successfully.',
    kind: 'process',
  },
  process_abort: {
    title: 'Process aborted',
    description: 'Process interrupted before completion.',
    kind: 'process',
  },
  pot_evidence: {
    title: 'PoT evidence',
    description: 'Evidence collected for transaction verification.',
    kind: 'proof',
  },
  pot_verdict: {
    title: 'PoT verdict',
    description: 'Proof of Transaction outcome: verified or rejected.',
    kind: 'proof',
  },
  pot_challenge_open: {
    title: 'Challenge opened',
    description: 'Challenge procedure started.',
    kind: 'proof',
  },
  pot_challenge_close: {
    title: 'Challenge closed',
    description: 'Challenge procedure finished.',
    kind: 'proof',
  },
  mint_fact: {
    title: 'ARO mint',
    description: 'Token issuance recorded after confirmed PoT.',
    kind: 'token',
  },
  burn_fact: {
    title: 'ARO burn',
    description: 'Token burn recorded.',
    kind: 'token',
  },
  transfer_fact: {
    title: 'ARO transfer',
    description: 'Rights / balance transferred between holders.',
    kind: 'token',
  },
  revaluation_fact: {
    title: 'Revaluation',
    description: 'Valuation change → proportional supply recalculation.',
    kind: 'token',
  },
  emission_fact: {
    title: 'Emission policy',
    description: 'Emission step recorded (valuation / ΔValue).',
    kind: 'token',
  },
  commission_settled: {
    title: 'Commission settled',
    description: 'Fee split (70/30) recorded in the journal.',
    kind: 'settlement',
  },
  payment_credited: {
    title: 'Payment credited',
    description: 'Node credited with a commission share.',
    kind: 'settlement',
  },
  reserve_accrual: {
    title: 'Reserve accrual',
    description: 'Funds allocated to the AST reserve.',
    kind: 'settlement',
  },
  reserve_release: {
    title: 'Reserve release',
    description: 'Partial or scheduled release from reserve.',
    kind: 'settlement',
  },
  partial_release_fact: {
    title: 'Partial release',
    description: 'Partial-release operation (burn + remint remainder).',
    kind: 'token',
  },
  orchestrator_step: {
    title: 'Orchestrator step',
    description: 'Pipeline service step (for audit).',
    kind: 'system',
  },
  oracle_report: {
    title: 'Oracle report',
    description: 'External oracle data accepted into the process.',
    kind: 'proof',
  },
  node_register: {
    title: 'Node registered',
    description: 'New node added to the network.',
    kind: 'governance',
  },
  node_suspend: {
    title: 'Node suspended',
    description: 'Node temporarily excluded from operation.',
    kind: 'governance',
  },
  node_restore: {
    title: 'Node restored',
    description: 'Node re-admitted to operation.',
    kind: 'governance',
  },
  param_change: {
    title: 'Parameter change',
    description: 'System parameter change recorded.',
    kind: 'governance',
  },
  execution_snapshot: {
    title: 'Execution snapshot',
    description: 'Journal checkpoint snapshot.',
    kind: 'system',
  },
};

const ROLE_LABELS: Record<string, string> = {
  system: 'System',
  orchestrator: 'Orchestrator',
  pot: 'PoT',
  emission: 'Emission',
  token: 'Token protocol',
  settlement: 'Settlement',
  nodes: 'Nodes',
  governance: 'Governance',
};

export function labelForType(recordType?: string): EventLabel {
  if (!recordType) {
    return { title: 'Record', description: 'Journal event.', kind: 'other' };
  }
  return (
    LABELS[recordType] ?? {
      title: recordType.replace(/_/g, ' '),
      description: 'NodeChain event.',
      kind: 'other',
    }
  );
}

export function roleLabel(role?: string, writerId?: string): string {
  const r = role ? ROLE_LABELS[role] ?? role : '';
  if (writerId && r) return `${r} · ${writerId}`;
  if (writerId) return writerId;
  return r || '—';
}

/** Plain-language summary from payload when useful. */
export function summarizePayload(
  recordType: string | undefined,
  payload: Record<string, unknown> | undefined,
): string | null {
  if (!payload) return null;
  if (recordType === 'mint_fact' || recordType === 'burn_fact') {
    const amount = payload.amount != null ? String(payload.amount) : null;
    const holder = payload.holderId != null ? String(payload.holderId) : null;
    if (amount && holder) return `${amount} ARO · holder ${holder}`;
    if (amount) return `${amount} ARO`;
  }
  if (recordType === 'pot_verdict') {
    const v = payload.verified;
    if (v === 1) return 'Verified (verified = 1)';
    if (v === 0) return 'Not verified (verified = 0)';
  }
  if (recordType === 'process_stage' && payload.stage != null) {
    return `Stage: ${String(payload.stage)}`;
  }
  if (recordType === 'orchestrator_step' && payload.step != null) {
    return `Step: ${String(payload.step)}`;
  }
  if (recordType === 'transfer_fact') {
    const from = payload.fromHolderId != null ? String(payload.fromHolderId) : '?';
    const to = payload.toHolderId != null ? String(payload.toHolderId) : '?';
    const amount = payload.amount != null ? String(payload.amount) : '';
    return `${from} → ${to}${amount ? ` · ${amount} ARO` : ''}`;
  }
  if (recordType === 'commission_settled' && payload.totalFee != null) {
    return `Fee: ${String(payload.totalFee)} ARO`;
  }
  return null;
}

export function formatWhen(iso?: string): { date: string; time: string; relative: string } {
  if (!iso) return { date: '—', time: '—', relative: '—' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: iso, time: '', relative: '' };
  const date = d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const sec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  let relative: string;
  if (sec < 60) relative = `${sec}s ago`;
  else if (sec < 3600) relative = `${Math.floor(sec / 60)}m ago`;
  else if (sec < 86400) relative = `${Math.floor(sec / 3600)}h ago`;
  else relative = `${Math.floor(sec / 86400)}d ago`;
  return { date, time, relative };
}

export function shortHash(h?: string | null, n = 10): string {
  if (!h) return '—';
  if (h.replace(/0/g, '') === '') return '∅ (genesis parent)';
  return h.length <= n * 2 ? h : `${h.slice(0, n)}…${h.slice(-4)}`;
}
