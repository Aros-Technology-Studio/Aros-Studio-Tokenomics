'use client';

import { useMemo, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_PORTAL_API_URL ?? 'http://localhost:3100';

function randomIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ProcessSubmitForm() {
  const [institutionId, setInstitutionId] = useState('DEMO');
  const [valuation, setValuation] = useState('1000000.000000000');
  const [holderId, setHolderId] = useState('');
  const [documentPackageHash, setDocumentPackageHash] = useState('');
  const [hasQualifiedSignature, setHasQualifiedSignature] = useState(true);
  const [idempotencyKey, setIdempotencyKey] = useState(randomIdempotencyKey);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      institutionId.trim() &&
      valuation.trim() &&
      holderId.trim() &&
      documentPackageHash.trim().length === 64 &&
      hasQualifiedSignature &&
      idempotencyKey.trim().length >= 8
    );
  }, [
    institutionId,
    valuation,
    holderId,
    documentPackageHash,
    hasQualifiedSignature,
    idempotencyKey,
  ]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      if (!hasQualifiedSignature) {
        throw new Error('Qualified institutional signature is required');
      }
      const res = await fetch(`${API_BASE}/v1/processes`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Idempotency-Key': idempotencyKey.trim(),
          'X-Institution-Id': institutionId.trim(),
        },
        body: JSON.stringify({
          processType: 'primary_tokenization',
          valuation: valuation.trim(),
          holderId: holderId.trim(),
          hasQualifiedSignature: true,
          documentPackageHash: documentPackageHash.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          `${data.code ?? res.status}: ${data.message ?? res.statusText}`,
        );
      }
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="institutionId">Institution id (X-Institution-Id)</label>
        <input
          id="institutionId"
          value={institutionId}
          onChange={(e) => setInstitutionId(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="valuation">Institutional valuation (decimal string)</label>
        <input
          id="valuation"
          value={valuation}
          onChange={(e) => setValuation(e.target.value)}
          pattern={String.raw`^-?\d+(\.\d{1,9})?$`}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="holderId">Holder id</label>
        <input
          id="holderId"
          value={holderId}
          onChange={(e) => setHolderId(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="docHash">Document package hash (SHA-256 hex)</label>
        <input
          id="docHash"
          value={documentPackageHash}
          onChange={(e) => setDocumentPackageHash(e.target.value)}
          minLength={64}
          maxLength={64}
          placeholder="64 hex characters"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="idem">Idempotency-Key</label>
        <input
          id="idem"
          value={idempotencyKey}
          onChange={(e) => setIdempotencyKey(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={hasQualifiedSignature}
            onChange={(e) => setHasQualifiedSignature(e.target.checked)}
          />{' '}
          Qualified signature present (required)
        </label>
      </div>
      <button type="submit" disabled={!canSubmit || busy}>
        {busy ? 'Submitting…' : 'Submit to portal edge'}
      </button>
      {error && <p className="err">{error}</p>}
      {result && (
        <pre className="ok" style={{ marginTop: '1rem' }}>
          {result}
        </pre>
      )}
      <p className="muted" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
        API: <code>{API_BASE}</code> · set <code>NEXT_PUBLIC_PORTAL_API_URL</code>
      </p>
    </form>
  );
}
