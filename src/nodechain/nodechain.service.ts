import { randomUUID } from 'crypto';
import type { JournalStore } from './store.interface';
import {
  GENESIS_PREV_HASH,
  SCHEMA_VERSION,
  type AppendRequest,
  type AppendResult,
  type JournalRecord,
  type Tip,
} from './types';
import { computeContentHash, computeEnvelopeHash, verifyChainLink } from './hash';
import { NodeChainError, NcErrorCode } from './errors';
import { isProcessScoped, KNOWN_TYPES } from './record-types';

export class NodechainService {
  private readOnly = false;

  constructor(private readonly store: JournalStore) {}

  setReadOnly(value: boolean): void {
    this.readOnly = value;
  }

  async getTip(): Promise<Tip | null> {
    return this.store.getTip();
  }

  async getByHeight(height: number): Promise<JournalRecord | null> {
    return this.store.getByHeight(height);
  }

  async listByProcessId(processId: string): Promise<JournalRecord[]> {
    return this.store.listByProcessId(processId);
  }

  async listAll(): Promise<JournalRecord[]> {
    return this.store.listAll();
  }

  async verifyChain(): Promise<{ ok: boolean; height: number; error?: string }> {
    const all = await this.store.listAll();
    if (all.length === 0) {
      return { ok: true, height: -1 };
    }
    let prev: JournalRecord | null = null;
    for (const rec of all) {
      if (!verifyChainLink(prev, rec, GENESIS_PREV_HASH)) {
        return {
          ok: false,
          height: rec.height,
          error: `chain break at height ${rec.height}`,
        };
      }
      prev = rec;
    }
    return { ok: true, height: prev!.height };
  }

  /**
   * Height 0 — genesis. Required before any other append.
   */
  async ensureGenesis(writerId = 'system'): Promise<AppendResult> {
    const tip = await this.store.getTip();
    if (tip !== null) {
      const g = await this.store.getByHeight(0);
      if (g?.recordType === 'genesis') {
        return {
          recordId: g.recordId,
          height: g.height,
          envelopeHash: g.envelopeHash,
          timestampUtc: g.timestampUtc,
          contentHash: g.contentHash,
        };
      }
      throw new NodeChainError(NcErrorCode.ALREADY_GENESIS, 'journal already has tip without genesis');
    }
    return this.append({
      clientRecordId: 'genesis',
      recordType: 'genesis',
      processId: null,
      payload: {
        layer: '01_NodeChain',
        schemaVersion: SCHEMA_VERSION,
        message: 'AST NodeChain genesis',
      },
      writerId,
      writerRole: 'system',
    });
  }

  async append(req: AppendRequest): Promise<AppendResult> {
    if (this.readOnly) {
      throw new NodeChainError(NcErrorCode.READ_ONLY, 'journal is read-only');
    }
    if (!req.writerId) {
      throw new NodeChainError(NcErrorCode.UNAUTHENTICATED, 'writerId required');
    }
    if (!req.recordType || !KNOWN_TYPES.has(req.recordType)) {
      throw new NodeChainError(NcErrorCode.UNKNOWN_TYPE, `unknown recordType: ${req.recordType}`);
    }
    if (!req.payload || typeof req.payload !== 'object') {
      throw new NodeChainError(NcErrorCode.SCHEMA, 'payload object required');
    }

    const processId =
      req.processId === undefined ? null : req.processId === '' ? null : req.processId;

    if (isProcessScoped(req.recordType) && !processId) {
      throw new NodeChainError(NcErrorCode.PROCESS_REQUIRED, 'processId required for type');
    }

    // Deep-freeze payload so later mutation of caller objects cannot rewrite history.
    const payload = JSON.parse(JSON.stringify(req.payload)) as Record<string, unknown>;

    if (req.clientRecordId) {
      const existing = await this.store.getByClientRecordId(req.clientRecordId);
      if (existing) {
        return {
          recordId: existing.recordId,
          height: existing.height,
          envelopeHash: existing.envelopeHash,
          timestampUtc: existing.timestampUtc,
          contentHash: existing.contentHash,
        };
      }
    }

    const tip = await this.store.getTip();
    if (req.recordType !== 'genesis' && tip === null) {
      throw new NodeChainError(NcErrorCode.NO_GENESIS, 'call ensureGenesis first');
    }
    if (req.recordType === 'genesis' && tip !== null) {
      throw new NodeChainError(NcErrorCode.ALREADY_GENESIS, 'genesis already exists');
    }

    const height = tip === null ? 0 : tip.height + 1;
    const prevHash = tip === null ? GENESIS_PREV_HASH : tip.tipHash;
    const recordId = randomUUID();
    const timestampUtc = new Date().toISOString();
    const contentHash = computeContentHash({
      schemaVersion: SCHEMA_VERSION,
      recordType: req.recordType,
      processId,
      payload,
    });

    const envelopeHash = computeEnvelopeHash({
      recordId,
      schemaVersion: SCHEMA_VERSION,
      recordType: req.recordType,
      processId,
      writerId: req.writerId,
      writerRole: req.writerRole,
      timestampUtc,
      prevHash,
      contentHash,
      height,
      payload,
    });

    const signatures =
      req.signatures && req.signatures.length > 0
        ? req.signatures
        : [
            {
              signerId: req.writerId,
              algorithm: 'dev-self-attest',
              signature: contentHash.slice(0, 32),
              signedOver: 'contentHash' as const,
            },
          ];

    const record: JournalRecord = {
      recordId,
      schemaVersion: SCHEMA_VERSION,
      recordType: req.recordType,
      processId,
      writerId: req.writerId,
      writerRole: req.writerRole,
      timestampUtc,
      prevHash,
      contentHash,
      height,
      payload,
      signatures,
      envelopeHash,
    };

    await this.store.appendDurable(record, req.clientRecordId);

    return {
      recordId,
      height,
      envelopeHash,
      timestampUtc,
      contentHash,
    };
  }
}
