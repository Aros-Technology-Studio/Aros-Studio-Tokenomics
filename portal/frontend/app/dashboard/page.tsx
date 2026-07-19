'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession, portalFetch } from '../../lib/session';

interface ProcessRow {
  processId: string;
  status: string;
  processType: string;
  valuation: string;
  holderId: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ProcessRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [institutionId, setInstitutionId] = useState('');

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.replace('/login');
      return;
    }
    setInstitutionId(s.institutionId);
    void portalFetch('/v1/processes', { sessionId: s.sessionId })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? res.statusText);
        setRows(data.processes ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [router]);

  return (
    <>
      <div className="card">
        <h1>Dashboard</h1>
        <p className="lead">
          Institution <strong>{institutionId}</strong> — processes submitted from this portal edge.
        </p>
        <p>
          <Link href="/processes/new">
            <button type="button" className="primary">
              New primary tokenization
            </button>
          </Link>
        </p>
        {error && <p className="err">{error}</p>}
      </div>

      <div className="card">
        <h2>Your processes</h2>
        {rows.length === 0 ? (
          <p className="muted">No processes yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Process</th>
                <th>Status</th>
                <th>Valuation</th>
                <th>Holder</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.processId}>
                  <td>
                    <Link href={`/processes/${encodeURIComponent(r.processId)}`}>
                      <code>{r.processId}</code>
                    </Link>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === 'submitted_to_core' ? 'ok' : 'warn'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>{r.valuation}</td>
                  <td>{r.holderId}</td>
                  <td className="muted">{new Date(r.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
