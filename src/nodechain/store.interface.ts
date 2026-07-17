import type { JournalRecord, Tip } from './types';

export interface JournalStore {
  getTip(): Promise<Tip | null>;
  getByHeight(height: number): Promise<JournalRecord | null>;
  getByRecordId(recordId: string): Promise<JournalRecord | null>;
  getByClientRecordId(clientRecordId: string): Promise<JournalRecord | null>;
  listByProcessId(processId: string): Promise<JournalRecord[]>;
  appendDurable(record: JournalRecord, clientRecordId?: string): Promise<void>;
  listAll(): Promise<JournalRecord[]>;
}
