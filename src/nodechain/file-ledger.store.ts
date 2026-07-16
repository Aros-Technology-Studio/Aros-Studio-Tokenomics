import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';
import { contentHash, sha256Hex } from '../common/crypto/hash';
import { AppendRecordInput, LedgerStore } from './ledger-store.interface';
import { ExecutionRecord } from './ledger.types';

const GENESIS = sha256Hex('GENESIS');

/**
 * Durable append-only primary ledger (JSONL on disk).
 *
 * Phase 1.2: portable durable SoT implementing the same LedgerStore contract
 * as the RocksDB target (CANON §XII). Swap backend via LEDGER_BACKEND without
 * changing NodechainService.
 *
 * Postgres is never used here — only the index mirror service may touch SQL.
 */
export class FileLedgerStore implements LedgerStore {
  private readonly chain: ExecutionRecord[] = [];
  private readonly filePath: string;

  constructor(dirPath: string) {
    mkdirSync(dirPath, { recursive: true });
    this.filePath = join(dirPath, 'execution-records.jsonl');
    this.load();
  }

  get height(): number {
    return this.chain.length;
  }

  tipHash(): string {
    if (this.chain.length === 0) return GENESIS;
    return this.chain[this.chain.length - 1].contentHash;
  }

  append(input: AppendRecordInput): ExecutionRecord {
    const prevHash = this.tipHash();
    const height = this.chain.length + 1;
    const bodyForHash = {
      height,
      prevHash,
      processId: input.processId,
      recordType: input.recordType,
      payload: input.payload,
      createdAt: input.createdAt,
      sensitiveEncrypted: input.sensitiveEncrypted ?? false,
    };
    const contentHashValue = contentHash(bodyForHash);
    const record: ExecutionRecord = {
      height,
      prevHash,
      contentHash: contentHashValue,
      processId: input.processId,
      recordType: input.recordType,
      payload: input.payload,
      createdAt: input.createdAt,
      sensitiveEncrypted: input.sensitiveEncrypted ?? false,
      snapshot: { hash: contentHashValue, prevHash },
    };

    if (height > 1 && record.prevHash !== this.chain[height - 2].contentHash) {
      throw new Error('LEDGER_CHAIN_BROKEN');
    }

    appendFileSync(this.filePath, `${JSON.stringify(record)}\n`, 'utf8');
    this.chain.push(record);
    return record;
  }

  getByHeight(height: number): ExecutionRecord | undefined {
    if (height < 1 || height > this.chain.length) return undefined;
    return this.chain[height - 1];
  }

  listByProcessId(processId: string): ExecutionRecord[] {
    return this.chain.filter((r) => r.processId === processId);
  }

  all(): readonly ExecutionRecord[] {
    return this.chain;
  }

  verifyIntegrity(): { ok: boolean; error?: string } {
    let expectedPrev = GENESIS;
    for (let i = 0; i < this.chain.length; i++) {
      const r = this.chain[i];
      if (r.height !== i + 1) {
        return { ok: false, error: `height mismatch at index ${i}` };
      }
      if (r.prevHash !== expectedPrev) {
        return { ok: false, error: `prevHash mismatch at height ${r.height}` };
      }
      const recomputed = contentHash({
        height: r.height,
        prevHash: r.prevHash,
        processId: r.processId,
        recordType: r.recordType,
        payload: r.payload,
        createdAt: r.createdAt,
        sensitiveEncrypted: r.sensitiveEncrypted ?? false,
      });
      if (recomputed !== r.contentHash) {
        return { ok: false, error: `contentHash mismatch at height ${r.height}` };
      }
      expectedPrev = r.contentHash;
    }
    return { ok: true };
  }

  private load(): void {
    if (!existsSync(this.filePath)) {
      writeFileSync(this.filePath, '', 'utf8');
      return;
    }
    const text = readFileSync(this.filePath, 'utf8');
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      this.chain.push(JSON.parse(line) as ExecutionRecord);
    }
    const v = this.verifyIntegrity();
    if (!v.ok) {
      throw new Error(`LEDGER_LOAD_CORRUPT: ${v.error}`);
    }
  }
}
