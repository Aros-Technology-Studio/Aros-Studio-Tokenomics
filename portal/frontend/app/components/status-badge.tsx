import { statusLabel, statusTone } from '../../lib/status';

export function StatusBadge({ status }: { status?: string }) {
  const tone = statusTone(status);
  return <span className={`badge ${tone}`.trim()}>{statusLabel(status)}</span>;
}
