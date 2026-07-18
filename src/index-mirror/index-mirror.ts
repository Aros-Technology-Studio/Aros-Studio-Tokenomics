import type { JournalRecord } from '../nodechain/types';
import type { NodechainService } from '../nodechain/nodechain.service';

export interface IndexMirror {
  upsert(record: JournalRecord): Promise<void>;
  replayFrom(nodechain: NodechainService): Promise<{ count: number }>;
  getByProcessId(processId: string): Promise<JournalRecord[]>;
  close?(): Promise<void>;
}

/** In-process index used when Postgres is not configured — real index, not a fake SoT. */
export class MemoryIndexMirror implements IndexMirror {
  private byHeight = new Map<number, JournalRecord>();
  private byProcess = new Map<string, number[]>();

  async upsert(record: JournalRecord): Promise<void> {
    this.byHeight.set(record.height, record);
    if (record.processId) {
      const list = this.byProcess.get(record.processId) ?? [];
      if (!list.includes(record.height)) list.push(record.height);
      list.sort((a, b) => a - b);
      this.byProcess.set(record.processId, list);
    }
  }

  async replayFrom(nodechain: NodechainService): Promise<{ count: number }> {
    const all = await nodechain.listAll();
    this.byHeight.clear();
    this.byProcess.clear();
    for (const r of all) {
      await this.upsert(r);
    }
    return { count: all.length };
  }

  async getByProcessId(processId: string): Promise<JournalRecord[]> {
    const heights = this.byProcess.get(processId) ?? [];
    return heights.map((h) => this.byHeight.get(h)!).filter(Boolean);
  }
}
