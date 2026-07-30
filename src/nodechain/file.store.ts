import { promises as fs } from 'fs';
import * as path from 'path';
import type { JournalStore } from './store.interface';
import type { JournalRecord, Tip } from './types';
import { NodeChainError, NcErrorCode } from './errors';
import type { JournalAtRestCipher } from '../common/crypto/at-rest';

/**
 * Simple durable file journal: one JSONL file + tip.json.
 * Optional AES-256-GCM at-rest cipher (B2) — each line / tip / clients sealed.
 */
export class FileJournalStore implements JournalStore {
  private ready: Promise<void>;
  private byHeight = new Map<number, JournalRecord>();
  private byRecordId = new Map<string, JournalRecord>();
  private byClientId = new Map<string, string>(); // clientId -> recordId
  private tip: Tip | null = null;

  constructor(
    private readonly dir: string,
    private readonly atRest?: JournalAtRestCipher | null,
  ) {
    this.ready = this.load();
  }

  private journalPath(): string {
    return path.join(this.dir, 'journal.jsonl');
  }

  private tipPath(): string {
    return path.join(this.dir, 'tip.json');
  }

  private clientsPath(): string {
    return path.join(this.dir, 'clients.json');
  }

  private encode(value: unknown): string {
    if (this.atRest) return this.atRest.encode(value);
    return JSON.stringify(value);
  }

  private decodeRecord(line: string): JournalRecord {
    if (this.atRest) return this.atRest.decode<JournalRecord>(line);
    return JSON.parse(line) as JournalRecord;
  }

  private decodeTip(raw: string): Tip {
    if (this.atRest) return this.atRest.decode<Tip>(raw);
    return JSON.parse(raw) as Tip;
  }

  private decodeClients(raw: string): Record<string, string> {
    if (this.atRest) return this.atRest.decode<Record<string, string>>(raw);
    return JSON.parse(raw) as Record<string, string>;
  }

  private async load(): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true });
    try {
      const raw = await fs.readFile(this.journalPath(), 'utf8');
      for (const line of raw.split('\n')) {
        if (!line.trim()) continue;
        const rec = this.decodeRecord(line);
        this.byHeight.set(rec.height, rec);
        this.byRecordId.set(rec.recordId, rec);
      }
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    }
    try {
      const tipRaw = await fs.readFile(this.tipPath(), 'utf8');
      this.tip = this.decodeTip(tipRaw);
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
      if (this.byHeight.size > 0) {
        const maxH = Math.max(...this.byHeight.keys());
        const r = this.byHeight.get(maxH)!;
        this.tip = { height: r.height, tipHash: r.envelopeHash };
      }
    }
    try {
      const c = await fs.readFile(this.clientsPath(), 'utf8');
      this.byClientId = new Map(Object.entries(this.decodeClients(c)));
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    }
  }

  private async ensureReady(): Promise<void> {
    await this.ready;
  }

  async getTip(): Promise<Tip | null> {
    await this.ensureReady();
    return this.tip;
  }

  async getByHeight(height: number): Promise<JournalRecord | null> {
    await this.ensureReady();
    return this.byHeight.get(height) ?? null;
  }

  async getByRecordId(recordId: string): Promise<JournalRecord | null> {
    await this.ensureReady();
    return this.byRecordId.get(recordId) ?? null;
  }

  async getByClientRecordId(clientRecordId: string): Promise<JournalRecord | null> {
    await this.ensureReady();
    const id = this.byClientId.get(clientRecordId);
    if (!id) return null;
    return this.byRecordId.get(id) ?? null;
  }

  async listByProcessId(processId: string): Promise<JournalRecord[]> {
    await this.ensureReady();
    return [...this.byHeight.values()]
      .filter((r) => r.processId === processId)
      .sort((a, b) => a.height - b.height);
  }

  async listAll(): Promise<JournalRecord[]> {
    await this.ensureReady();
    return [...this.byHeight.values()].sort((a, b) => a.height - b.height);
  }

  async appendDurable(record: JournalRecord, clientRecordId?: string): Promise<void> {
    await this.ensureReady();
    if (this.byHeight.has(record.height)) {
      throw new NodeChainError(NcErrorCode.STORAGE, `height ${record.height} exists`);
    }
    this.byHeight.set(record.height, record);
    this.byRecordId.set(record.recordId, record);
    if (clientRecordId) {
      this.byClientId.set(clientRecordId, record.recordId);
    }
    this.tip = { height: record.height, tipHash: record.envelopeHash };

    try {
      await fs.appendFile(this.journalPath(), this.encode(record) + '\n', 'utf8');
      await fs.writeFile(this.tipPath(), this.encode(this.tip), 'utf8');
      if (clientRecordId) {
        const obj = Object.fromEntries(this.byClientId);
        await fs.writeFile(this.clientsPath(), this.encode(obj), 'utf8');
      }
    } catch (e) {
      throw new NodeChainError(NcErrorCode.STORAGE, `durable write failed: ${String(e)}`);
    }
  }
}
