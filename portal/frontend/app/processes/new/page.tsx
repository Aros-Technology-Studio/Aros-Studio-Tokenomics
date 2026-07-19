'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadSession, portalFetch } from '../../../lib/session';

function randomIdem(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function NewProcessPage() {
  const router = useRouter();
  const [valuation, setValuation] = useState('1000000.000000000');
  const [holderId, setHolderId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [docName, setDocName] = useState('valuation-certificate.pdf');
  const [docText, setDocText] = useState('');
  const [documentPackageHash, setDocumentPackageHash] = useState('');
  const [hasQualifiedSignature, setHasQualifiedSignature] = useState(true);
  const [idempotencyKey, setIdempotencyKey] = useState(randomIdem);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!loadSession()) router.replace('/login');
  }, [router]);

  const canSubmit = useMemo(() => {
    return (
      valuation.trim() &&
      holderId.trim() &&
      documentPackageHash.trim().length === 64 &&
      hasQualifiedSignature &&
      idempotencyKey.trim().length >= 8
    );
  }, [valuation, holderId, documentPackageHash, hasQualifiedSignature, idempotencyKey]);

  async function hashDocs() {
    setError(null);
    const s = loadSession();
    if (!s) return;
    if (!docText.trim()) {
      // client-side hash of empty is rejected server-side too
      setError('Paste certificate / package text to hash');
      return;
    }
    try {
      const res = await portalFetch('/v1/documents/hash', {
        method: 'POST',
        sessionId: s.sessionId,
        body: JSON.stringify({
          parts: [{ name: docName || 'package.txt', content: docText, encoding: 'utf8' }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? res.statusText);
      setDocumentPackageHash(data.documentPackageHash);
    } catch (e) {
      // fallback: local hash if edge down
      const h = await sha256Hex(`${docName}\n${docText}`);
      setDocumentPackageHash(h);
      setError(
        e instanceof Error
          ? `${e.message} — used local SHA-256 fallback`
          : 'used local SHA-256 fallback',
      );
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const s = loadSession();
    if (!s) {
      router.replace('/login');
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      if (!hasQualifiedSignature) throw new Error('Qualified signature is required');
      const res = await portalFetch('/v1/processes', {
        method: 'POST',
        sessionId: s.sessionId,
        idempotencyKey: idempotencyKey.trim(),
        body: JSON.stringify({
          processType: 'primary_tokenization',
          valuation: valuation.trim(),
          holderId: holderId.trim(),
          assetId: assetId.trim() || undefined,
          hasQualifiedSignature: true,
          documentPackageHash: documentPackageHash.trim().toLowerCase(),
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(`${data.code ?? res.status}: ${data.message ?? res.statusText}`);
      setResult(JSON.stringify(data, null, 2));
      if (data.processId) {
        setTimeout(() => {
          router.push(`/processes/${encodeURIComponent(data.processId)}`);
        }, 800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h1>New primary tokenization</h1>
      <p className="lead">
        Provide the institution&apos;s official valuation and document package. Portal does not
        invent prices and does not mint.
      </p>
      <form onSubmit={onSubmit}>
        <div className="grid2">
          <div>
            <label htmlFor="valuation">Institutional valuation (ARO decimal)</label>
            <input
              id="valuation"
              value={valuation}
              onChange={(e) => setValuation(e.target.value)}
              pattern={String.raw`^-?\d+(\.\d{1,9})?$`}
              required
            />
          </div>
          <div>
            <label htmlFor="holder">Holder id</label>
            <input
              id="holder"
              value={holderId}
              onChange={(e) => setHolderId(e.target.value)}
              required
              placeholder="holder-wallet-or-account"
            />
          </div>
        </div>
        <label htmlFor="asset">Asset id (optional)</label>
        <input
          id="asset"
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          placeholder="asset-… (auto if empty on core)"
        />

        <h2>Document package</h2>
        <label htmlFor="docName">Document name</label>
        <input id="docName" value={docName} onChange={(e) => setDocName(e.target.value)} />
        <label htmlFor="docText">Document / certificate text (hashed, not stored as SoT)</label>
        <textarea
          id="docText"
          rows={5}
          value={docText}
          onChange={(e) => setDocText(e.target.value)}
          placeholder="Paste valuation certificate contents or package manifest…"
        />
        <p>
          <button type="button" className="primary" onClick={() => void hashDocs()}>
            Compute document package hash
          </button>
        </p>
        <label htmlFor="hash">Document package hash (64 hex)</label>
        <input
          id="hash"
          value={documentPackageHash}
          onChange={(e) => setDocumentPackageHash(e.target.value)}
          minLength={64}
          maxLength={64}
          required
        />

        <label htmlFor="idem">Idempotency-Key</label>
        <input
          id="idem"
          value={idempotencyKey}
          onChange={(e) => setIdempotencyKey(e.target.value)}
          required
        />
        <label htmlFor="note">Note (optional)</label>
        <input id="note" value={note} onChange={(e) => setNote(e.target.value)} />

        <label>
          <input
            type="checkbox"
            checked={hasQualifiedSignature}
            onChange={(e) => setHasQualifiedSignature(e.target.checked)}
          />{' '}
          Qualified institutional signature present (required)
        </label>

        <p style={{ marginTop: '1rem' }}>
          <button className="primary" type="submit" disabled={!canSubmit || busy}>
            {busy ? 'Submitting…' : 'Submit to portal → Core'}
          </button>
        </p>
        {error && <p className="err">{error}</p>}
        {result && <pre className="result">{result}</pre>}
      </form>
    </div>
  );
}
