'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession, portalFetch } from '../../../lib/auth';
import { StatusBadge } from '../../../components/ui/status-badge';
import type { ProcessRow } from '../../../types/process';
import { T } from '../../../components/ui/t';

export default function HistoryPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ProcessRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.replace('/login');
      return;
    }
    void portalFetch('/v1/processes', { sessionId: s.sessionId })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? res.statusText);
        setRows(data.processes ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [router]);

  return (
    <div className="card">
      <h1>History</h1>
      <p className="lead">
        <T>Institution-scoped edge submission history. For Core / NodeChain truth, open process status (source: core when hand-off succeeded).</T>
      </p>
      {error && <p className="err">{error}</p>}
      {rows.length === 0 ? (
        <p className="muted"><T>No history yet.</T></p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th><T>When</T></th>
                <th><T>Process</T></th>
                <th><T>Status</T></th>
                <th><T>Valuation</T></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.processId}>
                  <td className="muted">{new Date(r.createdAt).toLocaleString()}</td>
                  <td>
                    <Link href={`/tokenization/${encodeURIComponent(r.processId)}`}>
                      <code>{r.processId}</code>
                    </Link>
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="mono">{r.valuation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
