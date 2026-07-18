import * as path from 'path';
import { promises as fs } from 'fs';
import type { JournalStore } from './store.interface';
import type { JournalRecord, Tip } from './types';
import { NodeChainError, NcErrorCode } from './errors';

// rocksdb is callback-based LevelDOWN-style
// eslint-disable-next-line @typescript-eslint/no-require-imports
const RocksDB = require('rocksdb') as {
  new (location: string): RocksDbHandle;
};

interface RocksDbHandle {
  open(opts: { createIfMissing: boolean }, cb: (err: Error | undefined) => void): void;
  close(cb: (err: Error | undefined) => void): void;
  put(key: string | Buffer, value: string | Buffer, cb: (err: Error | undefined) => void): void;
  get(key: string | Buffer, cb: (err: Error | undefined, value?: Buffer) => void): void;
  iterator(opts?: {
    gte?: string;
    lte?: string;
    keys?: boolean;
    values?: boolean;
  }): {
    next(cb: (err: Error | undefined, key?: Buffer | string, value?: Buffer) => void): void;
    end(cb: (err?: Error) => void): void;
  };
}

function openDb(location: string): Promise<RocksDbHandle> {
  return new Promise((resolve, reject) => {
    const db = new RocksDB(location);
    db.open({ createIfMissing: true }, (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
}

function put(db: RocksDbHandle, key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.put(key, value, (err) => (err ? reject(err) : resolve()));
  });
}

function get(db: RocksDbHandle, key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    db.get(key, (err, value) => {
      if (err) {
        const msg = String((err as Error).message || err);
        if (msg.includes('NotFound') || msg.includes('not found')) {
          resolve(null);
          return;
        }
        reject(err);
        return;
      }
      resolve(value ? value.toString('utf8') : null);
    });
  });
}

/**
 * RocksDB primary journal store (layer 01 storage target).
 * Keys:
 *  h/{height padded} → record JSON
 *  id/{recordId} → height
 *  client/{clientRecordId} → recordId
 *  tip → Tip JSON
 */
export class RocksDbJournalStore implements JournalStore {
  private db!: RocksDbHandle;
  private ready: Promise<void>;

  constructor(private readonly dir: string) {
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true });
    this.db = await openDb(path.resolve(this.dir));
  }

  private async ensure(): Promise<void> {
    await this.ready;
  }

  private hKey(height: number): string {
    return `h/${String(height).padStart(16, '0')}`;
  }

  async getTip(): Promise<Tip | null> {
    await this.ensure();
    const raw = await get(this.db, 'tip');
    return raw ? (JSON.parse(raw) as Tip) : null;
  }

  async getByHeight(height: number): Promise<JournalRecord | null> {
    await this.ensure();
    const raw = await get(this.db, this.hKey(height));
    return raw ? (JSON.parse(raw) as JournalRecord) : null;
  }

  async getByRecordId(recordId: string): Promise<JournalRecord | null> {
    await this.ensure();
    const h = await get(this.db, `id/${recordId}`);
    if (h === null) return null;
    return this.getByHeight(Number(h));
  }

  async getByClientRecordId(clientRecordId: string): Promise<JournalRecord | null> {
    await this.ensure();
    const id = await get(this.db, `client/${clientRecordId}`);
    if (!id) return null;
    return this.getByRecordId(id);
  }

  async listByProcessId(processId: string): Promise<JournalRecord[]> {
    const all = await this.listAll();
    return all.filter((r) => r.processId === processId);
  }

  async listAll(): Promise<JournalRecord[]> {
    await this.ensure();
    const tip = await this.getTip();
    if (!tip) return [];
    const out: JournalRecord[] = [];
    for (let h = 0; h <= tip.height; h++) {
      const r = await this.getByHeight(h);
      if (r) out.push(r);
    }
    return out;
  }

  async appendDurable(record: JournalRecord, clientRecordId?: string): Promise<void> {
    await this.ensure();
    const existing = await get(this.db, this.hKey(record.height));
    if (existing) {
      throw new NodeChainError(NcErrorCode.STORAGE, `height ${record.height} exists`);
    }
    const json = JSON.stringify(record);
    try {
      await put(this.db, this.hKey(record.height), json);
      await put(this.db, `id/${record.recordId}`, String(record.height));
      if (clientRecordId) {
        await put(this.db, `client/${clientRecordId}`, record.recordId);
      }
      await put(
        this.db,
        'tip',
        JSON.stringify({ height: record.height, tipHash: record.envelopeHash }),
      );
    } catch (e) {
      throw new NodeChainError(NcErrorCode.STORAGE, `rocksdb write failed: ${String(e)}`);
    }
  }

  async close(): Promise<void> {
    await this.ensure();
    return new Promise((resolve, reject) => {
      this.db.close((err) => (err ? reject(err) : resolve()));
    });
  }
}
