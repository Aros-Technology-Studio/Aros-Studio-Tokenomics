'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession, portalFetch } from '../../../lib/auth';
import { StatusBadge } from '../../../components/ui/status-badge';
import type { AssetClaim } from '../../../types/asset';

export default function AssetsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<AssetClaim[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.replace('/login');
      return;
    }
    void portalFetch('/v1/assets', { sessionId: s.sessionId })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? res.statusText);
        setClaims(data.claims ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="card">
      <h1>Assets / claims</h1>
      <p className="lead">
        Read-only view of packages submitted by your institution. This is not a wallet and not
        NodeChain SoT — claims map to edge-tracked processes.
      </p>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="err">{error}</p>}
      {!loading && claims.length === 0 && (
        <div className="empty">
          <strong>No claims yet</strong>
          Submit a primary tokenization package first.
          <div className="actions" style={{ justifyContent: 'center', marginTop: '1rem' }}>
            <Link href="/tokenization">
              <button type="button" className="primary">
                New tokenization
              </button>
            </Link>
          </div>
        </div>
      )}
      {claims.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Claim</th>
                <th>Status</th>
                <th>Valuation</th>
                <th>Holder</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.claimId}>
                  <td>
                    <Link href={`/assets/${encodeURIComponent(c.claimId)}`}>
                      <code>{c.claimId}</code>
                    </Link>
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="mono">{c.valuation}</td>
                  <td>{c.holderId}</td>
                  <td className="muted">{new Date(c.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
