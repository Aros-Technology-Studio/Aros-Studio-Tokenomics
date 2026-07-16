import { Inject, Injectable, Optional } from '@nestjs/common';
import { AstError } from '../common/errors/ast-error';
import { AstErrorCode } from '../common/errors/error-codes';
import { LEDGER_STORE, LedgerStore } from './ledger-store.interface';
import {
  AppendInput,
  AppendReceipt,
  ExecutionRecord,
  ReaderScope,
} from './ledger.types';
import { PostgresIndexMirror } from './postgres-index-mirror';
import { decryptSensitivePayload, encryptSensitivePayload } from './sensitive-payload';

/**
 * NodeChain — sole source of truth (Core Canon §4.1).
 * Phase 1.1: core append/hash/snapshot.
 * Phase 1.2: pluggable durable store + Postgres index mirror (never SoT).
 */
@Injectable()
export class NodechainService {
  constructor(
    @Inject(LEDGER_STORE) private readonly store: LedgerStore,
    @Optional() private readonly mirror?: PostgresIndexMirror,
  ) {}

  append(input: AppendInput): AppendReceipt {
    if (
      input.writerRole !== 'internal_service' &&
      input.writerRole !== 'quorum_validator'
    ) {
      throw new AstError(
        AstErrorCode.NODECHAIN_APPEND_UNAUTHORIZED,
        'append unauthorized',
      );
    }

    let payload: unknown = input.payload;
    let sensitiveEncrypted = false;
    if (input.sensitive) {
      payload = encryptSensitivePayload(input.payload);
      sensitiveEncrypted = true;
    }

    const record = this.store.append({
      processId: input.processId,
      recordType: input.recordType,
      payload,
      createdAt: new Date().toISOString(),
      sensitiveEncrypted,
    });

    const integrity = this.store.verifyIntegrity();
    if (!integrity.ok) {
      throw new AstError(
        AstErrorCode.NODECHAIN_APPEND_FAILED,
        integrity.error ?? 'integrity failed after append',
      );
    }

    // Secondary index only — failures must not undo primary
    void this.mirror?.project(record);

    return {
      height: record.height,
      contentHash: record.contentHash,
      prevHash: record.prevHash,
      processId: record.processId,
      createdAt: record.createdAt,
    };
  }

  getHeight(): number {
    return this.store.height;
  }

  tipHash(): string {
    return this.store.tipHash();
  }

  getByHeight(height: number): ExecutionRecord | undefined {
    return this.store.getByHeight(height);
  }

  read(scope: ReaderScope, opts: { processId?: string }): ExecutionRecord[] {
    if (scope === 'own_process') {
      if (!opts.processId) {
        throw new AstError(
          AstErrorCode.INVALID_PROCESS_ID,
          'processId required for own_process scope',
        );
      }
      return this.store
        .listByProcessId(opts.processId)
        .map((r) => this.maybeDecrypt(r));
    }
    return this.store.all().map((r) => this.maybeDecrypt(r));
  }

  listOwnProcess(processId: string): ExecutionRecord[] {
    return this.read('own_process', { processId });
  }

  verifyIntegrity(): { ok: boolean; error?: string } {
    return this.store.verifyIntegrity();
  }

  /** Expose whether SQL mirror is active (never means mirror is SoT). */
  isIndexMirrorEnabled(): boolean {
    return this.mirror?.isEnabled() ?? false;
  }

  private maybeDecrypt(r: ExecutionRecord): ExecutionRecord {
    if (!r.sensitiveEncrypted) return r;
    const box = r.payload as {
      ciphertext: string;
      iv: string;
      tag: string;
    };
    return {
      ...r,
      payload: decryptSensitivePayload(box),
    };
  }
}
