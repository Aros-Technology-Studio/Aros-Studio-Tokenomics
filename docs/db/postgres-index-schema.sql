-- AST PostgreSQL index mirror (NOT source of truth).
-- SoT is NodeChain journal (RocksDB/file). Rebuild mirror by replaying journal.

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

COMMENT ON TABLE journal_index IS 'Secondary index only; NodeChain journal is SoT';
