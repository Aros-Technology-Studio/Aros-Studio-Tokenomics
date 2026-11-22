import { statusLabel, statusTone } from '../../lib/status';
import { T } from './t';


export function StatusBadge({ status }: { status?: string }) {
  const tone = statusTone(status);
  return <span className={`badge ${tone}`.trim()}><T>{statusLabel(status)}</T></span>;
}
