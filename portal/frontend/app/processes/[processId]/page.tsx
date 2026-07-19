'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadSession, portalFetch } from '../../../lib/session';

export default function ProcessStatusPage() {
  const params = useParams();
  const processId = decodeURIComponent(String(params.processId ?? ''));
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.replace('/login');
      return;
    }
    if (!processId) return;
    void portalFetch(`/v1/processes/${encodeURIComponent(processId)}`, {
      sessionId: s.sessionId,
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.message ?? res.statusText);
        setData(body);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [processId, router]);

  return (
    <div className="card">
      <p className="muted">
        <Link href="/dashboard">← Dashboard</Link>
      </p>
      <h1>Process status</h1>
      <p className="lead">
        <code>{processId}</code>
      </p>
      {error && <p className="err">{error}</p>}
      {data && (
        <>
          <p>
            Source:{' '}
            <span className={`badge ${data.source === 'core' ? 'ok' : 'warn'}`}>
              {String(data.source ?? 'edge')}
            </span>{' '}
            Status:{' '}
            <span className="badge">{String(data.status ?? data.stage ?? '—')}</span>
          </p>
          {data.potVerified === 1 && (
            <p className="ok">PoT verified=1 on core — economic path completed or available.</p>
          )}
          {data.mintAmount != null && (
            <p>
              Mint amount: <strong>{String(data.mintAmount)}</strong>
            </p>
          )}
          {data.valuation != null && (
            <p>
              Valuation: <strong>{String(data.valuation)}</strong>
            </p>
          )}
          <pre className="result">{JSON.stringify(data, null, 2)}</pre>
        </>
      )}
      {!data && !error && <p className="muted">Loading…</p>}
    </div>
  );
}
