import * as path from 'path';
import type { JournalStore } from './store.interface';
import { MemoryJournalStore } from './memory.store';
import { FileJournalStore } from './file.store';
import { RocksDbJournalStore } from './rocksdb.store';
import { NodechainService } from './nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { loadOrCreateKeys } from '../common/crypto/key-persistence';
import type { KeyRegistry } from '../common/crypto/key-registry';
import {
  JournalAtRestCipher,
  journalEncryptEnabled,
  loadOrCreateAtRestKey,
} from '../common/crypto/at-rest';

export type JournalEngine = 'memory' | 'file' | 'rocksdb';

export function createJournalStore(
  engine: JournalEngine = 'memory',
  dir = 'data/journal',
  atRest?: JournalAtRestCipher | null,
): JournalStore {
  switch (engine) {
    case 'memory':
      return new MemoryJournalStore();
    case 'file':
      return new FileJournalStore(path.resolve(dir), atRest);
    case 'rocksdb':
      return new RocksDbJournalStore(path.resolve(dir), atRest);
    default:
      throw new Error(`unknown journal engine: ${engine}`);
  }
}

async function resolveAtRest(
  engine: JournalEngine,
  dir: string,
): Promise<JournalAtRestCipher | null> {
  if (engine === 'memory') return null;
  if (!journalEncryptEnabled()) return null;
  const key = await loadOrCreateAtRestKey(dir);
  return new JournalAtRestCipher(key);
}

export async function createNodechainAsync(opts?: {
  engine?: JournalEngine;
  dir?: string;
  keys?: KeyRegistry;
  verifyEveryN?: number;
  /** Override at-rest cipher; null forces plaintext durable store. */
  atRest?: JournalAtRestCipher | null;
}): Promise<{ store: JournalStore; nodechain: NodechainService; keys: KeyRegistry }> {
  const engine =
    opts?.engine ??
    ((process.env.AST_JOURNAL_ENGINE as JournalEngine | undefined) || 'memory');
  const dir = path.resolve(opts?.dir ?? process.env.AST_JOURNAL_DIR ?? 'data/journal');
  const keys =
    opts?.keys ??
    (engine === 'memory' ? bootstrapPipelineKeys() : await loadOrCreateKeys(dir));
  const atRest =
    opts?.atRest !== undefined ? opts.atRest : await resolveAtRest(engine, dir);
  const store = createJournalStore(engine, dir, atRest);
  const nodechain = new NodechainService(store, {
    keys,
    verifyEveryN:
      opts?.verifyEveryN ??
      (process.env.AST_VERIFY_EVERY_N ? Number(process.env.AST_VERIFY_EVERY_N) : 5),
  });
  return { store, nodechain, keys };
}

/** Sync helper for tests (memory + ephemeral keys). File/rocksdb need async for at-rest key. */
export function createNodechain(opts?: {
  engine?: JournalEngine;
  dir?: string;
  keys?: KeyRegistry;
  verifyEveryN?: number;
  atRest?: JournalAtRestCipher | null;
}): { store: JournalStore; nodechain: NodechainService; keys: KeyRegistry } {
  const engine = opts?.engine ?? 'memory';
  if (engine !== 'memory' && !opts?.keys) {
    throw new Error('createNodechain sync requires keys for file/rocksdb; use createNodechainAsync');
  }
  const keys = opts?.keys ?? bootstrapPipelineKeys();
  const dir = opts?.dir ?? 'data/journal';
  // Sync path: use provided cipher or plaintext (tests pass atRest explicitly when needed)
  const store = createJournalStore(engine, dir, opts?.atRest ?? null);
  const nodechain = new NodechainService(store, {
    keys,
    verifyEveryN: opts?.verifyEveryN ?? 5,
  });
  return { store, nodechain, keys };
}
