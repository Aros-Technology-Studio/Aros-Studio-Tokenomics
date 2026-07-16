import { Injectable } from '@nestjs/common';
import { contentHash, sha256Hex } from '../common/crypto/hash';
import { ExecutionRecord } from './ledger.types';

/**
 * In-memory primary ledger for v1 development.
 * Production target: RocksDB (CANON §XII) behind the same interface.
 */
@Injectable()
export class MemoryLedgerStore {
  private readonly chain: ExecutionRecord[] = [];

  get height(): number {
    return this.chain.length;
  }

  tipHash(): string {
    if (this.chain.length === 0) {
      return sha256Hex('GENESIS');
    }
    return this.chain[this.chain.length - 1].contentHash;
  }

  append(record: Omit<ExecutionRecord, 'height' | 'contentHash' | 'prevHash'> & {
    contentHash?: string;
  }): ExecutionRecord {
    const prevHash = this.tipHash();
    const height = this.chain.length + 1;
    const body = {
      height,
      prevHash,
      processId: record.processId,
      recordType: record.recordType,
      payload: record.payload,
      createdAt: record.createdAt,
    };
    const hash = contentHash(body);
    const full: ExecutionRecord = {
      ...body,
      contentHash: hash,
    };
    this.chain.push(full);
    return full;
  }

  listByProcessId(processId: string): ExecutionRecord[] {
    return this.chain.filter((r) => r.processId === processId);
  }

  all(): readonly ExecutionRecord[] {
    return this.chain;
  }
}
