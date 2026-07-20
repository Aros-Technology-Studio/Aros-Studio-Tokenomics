'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadSession, portalFetch } from '../../../../lib/auth';
import { StatusBadge } from '../../../../components/ui/status-badge';

export default function AssetClaimPage() {
  const params = useParams();
  const claimId = decodeURIComponent(String(params.claimId ?? ''));
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.replace('/login');
      return;
    }
    if (!claimId) return;
    void portalFetch(`/v1/assets/${encodeURIComponent(claimId)}`, {
      sessionId: s.sessionId,
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.message ?? res.statusText);
        setData(body);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [claimId, router]);

  return (
    <div className="card">
      <p className="muted" style={{ marginTop: 0 }}>
        <Link href="/assets">← Assets</Link>
      </p>
      <h1>
        Claim <code style={{ fontSize: '0.85em' }}>{claimId}</code>
      </h1>
      {error && <p className="err">{error}</p>}
      {data && (
        <>
          <p>
            <StatusBadge status={String(data.status)} />
          </p>
          <p className="lead">
            Valuation <strong className="mono">{String(data.valuation)}</strong> · Holder{' '}
            <strong>{String(data.holderId)}</strong>
          </p>
          <p>
            <Link href={`/tokenization/${encodeURIComponent(String(data.processId ?? claimId))}`}>
              Open process status →
            </Link>
          </p>
          <pre className="result">{JSON.stringify(data, null, 2)}</pre>
        </>
      )}
    </div>
  );
}
