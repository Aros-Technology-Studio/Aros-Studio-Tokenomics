'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadSession, portalFetch } from '../../../../lib/auth';
import { StatusBadge } from '../../../../components/ui/status-badge';
import { PIPELINE_STEPS } from '../../../../lib/status';

export default function ProcessStatusPage() {
  const params = useParams();
  const processId = decodeURIComponent(String(params.processId ?? ''));
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const s = loadSession();
    if (!s) {
      router.replace('/login');
      return;
    }
    if (!processId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await portalFetch(`/v1/processes/${encodeURIComponent(processId)}`, {
        sessionId: s.sessionId,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? res.statusText);
      setData(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [processId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const status = String(data?.status ?? data?.stage ?? '');
  const source = String(data?.source ?? 'edge');
  const submitted =
    status === 'submitted_to_core' || source === 'core' || data?.potVerified === 1;
  const potDone = data?.potVerified === 1 || data?.verified === 1;
  const mintDone =
    data?.mintAmount != null ||
    (data?.mint as { amount?: string } | undefined)?.amount != null ||
    status === 'settled' ||
    status === 'completed';

  function stepClass(id: string): string {
    if (id === 'admitted') return 'done';
    if (id === 'core') return submitted ? 'done' : status === 'awaiting_core' ? 'active' : '';
    if (id === 'pot') return potDone ? 'done' : submitted ? 'active' : '';
    if (id === 'mint') return mintDone ? 'done' : potDone ? 'active' : '';
    return '';
  }

  const mintAmount =
    data?.mintAmount ??
    (data?.mint as { amount?: string } | undefined)?.amount ??
    null;

  return (
    <div className="card">
      <p className="muted" style={{ marginTop: 0 }}>
        <Link href="/dashboard">← Dashboard</Link>
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <p className="muted" style={{ margin: 0 }}>
            Process status
          </p>
          <h1 style={{ wordBreak: 'break-all' }}>
            <code style={{ fontSize: '0.85em' }}>{processId}</code>
          </h1>
        </div>
        <button type="button" className="secondary" onClick={() => void load()}>
          Refresh
        </button>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="err">{error}</p>}

      {data && (
        <>
          <p style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <StatusBadge status={status} />
            <span className={`badge ${source === 'core' ? 'ok' : 'warn'}`}>
              source: {source}
            </span>
          </p>

          <h2>Pipeline</h2>
          <div className="timeline">
            {PIPELINE_STEPS.map((s) => (
              <div key={s.id} className={`item ${stepClass(s.id)}`.trim()}>
                <div className="t">{s.title}</div>
                <div className="d">{s.desc}</div>
              </div>
            ))}
          </div>

          <div className="grid2">
            <div className="card flat">
              <div className="muted">Valuation</div>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {String(
                  data.valuation ??
                    (data.edge as { valuation?: string } | undefined)?.valuation ??
                    '—',
                )}
              </div>
            </div>
            <div className="card flat">
              <div className="muted">Mint amount (Core only)</div>
              <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {mintAmount != null ? String(mintAmount) : '—'}
              </div>
            </div>
          </div>

          {potDone && (
            <p className="ok">PoT verified on core — economic path available or completed.</p>
          )}

          <h2>Raw response</h2>
          <pre className="result">{JSON.stringify(data, null, 2)}</pre>
        </>
      )}
    </div>
  );
}
