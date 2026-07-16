-- AST NodeChain secondary index (NOT source of truth)
-- Primary ledger: RocksDB-oriented / file / memory LedgerStore
-- Mirror: PostgresIndexMirror (src/nodechain/postgres-index-mirror.ts)

CREATE TABLE IF NOT EXISTS nodechain_index (
  height INTEGER PRIMARY KEY,
  content_hash TEXT NOT NULL,
  prev_hash TEXT NOT NULL,
  process_id TEXT,
  record_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS nodechain_index_process_id
  ON nodechain_index (process_id);

CREATE INDEX IF NOT EXISTS nodechain_index_record_type
  ON nodechain_index (record_type);

CREATE INDEX IF NOT EXISTS nodechain_index_created_at
  ON nodechain_index (created_at);

-- Optional query helpers (analytics only)
COMMENT ON TABLE nodechain_index IS 'Secondary index mirror; NodeChain append-only store remains SoT';
