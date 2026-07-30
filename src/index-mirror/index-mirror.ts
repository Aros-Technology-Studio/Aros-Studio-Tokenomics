import type { JournalRecord } from '../nodechain/types';
import type { NodechainService } from '../nodechain/nodechain.service';

export interface IndexMirrorStatus {
  kind: 'memory' | 'postgres';
  role: 'index_mirror_not_sot';
  ready: boolean;
  journalHeight?: number | null;
  mirrorMaxHeight?: number | null;
  lagHeights?: number | null;
  recordCount?: number;
  lastReplayCount?: string | null;
  databaseUrlSet?: boolean;
  error?: string;
}

export interface IndexMirror {
  readonly kind: 'memory' | 'postgres';
  upsert(record: JournalRecord): Promise<void>;
  replayFrom(nodechain: NodechainService): Promise<{ count: number }>;
  getByProcessId(processId: string): Promise<JournalRecord[]>;
  getStatus?(nodechain?: NodechainService): Promise<IndexMirrorStatus>;
  ensureSchema?(): Promise<void>;
  close?(): Promise<void>;
}

/** In-process index used when Postgres is not configured — real index, not a fake SoT. */
export class MemoryIndexMirror implements IndexMirror {
  readonly kind = 'memory' as const;
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

  async getStatus(nodechain?: NodechainService): Promise<IndexMirrorStatus> {
    const tip = nodechain ? await nodechain.getTip() : null;
    const heights = [...this.byHeight.keys()];
    const mirrorMax = heights.length ? Math.max(...heights) : null;
    const journalHeight = tip?.height ?? null;
    return {
      kind: 'memory',
      role: 'index_mirror_not_sot',
      ready: true,
      journalHeight,
      mirrorMaxHeight: mirrorMax,
      lagHeights:
        journalHeight != null && mirrorMax != null ? journalHeight - mirrorMax : null,
      recordCount: this.byHeight.size,
      databaseUrlSet: false,
    };
  }
}
