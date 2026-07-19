'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiBase, loadSession, saveSession } from '../../lib/session';

export default function LoginPage() {
  const router = useRouter();
  const [institutionId, setInstitutionId] = useState('DEMO');
  const [token, setToken] = useState('demo-institution-token');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [institutions, setInstitutions] = useState<
    Array<{ institutionId: string; displayName: string }>
  >([]);

  useEffect(() => {
    if (loadSession()) {
      router.replace('/dashboard');
      return;
    }
    void fetch(`${apiBase()}/v1/auth/institutions`)
      .then((r) => r.json())
      .then((d) => setInstitutions(d.institutions ?? []))
      .catch(() => setInstitutions([]));
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/v1/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ institutionId, token }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? res.statusText);
      }
      saveSession({
        sessionId: data.sessionId,
        institutionId: data.institutionId,
        displayName: data.displayName,
        expiresAt: data.expiresAt,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 440, margin: '2rem auto' }}>
      <h1>Institution login</h1>
      <p className="lead">Allowlisted institutions only. Token is never used to mint on the edge.</p>
      <form onSubmit={onSubmit}>
        <label htmlFor="inst">Institution</label>
        {institutions.length > 0 ? (
          <select
            id="inst"
            value={institutionId}
            onChange={(e) => setInstitutionId(e.target.value)}
          >
            {institutions.map((i) => (
              <option key={i.institutionId} value={i.institutionId}>
                {i.displayName} ({i.institutionId})
              </option>
            ))}
          </select>
        ) : (
          <input
            id="inst"
            value={institutionId}
            onChange={(e) => setInstitutionId(e.target.value)}
            required
          />
        )}
        <label htmlFor="token">Institution token</label>
        <input
          id="token"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button className="primary" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        {error && <p className="err">{error}</p>}
      </form>
    </div>
  );
}
