import { Injectable } from '@nestjs/common';
import { contentHash, sha256Hex } from '../common/crypto/hash';
import { AppendRecordInput, LedgerStore } from './ledger-store.interface';
import { ExecutionRecord } from './ledger.types';

const GENESIS = sha256Hex('GENESIS');

/**
 * Phase 1.1 primary store (in-process).
 * Replaced/backed by RocksDB in Phase 1.2 without changing NodechainService API.
 */
@Injectable()
export class MemoryLedgerStore implements LedgerStore {
  private readonly chain: ExecutionRecord[] = [];

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
      snapshot: {
        hash: contentHashValue,
        prevHash,
      },
    };
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
      if (r.snapshot.hash !== r.contentHash || r.snapshot.prevHash !== r.prevHash) {
        return { ok: false, error: `snapshot mismatch at height ${r.height}` };
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
}
