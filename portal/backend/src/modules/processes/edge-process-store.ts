import * as fs from 'fs';
import * as path from 'path';
import type { ProcessRecord } from '../../common/edge-shared';

export interface EdgeStoreSnapshot {
  version: 1;
  processes: ProcessRecord[];
  idempotency: Array<{ scope: string; processId: string; fingerprint: string }>;
}

/**
 * File-backed edge process index (survives portal edge restarts).
 * Not NodeChain SoT — admission tracking only.
 */
export class EdgeProcessStore {
  private readonly filePath: string;

  constructor(filePath?: string) {
    this.filePath =
      filePath ??
      process.env.AST_EDGE_STORE_PATH ??
      path.resolve(process.cwd(), 'data/edge-processes.json');
  }

  get path(): string {
    return this.filePath;
  }

  load(): EdgeStoreSnapshot {
    try {
      if (!fs.existsSync(this.filePath)) {
        return { version: 1, processes: [], idempotency: [] };
      }
      const raw = fs.readFileSync(this.filePath, 'utf8');
      const parsed = JSON.parse(raw) as EdgeStoreSnapshot;
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.processes)) {
        return { version: 1, processes: [], idempotency: [] };
      }
      return {
        version: 1,
        processes: parsed.processes,
        idempotency: Array.isArray(parsed.idempotency) ? parsed.idempotency : [],
      };
    } catch {
      return { version: 1, processes: [], idempotency: [] };
    }
  }

  save(snapshot: EdgeStoreSnapshot): void {
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });
    const tmp = `${this.filePath}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(snapshot, null, 2), 'utf8');
    fs.renameSync(tmp, this.filePath);
  }
}
