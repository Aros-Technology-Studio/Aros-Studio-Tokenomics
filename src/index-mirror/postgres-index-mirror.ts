import pg from 'pg';
import type { JournalRecord } from '../nodechain/types';
import type { NodechainService } from '../nodechain/nodechain.service';
import type { IndexMirror, IndexMirrorStatus } from './index-mirror';

/** Inline DDL — keep in sync with docs/db/postgres-index-schema.sql */
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS journal_index (
  height           BIGINT PRIMARY KEY,
  record_id        TEXT NOT NULL UNIQUE,
  record_type      TEXT NOT NULL,
  process_id       TEXT,
  writer_id        TEXT NOT NULL,
  writer_role      TEXT NOT NULL,
  timestamp_utc    TIMESTAMPTZ NOT NULL,
  content_hash     TEXT NOT NULL,
  envelope_hash    TEXT NOT NULL,
  prev_hash        TEXT NOT NULL,
  payload          JSONB NOT NULL DEFAULT '{}'::jsonb,
  ingested_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_journal_process ON journal_index (process_id);
CREATE INDEX IF NOT EXISTS idx_journal_type ON journal_index (record_type);
CREATE INDEX IF NOT EXISTS idx_journal_time ON journal_index (timestamp_utc);

CREATE TABLE IF NOT EXISTS process_summary (
  process_id       TEXT PRIMARY KEY,
  process_type     TEXT,
  institution_id   TEXT,
  last_height      BIGINT NOT NULL,
  last_record_type TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mirror_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO mirror_meta (key, value) VALUES
  ('schema_version', '1'),
  ('role', 'index_mirror_not_sot')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
`;

/**
 * Postgres index mirror — secondary query store only.
 * Rebuild by replaying NodeChain (SoT).
 */
export class PostgresIndexMirror implements IndexMirror {
  readonly kind = 'postgres' as const;
  private pool: pg.Pool;
  private schemaReady: Promise<void> | null = null;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString });
  }

  async ensureSchema(): Promise<void> {
    if (!this.schemaReady) {
      this.schemaReady = this.pool.query(SCHEMA_SQL).then(() => undefined);
    }
    await this.schemaReady;
  }

  private async ready(): Promise<void> {
    await this.ensureSchema();
  }

  async upsert(record: JournalRecord): Promise<void> {
    await this.ready();
    await this.pool.query(
      `INSERT INTO journal_index (
        height, record_id, record_type, process_id, writer_id, writer_role,
        timestamp_utc, content_hash, envelope_hash, prev_hash, payload
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)
      ON CONFLICT (height) DO UPDATE SET
        record_id = EXCLUDED.record_id,
        record_type = EXCLUDED.record_type,
        process_id = EXCLUDED.process_id,
        writer_id = EXCLUDED.writer_id,
        writer_role = EXCLUDED.writer_role,
        timestamp_utc = EXCLUDED.timestamp_utc,
        content_hash = EXCLUDED.content_hash,
        envelope_hash = EXCLUDED.envelope_hash,
        prev_hash = EXCLUDED.prev_hash,
        payload = EXCLUDED.payload,
        ingested_at = NOW()`,
      [
        record.height,
        record.recordId,
        record.recordType,
        record.processId,
        record.writerId,
        record.writerRole,
        record.timestampUtc,
        record.contentHash,
        record.envelopeHash,
        record.prevHash,
        JSON.stringify(record.payload),
      ],
    );

    if (record.processId) {
      const institutionId =
        typeof record.payload.institutionId === 'string'
          ? record.payload.institutionId
          : null;
      await this.pool.query(
        `INSERT INTO process_summary (process_id, process_type, institution_id, last_height, last_record_type, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (process_id) DO UPDATE SET
           process_type = COALESCE(EXCLUDED.process_type, process_summary.process_type),
           institution_id = COALESCE(EXCLUDED.institution_id, process_summary.institution_id),
           last_height = EXCLUDED.last_height,
           last_record_type = EXCLUDED.last_record_type,
           updated_at = NOW()`,
        [
          record.processId,
          typeof record.payload.processType === 'string' ? record.payload.processType : null,
          institutionId,
          record.height,
          record.recordType,
        ],
      );
    }

    await this.pool.query(
      `INSERT INTO mirror_meta (key, value) VALUES ('max_height', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [String(record.height)],
    );
  }

  async replayFrom(nodechain: NodechainService): Promise<{ count: number }> {
    await this.ready();
    await this.pool.query('TRUNCATE journal_index, process_summary');
    const all = await nodechain.listAll();
    for (const r of all) {
      await this.upsert(r);
    }
    await this.pool.query(
      `INSERT INTO mirror_meta (key, value) VALUES ('last_replay_count', $1), ('last_replay_at', $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [String(all.length), new Date().toISOString()],
    );
    return { count: all.length };
  }

  async getByProcessId(processId: string): Promise<JournalRecord[]> {
    await this.ready();
    const res = await this.pool.query(
      `SELECT height, record_id, record_type, process_id, writer_id, writer_role,
              timestamp_utc, content_hash, envelope_hash, prev_hash, payload
       FROM journal_index WHERE process_id = $1 ORDER BY height ASC`,
      [processId],
    );
    return res.rows.map((row) => ({
      height: Number(row.height),
      recordId: row.record_id,
      recordType: row.record_type,
      processId: row.process_id,
      writerId: row.writer_id,
      writerRole: row.writer_role,
      timestampUtc: new Date(row.timestamp_utc).toISOString(),
      contentHash: row.content_hash,
      envelopeHash: row.envelope_hash,
      prevHash: row.prev_hash,
      payload: row.payload,
      schemaVersion: 'nc-record-1',
      signatures: [],
    }));
  }

  async getStatus(nodechain?: NodechainService): Promise<IndexMirrorStatus> {
    try {
      await this.ready();
      const countRes = await this.pool.query(`SELECT COUNT(*)::int AS c FROM journal_index`);
      const maxRes = await this.pool.query(
        `SELECT value FROM mirror_meta WHERE key = 'max_height'`,
      );
      const replayRes = await this.pool.query(
        `SELECT value FROM mirror_meta WHERE key = 'last_replay_count'`,
      );
      const tip = nodechain ? await nodechain.getTip() : null;
      const mirrorMax = maxRes.rows[0] ? Number(maxRes.rows[0].value) : null;
      const journalHeight = tip?.height ?? null;
      return {
        kind: 'postgres',
        role: 'index_mirror_not_sot',
        ready: true,
        journalHeight,
        mirrorMaxHeight: Number.isFinite(mirrorMax as number) ? mirrorMax : null,
        lagHeights:
          journalHeight != null && mirrorMax != null && Number.isFinite(mirrorMax)
            ? journalHeight - (mirrorMax as number)
            : null,
        recordCount: countRes.rows[0]?.c ?? 0,
        lastReplayCount: replayRes.rows[0]?.value ?? null,
        databaseUrlSet: true,
      };
    } catch (e) {
      return {
        kind: 'postgres',
        role: 'index_mirror_not_sot',
        ready: false,
        databaseUrlSet: true,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
