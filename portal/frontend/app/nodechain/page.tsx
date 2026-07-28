'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiBase } from '../../lib/auth';
import {
  formatWhen,
  labelForType,
  roleLabel,
  shortHash,
  summarizePayload,
  type EventKind,
} from '../../lib/journal-labels';
import { useI18n } from '../../lib/i18n/context';

type StatusBody = {
  tip?: { height: number; tipHash: string } | null;
  hasGenesis?: boolean;
  readOnly?: boolean;
  killSwitch?: boolean;
  chain?: { ok: boolean; height: number; error?: string };
  recordCount?: number;
  engine?: string;
  message?: string;
};

type JournalRecord = {
  recordId?: string;
  height?: number;
  recordType?: string;
  processId?: string | null;
  writerId?: string;
  writerRole?: string;
  timestampUtc?: string;
  prevHash?: string;
  contentHash?: string;
  envelopeHash?: string;
  payload?: Record<string, unknown>;
  signatures?: Array<{ signerId?: string; algorithm?: string }>;
};

type BlockRow = {
  blockNumber: number;
  blockHash: string;
  parentHash: string;
  timestamp: string;
  type: string;
  processId: string | null;
  writer: string;
  writerRole: string;
  recordId: string;
  record: JournalRecord;
};

async function fetchJson(path: string): Promise<{ ok: boolean; status: number; body: unknown }> {
  const res = await fetch(`${apiBase()}${path}`);
  let body: unknown = {};
  try {
    body = await res.json();
  } catch {
    body = { message: res.statusText };
  }
  return { ok: res.ok, status: res.status, body };
}

/**
 * NodeChain explorer — blockchain-style registration journal.
 * Blocks = append-only records; height = block number; prevHash = parent link.
 * Read-only. No mint / write from portal. English UI only.
 */
export default function NodechainPage() {
  const { t } = useI18n();
  const search = useSearchParams();
  const [status, setStatus] = useState<StatusBody | null>(null);
  const [blocks, setBlocks] = useState<BlockRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BlockRow | null>(null);
  const [showTech, setShowTech] = useState(false);

  const [jumpHeight, setJumpHeight] = useState('');
  const [processId, setProcessId] = useState('');
  const [processBlocks, setProcessBlocks] = useState<JournalRecord[] | null>(null);
  const [processMeta, setProcessMeta] = useState<{ count?: number; returned?: number } | null>(
    null,
  );
  const [filterKind, setFilterKind] = useState<EventKind | 'all'>('all');

  const loadProcessHistory = useCallback(async (id: string) => {
    const pid = id.trim();
    if (!pid) return;
    setProcessId(pid);
    const r = await fetchJson(
      `/v1/public/nodechain/processes/${encodeURIComponent(pid)}?limit=200`,
    );
    const b = r.body as {
      records?: JournalRecord[];
      count?: number;
      returned?: number;
      message?: string;
    };
    if (!r.ok) {
      setProcessBlocks([]);
      setProcessMeta(null);
      setError(b.message ?? `process history HTTP ${r.status}`);
      return;
    }
    setProcessBlocks(b.records ?? []);
    setProcessMeta({ count: b.count, returned: b.returned });
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [st, bl] = await Promise.all([
        fetchJson('/v1/public/nodechain/status'),
        fetchJson('/v1/public/nodechain/blocks?limit=50'),
      ]);
      if (!st.ok) {
        const b = st.body as { message?: string };
        throw new Error(b.message ?? `status HTTP ${st.status}`);
      }
      if (!bl.ok) {
        const b = bl.body as { message?: string };
        throw new Error(b.message ?? `blocks HTTP ${bl.status}`);
      }
      setStatus(st.body as StatusBody);
      const body = bl.body as { blocks?: BlockRow[] };
      setBlocks(body.blocks ?? []);
    } catch (e) {
      setStatus(null);
      setBlocks([]);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Deep link: /nodechain?processId=AST-…
  useEffect(() => {
    const q = search.get('processId')?.trim();
    if (q) {
      void loadProcessHistory(q);
    }
  }, [search, loadProcessHistory]);

  async function onVerify() {
    const r = await fetchJson('/v1/public/nodechain/verify');
    const b = r.body as { ok?: boolean; height?: number; message?: string; error?: string };
    if (r.ok && b.ok) {
      alert(`${t('nc.alert.intact')}${b.height}`);
    } else {
      alert(b.message ?? b.error ?? t('nc.alert.broken'));
    }
    await refresh();
  }

  async function onJump(e: FormEvent) {
    e.preventDefault();
    const h = Number(jumpHeight.trim());
    if (!Number.isInteger(h) || h < 0) {
      alert(t('nc.alert.badHeight'));
      return;
    }
    const r = await fetchJson(`/v1/public/nodechain/records/height/${h}`);
    const b = r.body as { record?: JournalRecord; message?: string };
    if (!r.ok || !b.record) {
      alert(b.message ?? `${t('nc.alert.notFound')} #${h}`);
      return;
    }
    const rec = b.record;
    setSelected({
      blockNumber: rec.height ?? h,
      blockHash: rec.envelopeHash ?? '',
      parentHash: rec.prevHash ?? '',
      timestamp: rec.timestampUtc ?? '',
      type: rec.recordType ?? '',
      processId: rec.processId ?? null,
      writer: rec.writerId ?? '',
      writerRole: rec.writerRole ?? '',
      recordId: rec.recordId ?? '',
      record: rec,
    });
    setShowTech(false);
  }

  async function onProcess(e: FormEvent) {
    e.preventDefault();
    setError(null);
    await loadProcessHistory(processId);
  }

  const filtered =
    filterKind === 'all'
      ? blocks
      : blocks.filter((b) => labelForType(b.type).kind === filterKind);

  const tipH = status?.tip?.height;
  const chainOk = status?.chain?.ok === true;

  return (
    <>
      <section className="card hero nc-hero">
        <p className="eyebrow">{t('nc.eyebrow')}</p>
        <h1>{t('nc.h1')}</h1>
        <p className="lead lead-wide">{t('nc.lead')}</p>
        <div className="actions">
          <button type="button" className="primary" onClick={() => void refresh()} disabled={loading}>
            {loading ? t('nc.refreshing') : t('nc.refresh')}
          </button>
          <button type="button" className="secondary" onClick={() => void onVerify()}>
            {t('nc.verify')}
          </button>
          <Link href="/explore">
            <button type="button" className="ghost">
              {t('nc.find')}
            </button>
          </Link>
        </div>
      </section>

      {error && (
        <div className="card">
          <p className="err">{t('nc.unavailable')}: {error}</p>
          <p className="muted">
            {t('nc.needStack')}{' '}
            <code>Aros-Studio-Tokenomics</code> directory.
          </p>
        </div>
      )}

      {status && (
        <div className="kpis kpis-public">
          <div className="kpi">
            <div className="label">{t('nc.tip')}</div>
            <div className="value mono">#{tipH ?? '—'}</div>
            <div className="hint">height</div>
          </div>
          <div className="kpi">
            <div className="label">{t('nc.integrity')}</div>
            <div
              className="value"
              style={{ fontSize: '1.15rem', color: chainOk ? 'var(--ok)' : 'var(--danger)' }}
            >
              {chainOk ? t('nc.intact') : t('nc.broken')}
            </div>
            <div className="hint">
              {status.recordCount ?? 0} {t('nc.records')} · {t('nc.genesis')}{' '}
              {status.hasGenesis ? t('nc.yes') : t('nc.no')}
            </div>
          </div>
          <div className="kpi">
            <div className="label">{t('nc.mode')}</div>
            <div className="value" style={{ fontSize: '1.05rem' }}>
              {status.killSwitch ? t('nc.stopped') : status.readOnly ? t('nc.readonly') : t('nc.live')}
            </div>
            <div className="hint">{status.engine ?? 'journal'}</div>
          </div>
          <div className="kpi">
            <div className="label">{t('nc.tipHash')}</div>
            <div className="value mono" style={{ fontSize: '0.95rem' }}>
              {shortHash(status.tip?.tipHash, 8)}
            </div>
            <div className="hint">{t('nc.lastHash')}</div>
          </div>
        </div>
      )}

      <div className="card nc-how">
        <h2 style={{ marginTop: 0 }}>{t('nc.how.h')}</h2>
        <ol className="nc-how-list">
          <li>{t('nc.how.1')}</li>
          <li>{t('nc.how.2')}</li>
          <li>{t('nc.how.3')}</li>
          <li>{t('nc.how.4')}</li>
        </ol>
      </div>

      <div className="grid2 nc-grid">
        <div className="card">
          <h2>{t('nc.jump.h')}</h2>
          <form onSubmit={onJump}>
            <label htmlFor="jump">{t('nc.jump.label')}</label>
            <input
              id="jump"
              className="mono"
              value={jumpHeight}
              onChange={(e) => setJumpHeight(e.target.value)}
              placeholder="0"
              inputMode="numeric"
            />
            <button type="submit" className="primary">
              {t('nc.jump.btn')}
            </button>
          </form>
        </div>
        <div className="card">
          <h2>{t('nc.proc.h')}</h2>
          <form onSubmit={onProcess}>
            <label htmlFor="pid">{t('nc.proc.label')}</label>
            <input
              id="pid"
              className="mono"
              value={processId}
              onChange={(e) => setProcessId(e.target.value)}
              placeholder="AST-…"
            />
            <button type="submit" className="primary">
              {t('nc.proc.btn')}
            </button>
          </form>
        </div>
      </div>

      {processBlocks && (
        <div className="card">
          <h2>
            {t('nc.proc.records')} · {processId.trim() || '—'}
            {processMeta?.count != null ? (
              <span className="muted" style={{ fontWeight: 400, fontSize: '0.9rem' }}>
                {' '}
                ({processMeta.returned ?? processBlocks.length}/{processMeta.count})
              </span>
            ) : null}
          </h2>
          {processBlocks.length === 0 ? (
            <p className="muted">{t('nc.proc.empty')}</p>
          ) : (
            <div className="nc-chain">
              {processBlocks.map((rec, i) => {
                const lab = labelForType(rec.recordType);
                const when = formatWhen(rec.timestampUtc);
                return (
                  <div key={rec.recordId ?? i} className="nc-chain-item">
                    <div className="nc-chain-dot" data-kind={lab.kind} />
                    <div>
                      <div className="nc-chain-title">
                        <span className="mono">#{rec.height}</span>
                        <strong>{lab.title}</strong>
                        <span className="muted">{when.relative}</span>
                      </div>
                      <p className="nc-chain-desc">
                        {summarizePayload(rec.recordType, rec.payload) ?? lab.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="nc-table-head">
          <h2 style={{ margin: 0 }}>{t('nc.latest')}</h2>
          <div className="nc-filters">
            {(
              [
                ['all', t('nc.filter.all')],
                ['process', t('nc.filter.process')],
                ['proof', t('nc.filter.proof')],
                ['token', t('nc.filter.token')],
                ['settlement', t('nc.filter.settlement')],
                ['system', t('nc.filter.system')],
              ] as Array<[EventKind | 'all', string]>
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                className={filterKind === k ? 'nc-chip on' : 'nc-chip'}
                onClick={() => setFilterKind(k)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 && !loading && (
          <p className="muted">{t('nc.empty')}</p>
        )}

        <div className="table-wrap">
          <table className="table nc-table">
            <thead>
              <tr>
                <th>{t('nc.th.block')}</th>
                <th>{t('nc.th.when')}</th>
                <th>{t('nc.th.event')}</th>
                <th>{t('nc.th.meaning')}</th>
                <th>{t('nc.th.process')}</th>
                <th>{t('nc.th.writer')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const lab = labelForType(b.type);
                const when = formatWhen(b.timestamp);
                const summary = summarizePayload(b.type, b.record?.payload) ?? lab.description;
                return (
                  <tr
                    key={b.recordId || b.blockNumber}
                    className={selected?.blockNumber === b.blockNumber ? 'nc-row-on' : ''}
                    onClick={() => {
                      setSelected(b);
                      setShowTech(false);
                    }}
                  >
                    <td className="mono">
                      <span className="nc-block-num">#{b.blockNumber}</span>
                    </td>
                    <td>
                      <div>{when.date}</div>
                      <div className="muted" style={{ fontSize: '0.78rem' }}>
                        {when.time} · {when.relative}
                      </div>
                    </td>
                    <td>
                      <span className="nc-kind" data-kind={lab.kind}>
                        {lab.title}
                      </span>
                    </td>
                    <td className="nc-sense">{summary}</td>
                    <td className="mono" style={{ fontSize: '0.78rem', maxWidth: 160 }}>
                      {b.processId ? (
                        <span title={b.processId}>
                          {b.processId.length > 22
                            ? `${b.processId.slice(0, 18)}…`
                            : b.processId}
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{roleLabel(b.writerRole, b.writer)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="card nc-block-detail">
          <div className="nc-block-detail-head">
            <div>
              <p className="eyebrow">{t('nc.detail.eyebrow')}</p>
              <h2 style={{ margin: '0.2rem 0' }}>
                #{selected.blockNumber} · {labelForType(selected.type).title}
              </h2>
              <p className="muted" style={{ margin: 0 }}>
                {labelForType(selected.type).description}
              </p>
            </div>
            <button type="button" className="ghost" onClick={() => setSelected(null)}>
              {t('nc.detail.close')}
            </button>
          </div>

          <div className="nc-block-meta">
            <div>
              <span className="label">{t('nc.detail.time')}</span>
              <span>
                {formatWhen(selected.timestamp).date} {formatWhen(selected.timestamp).time}
              </span>
            </div>
            <div>
              <span className="label">{t('nc.detail.writer')}</span>
              <span>{roleLabel(selected.writerRole, selected.writer)}</span>
            </div>
            <div>
              <span className="label">{t('nc.detail.process')}</span>
              <span className="mono">{selected.processId ?? t('nc.detail.system')}</span>
            </div>
            <div>
              <span className="label">{t('nc.detail.summary')}</span>
              <span>
                {summarizePayload(selected.type, selected.record?.payload) ??
                  labelForType(selected.type).description}
              </span>
            </div>
          </div>

          <div className="nc-parent-link">
            <div>
              <span className="label">{t('nc.detail.parent')}</span>
              <code className="mono">{shortHash(selected.parentHash, 14)}</code>
              {selected.blockNumber > 0 && (
                <button
                  type="button"
                  className="linkish"
                  onClick={async () => {
                    setJumpHeight(String(selected.blockNumber - 1));
                    const r = await fetchJson(
                      `/v1/public/nodechain/records/height/${selected.blockNumber - 1}`,
                    );
                    const b = r.body as { record?: JournalRecord };
                    if (b.record) {
                      const rec = b.record;
                      setSelected({
                        blockNumber: rec.height ?? selected.blockNumber - 1,
                        blockHash: rec.envelopeHash ?? '',
                        parentHash: rec.prevHash ?? '',
                        timestamp: rec.timestampUtc ?? '',
                        type: rec.recordType ?? '',
                        processId: rec.processId ?? null,
                        writer: rec.writerId ?? '',
                        writerRole: rec.writerRole ?? '',
                        recordId: rec.recordId ?? '',
                        record: rec,
                      });
                    }
                  }}
                >
                  {t('nc.detail.open')} #{selected.blockNumber - 1}
                </button>
              )}
            </div>
            <div className="nc-arrow">↓</div>
            <div>
              <span className="label">{t('nc.detail.this')}</span>
              <code className="mono">{shortHash(selected.blockHash, 14)}</code>
            </div>
          </div>

          <button
            type="button"
            className="secondary"
            style={{ marginTop: '1rem' }}
            onClick={() => setShowTech((v) => !v)}
          >
            {showTech ? t('nc.detail.hideTech') : t('nc.detail.showTech')}
          </button>
          {showTech && (
            <pre className="result" style={{ marginTop: '0.75rem' }}>
              {JSON.stringify(
                {
                  recordId: selected.recordId,
                  recordType: selected.type,
                  envelopeHash: selected.blockHash,
                  prevHash: selected.parentHash,
                  contentHash: selected.record?.contentHash,
                  payload: selected.record?.payload,
                  signatures: selected.record?.signatures?.map((s) => ({
                    signerId: s.signerId,
                    algorithm: s.algorithm,
                  })),
                },
                null,
                2,
              )}
            </pre>
          )}
        </div>
      )}

      <section className="card flat">
        <h2>{t('nc.rules.h')}</h2>
        <ul className="plain-list">
          <li>{t('nc.rules.1')}</li>
          <li>{t('nc.rules.2')}</li>
          <li>{t('nc.rules.3')}</li>
        </ul>
      </section>
    </>
  );
}
