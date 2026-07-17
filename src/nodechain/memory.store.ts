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
    this.byHeight.set(record.height, record);
    this.byRecordId.set(record.recordId, record);
    if (clientRecordId) {
      this.byClientId.set(clientRecordId, record);
    }
    this.tip = { height: record.height, tipHash: record.envelopeHash };
  }
}
