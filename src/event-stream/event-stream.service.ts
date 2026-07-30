import type { JournalRecord } from '../nodechain/types';
import { DurableEventLog } from './durable-event-log';
import type { AppendObserverEventInput, ObserverEvent } from './types';

/**
 * Outbound observer bus (B4). NodeChain + Eye publish; consumers poll/resume.
 * No append rights for All-Seeing Eye / external clients.
 */
export class EventStreamService {
  constructor(private readonly log: DurableEventLog) {}

  static async createDefault(): Promise<EventStreamService> {
    return new EventStreamService(await DurableEventLog.openFromEnv());
  }

  static memory(): EventStreamService {
    return new EventStreamService(DurableEventLog.memory());
  }

  async publish(input: AppendObserverEventInput): Promise<ObserverEvent> {
    return this.log.append(input);
  }

  async onRecordAppended(record: JournalRecord): Promise<ObserverEvent> {
    await this.log.append({
      type: 'record_appended',
      height: record.height,
      recordId: record.recordId,
      recordType: record.recordType,
      processId: record.processId,
      writerId: record.writerId,
      tipHash: record.envelopeHash,
      data: {
        contentHash: record.contentHash,
        writerRole: record.writerRole,
      },
    });
    return this.log.append({
      type: 'tip_advanced',
      height: record.height,
      tipHash: record.envelopeHash,
      recordId: record.recordId,
    });
  }

  async query(opts?: {
    fromSeq?: number;
    fromHeight?: number;
    types?: string[];
    limit?: number;
  }) {
    return this.log.query(opts);
  }

  tipSeq(): number {
    return this.log.tipSeq();
  }
}
