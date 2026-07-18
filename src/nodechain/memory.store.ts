import type { JournalStore } from './store.interface';
import type { JournalRecord, Tip } from './types';
import { NodeChainError, NcErrorCode } from './errors';

export class MemoryJournalStore implements JournalStore {
  private byHeight = new Map<number, JournalRecord>();
  private byRecordId = new Map<string, JournalRecord>();
  private byClientId = new Map<string, JournalRecord>();
  private tip: Tip | null = null;

  async getTip(): Promise<Tip | null> {
    return this.tip;
  }

  async getByHeight(height: number): Promise<JournalRecord | null> {
    return this.byHeight.get(height) ?? null;
  }

  async getByRecordId(recordId: string): Promise<JournalRecord | null> {
    return this.byRecordId.get(recordId) ?? null;
  }

  async getByClientRecordId(clientRecordId: string): Promise<JournalRecord | null> {
    return this.byClientId.get(clientRecordId) ?? null;
  }

  async listByProcessId(processId: string): Promise<JournalRecord[]> {
    return [...this.byHeight.values()]
      .filter((r) => r.processId === processId)
      .sort((a, b) => a.height - b.height);
  }

  async listAll(): Promise<JournalRecord[]> {
    return [...this.byHeight.values()].sort((a, b) => a.height - b.height);
  }

  async appendDurable(record: JournalRecord, clientRecordId?: string): Promise<void> {
    if (this.byHeight.has(record.height)) {
      throw new NodeChainError(NcErrorCode.STORAGE, `height ${record.height} already exists`);
    }
    if (this.byRecordId.has(record.recordId)) {
      throw new NodeChainError(NcErrorCode.STORAGE, `recordId exists`);
    }
    // Append-only: freeze stored records so callers cannot mutate journal history in place
    const sealed = Object.freeze({
      ...record,
      payload: Object.freeze({ ...record.payload }),
      signatures: Object.freeze([...(record.signatures ?? [])]),
    }) as JournalRecord;
    this.byHeight.set(sealed.height, sealed);
    this.byRecordId.set(sealed.recordId, sealed);
    if (clientRecordId) {
      this.byClientId.set(clientRecordId, sealed);
    }
    this.tip = Object.freeze({ height: sealed.height, tipHash: sealed.envelopeHash });
  }
}
