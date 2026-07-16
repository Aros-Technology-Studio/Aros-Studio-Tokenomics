import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { ExecutionRecord } from './ledger.types';

/**
 * Secondary index only — never source of truth (nodechain pack / Core Canon §4.1).
 * If DB is unavailable, mirror is no-op (primary ledger still authoritative).
 */
@Injectable()
export class PostgresIndexMirror implements OnModuleDestroy {
  private readonly logger = new Logger(PostgresIndexMirror.name);
  private pool: Pool | null = null;
  private enabled = false;

  constructor() {
    const url = process.env.DATABASE_URL;
    const host = process.env.DB_HOST;
    if (url || host) {
      try {
        this.pool = url
          ? new Pool({ connectionString: url })
          : new Pool({
              host: process.env.DB_HOST ?? 'localhost',
              port: Number(process.env.DB_PORT ?? 5432),
              user: process.env.DB_USERNAME ?? 'postgres',
              password: process.env.DB_PASSWORD ?? 'postgres',
              database: process.env.DB_DATABASE ?? 'aros_ast',
            });
        this.enabled = true;
      } catch (e) {
        this.logger.warn(`Postgres mirror disabled: ${String(e)}`);
        this.enabled = false;
      }
    }
  }

  async ensureSchema(): Promise<void> {
    if (!this.enabled || !this.pool) return;
    await this.pool.query(`
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
    `);
  }

  /**
   * Project a primary ledger record into the search index.
   * Failures are logged — they must not rewrite or replace primary SoT.
   */
  async project(record: ExecutionRecord): Promise<void> {
    if (!this.enabled || !this.pool) return;
    try {
      await this.ensureSchema();
      await this.pool.query(
        `INSERT INTO nodechain_index
          (height, content_hash, prev_hash, process_id, record_type, created_at)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (height) DO NOTHING`,
        [
          record.height,
          record.contentHash,
          record.prevHash,
          record.processId ?? null,
          record.recordType,
          record.createdAt,
        ],
      );
    } catch (e) {
      this.logger.warn(
        `Index mirror write failed (primary still authoritative): ${String(e)}`,
      );
    }
  }

  /** Lookup heights by processId from mirror only (convenience; primary remains SoT). */
  async findHeightsByProcessId(processId: string): Promise<number[]> {
    if (!this.enabled || !this.pool) return [];
    try {
      await this.ensureSchema();
      const res = await this.pool.query(
        `SELECT height FROM nodechain_index WHERE process_id = $1 ORDER BY height`,
        [processId],
      );
      return res.rows.map((r: { height: number }) => Number(r.height));
    } catch {
      return [];
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) await this.pool.end();
  }
}
