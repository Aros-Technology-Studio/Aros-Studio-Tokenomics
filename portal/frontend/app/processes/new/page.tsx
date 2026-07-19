'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  const [step, setStep] = useState(1);
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
  const [hashBusy, setHashBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hashNote, setHashNote] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!loadSession()) router.replace('/login');
  }, [router]);

  const step1Ok = valuation.trim().length > 0 && holderId.trim().length > 0;
  const step2Ok = documentPackageHash.trim().length === 64 && hasQualifiedSignature;
  const canSubmit = useMemo(() => {
    return step1Ok && step2Ok && idempotencyKey.trim().length >= 8;
  }, [step1Ok, step2Ok, idempotencyKey]);

  async function hashDocs() {
    setError(null);
    setHashNote(null);
    const s = loadSession();
    if (!s) return;
    if (!docText.trim()) {
      setError('Paste certificate / package text to hash');
      return;
    }
    setHashBusy(true);
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
      setHashNote(`Hashed on edge · ${data.byteLength ?? '?'} bytes · ${data.partCount ?? 1} part(s)`);
      setStep(3);
    } catch (e) {
      const h = await sha256Hex(`${docName}\n${docText}`);
      setDocumentPackageHash(h);
      setHashNote(
        e instanceof Error
          ? `${e.message} — used local SHA-256 fallback`
          : 'used local SHA-256 fallback',
      );
      setStep(3);
    } finally {
      setHashBusy(false);
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
        }, 700);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <p className="muted" style={{ marginTop: 0 }}>
        <Link href="/dashboard">← Dashboard</Link>
      </p>
      <h1>New primary tokenization</h1>
      <p className="lead">
        Official institutional valuation and document package. Portal does not invent prices and
        does not mint.
      </p>

      <ul className="steps">
        <li className={step === 1 ? 'active' : step > 1 ? 'done' : ''}>
          <span className="n">1</span> Economics
        </li>
        <li className={step === 2 ? 'active' : step > 2 ? 'done' : ''}>
          <span className="n">2</span> Documents
        </li>
        <li className={step === 3 ? 'active' : step > 3 ? 'done' : ''}>
          <span className="n">3</span> Review & submit
        </li>
      </ul>

      <form onSubmit={onSubmit}>
        {step === 1 && (
          <>
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
            <label htmlFor="note">Internal note (optional)</label>
            <input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="actions">
              <button
                type="button"
                className="primary"
                disabled={!step1Ok}
                onClick={() => setStep(2)}
              >
                Continue to documents
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <label htmlFor="docName">Document name</label>
            <input id="docName" value={docName} onChange={(e) => setDocName(e.target.value)} />
            <label htmlFor="docText">Document / certificate text</label>
            <textarea
              id="docText"
              rows={6}
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder="Paste valuation certificate contents or package manifest…"
            />
            <div className="callout">
              Content is hashed at the edge (SHA-256). The portal does not keep documents as
              NodeChain SoT.
            </div>
            <div className="actions">
              <button type="button" className="secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className="primary"
                disabled={hashBusy || !docText.trim()}
                onClick={() => void hashDocs()}
              >
                {hashBusy ? 'Hashing…' : 'Compute hash & continue'}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <label htmlFor="hash">Document package hash (64 hex)</label>
            <input
              id="hash"
              value={documentPackageHash}
              onChange={(e) => setDocumentPackageHash(e.target.value)}
              minLength={64}
              maxLength={64}
              required
              className="mono"
            />
            {hashNote && <p className="ok">{hashNote}</p>}

            <label htmlFor="idem">Idempotency-Key</label>
            <input
              id="idem"
              value={idempotencyKey}
              onChange={(e) => setIdempotencyKey(e.target.value)}
              required
              className="mono"
            />

            <label className="inline">
              <input
                type="checkbox"
                checked={hasQualifiedSignature}
                onChange={(e) => setHasQualifiedSignature(e.target.checked)}
              />
              Qualified institutional signature present (required)
            </label>

            <div className="card flat" style={{ marginBottom: '1rem' }}>
              <h2>Review</h2>
              <p className="muted" style={{ marginTop: 0 }}>
                Valuation <strong className="mono">{valuation}</strong> · Holder{' '}
                <strong>{holderId || '—'}</strong>
                {assetId ? (
                  <>
                    {' '}
                    · Asset <strong>{assetId}</strong>
                  </>
                ) : null}
              </p>
              <p className="muted" style={{ marginBottom: 0 }}>
                Submit sends the package to portal edge → Core Orchestrator. No mint here.
              </p>
            </div>

            <div className="actions">
              <button type="button" className="secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="primary" type="submit" disabled={!canSubmit || busy}>
                {busy ? 'Submitting…' : 'Submit to portal → Core'}
              </button>
            </div>
          </>
        )}

        {error && <p className="err">{error}</p>}
        {result && <pre className="result">{result}</pre>}
      </form>
    </div>
  );
}
