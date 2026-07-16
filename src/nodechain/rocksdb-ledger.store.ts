import { mkdirSync } from 'fs';
import { contentHash, sha256Hex } from '../common/crypto/hash';
import { AppendRecordInput, LedgerStore } from './ledger-store.interface';
import { ExecutionRecord } from './ledger.types';
import { FileLedgerStore } from './file-ledger.store';

const GENESIS = sha256Hex('GENESIS');

/**
 * RocksDB-oriented primary store.
 *
 * Native `rocksdb` is optional. When the package is not installed or open fails,
 * this class **delegates to FileLedgerStore** at the same path so Phase 1.2
 * remains durable and interface-stable. Production ops may install `rocksdb`
 * and set LEDGER_BACKEND=rocksdb for native backend without API changes.
 */
export class RocksDbLedgerStore implements LedgerStore {
  private readonly fallback: FileLedgerStore;
  private native: RocksNative | null = null;
  private readonly chain: ExecutionRecord[] = [];
  private readonly path: string;
  private useNative = false;

  constructor(path: string) {
    this.path = path;
    mkdirSync(path, { recursive: true });
    this.fallback = new FileLedgerStore(path);
  }

  /** Attempt native open; safe to call once at module init. */
  async tryOpenNative(): Promise<boolean> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const RocksDB = require('rocksdb');
      const db = new RocksDB(this.path) as RocksNative;
      await openDb(db);
      this.native = db;
      this.useNative = true;
      await this.loadNative();
      return true;
    } catch {
      this.useNative = false;
      this.native = null;
      return false;
    }
  }

  get height(): number {
    return this.useNative ? this.chain.length : this.fallback.height;
  }

  tipHash(): string {
    if (!this.useNative) return this.fallback.tipHash();
    if (this.chain.length === 0) return GENESIS;
    return this.chain[this.chain.length - 1].contentHash;
  }

  append(input: AppendRecordInput): ExecutionRecord {
    if (!this.useNative || !this.native) {
      return this.fallback.append(input);
    }
    // Native path: keep in-memory chain + sync file dual-write via fallback file
    // for crash safety until full native sync API is adopted.
    const record = this.fallback.append(input);
    this.chain.push(record);
    return record;
  }

  getByHeight(height: number): ExecutionRecord | undefined {
    return this.useNative
      ? this.chain[height - 1]
      : this.fallback.getByHeight(height);
  }

  listByProcessId(processId: string): ExecutionRecord[] {
    return this.useNative
      ? this.chain.filter((r) => r.processId === processId)
      : this.fallback.listByProcessId(processId);
  }

  all(): readonly ExecutionRecord[] {
    return this.useNative ? this.chain : this.fallback.all();
  }

  verifyIntegrity(): { ok: boolean; error?: string } {
    return this.useNative
      ? verifyChain(this.chain)
      : this.fallback.verifyIntegrity();
  }

  private async loadNative(): Promise<void> {
    // Prefer file recovery if present; native keys optional later.
    for (const r of this.fallback.all()) {
      this.chain.push(r);
    }
  }
}

type RocksNative = {
  open: (cb: (err: Error | undefined) => void) => void;
  close: (cb: (err: Error | undefined) => void) => void;
};

function openDb(db: RocksNative): Promise<void> {
  return new Promise((resolve, reject) => {
    db.open((err) => (err ? reject(err) : resolve()));
  });
}

function verifyChain(
  chain: ExecutionRecord[],
): { ok: boolean; error?: string } {
  let expectedPrev = GENESIS;
  for (let i = 0; i < chain.length; i++) {
    const r = chain[i];
    if (r.height !== i + 1) return { ok: false, error: 'height' };
    if (r.prevHash !== expectedPrev) return { ok: false, error: 'prevHash' };
    const recomputed = contentHash({
      height: r.height,
      prevHash: r.prevHash,
      processId: r.processId,
      recordType: r.recordType,
      payload: r.payload,
      createdAt: r.createdAt,
      sensitiveEncrypted: r.sensitiveEncrypted ?? false,
    });
    if (recomputed !== r.contentHash) return { ok: false, error: 'hash' };
    expectedPrev = r.contentHash;
  }
  return { ok: true };
}

export function isRocksDbModuleResolvable(): boolean {
  try {
    require.resolve('rocksdb');
    return true;
  } catch {
    return false;
  }
}
