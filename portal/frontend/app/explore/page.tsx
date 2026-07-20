'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { apiBase } from '../../lib/auth';
import { StatusBadge } from '../../components/ui/status-badge';

/**
 * Public process explorer — no login, no institution key.
 */
export default function ExplorePage() {
  const [processId, setProcessId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setData(null);
    const id = processId.trim();
    if (!id) {
      setError('Enter a processId');
      setBusy(false);
      return;
    }
    try {
      const res = await fetch(
        `${apiBase()}/v1/public/processes/${encodeURIComponent(id)}`,
      );
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.message ?? res.statusText);
      }
      setData(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="card hero">
        <p className="eyebrow">Public explorer</p>
        <h1>Look up a process — no registration</h1>
        <p className="lead lead-wide">
          Enter an AST <code>processId</code>. Anyone can read a redacted status view. No special
          key. No write access. NodeChain remains the source of truth after Core hand-off.
        </p>
      </section>

      <div className="card">
        <form onSubmit={onSubmit}>
          <label htmlFor="pid">Process ID</label>
          <input
            id="pid"
            className="mono"
            value={processId}
            onChange={(e) => setProcessId(e.target.value)}
            placeholder="AST-DEMO-YYYYMMDD-…"
            autoComplete="off"
          />
          <div className="actions">
            <button type="submit" className="primary" disabled={busy}>
              {busy ? 'Searching…' : 'Search'}
            </button>
            <Link href="/system">
              <button type="button" className="secondary">
                Why public lookup?
              </button>
            </Link>
          </div>
        </form>
        {error && <p className="err">{error}</p>}
      </div>

      {data && (
        <div className="card">
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <StatusBadge status={String(data.status)} />
            <span className="badge info">source: {String(data.source ?? '—')}</span>
            {data.public === true && <span className="badge ok">public view</span>}
          </div>
          <h2 style={{ wordBreak: 'break-all' }}>
            <code>{String(data.processId)}</code>
          </h2>
          {data.valuation != null && (
            <p>
              Valuation: <strong className="mono">{String(data.valuation)}</strong>
            </p>
          )}
          {data.institutionId != null && (
            <p className="muted">Institution: {String(data.institutionId)}</p>
          )}
          {data.documentPackageHash != null && (
            <p className="muted">
              Document package hash:{' '}
              <code className="mono">{String(data.documentPackageHash)}</code>
            </p>
          )}
          {data.potVerified != null && (
            <p className={data.potVerified === 1 ? 'ok' : 'muted'}>
              PoT verified flag: {String(data.potVerified)}
            </p>
          )}
          <p className="callout" style={{ marginBottom: 0 }}>
            {String(data.note ?? '')}
          </p>
          <pre className="result" style={{ marginTop: '1rem' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}
