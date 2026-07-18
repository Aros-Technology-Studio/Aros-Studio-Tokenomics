import pg from 'pg';
import type { JournalRecord } from '../nodechain/types';
import type { NodechainService } from '../nodechain/nodechain.service';
import type { IndexMirror } from './index-mirror';

/**
 * Postgres index mirror — secondary query store only.
 * Rebuild by replaying NodeChain (SoT).
 */
export class PostgresIndexMirror implements IndexMirror {
  private pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString });
  }

  async upsert(record: JournalRecord): Promise<void> {
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
      await this.pool.query(
        `INSERT INTO process_summary (process_id, process_type, last_height, last_record_type, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (process_id) DO UPDATE SET
           last_height = EXCLUDED.last_height,
           last_record_type = EXCLUDED.last_record_type,
           updated_at = NOW()`,
        [
          record.processId,
          typeof record.payload.processType === 'string' ? record.payload.processType : null,
          record.height,
          record.recordType,
        ],
      );
    }
  }

  async replayFrom(nodechain: NodechainService): Promise<{ count: number }> {
    await this.pool.query('TRUNCATE journal_index, process_summary');
    const all = await nodechain.listAll();
    for (const r of all) {
      await this.upsert(r);
    }
    await this.pool.query(
      `INSERT INTO mirror_meta (key, value) VALUES ('last_replay_count', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [String(all.length)],
    );
    return { count: all.length };
  }

  async getByProcessId(processId: string): Promise<JournalRecord[]> {
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
      signatures: [] }));
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

