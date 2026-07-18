import * as path from 'path';
import type { JournalStore } from './store.interface';
import { MemoryJournalStore } from './memory.store';
import { FileJournalStore } from './file.store';
import { RocksDbJournalStore } from './rocksdb.store';
import { NodechainService, type NodechainOptions } from './nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
import { loadOrCreateKeys } from '../common/crypto/key-persistence';
import type { KeyRegistry } from '../common/crypto/key-registry';

export type JournalEngine = 'memory' | 'file' | 'rocksdb';

export function createJournalStore(
  engine: JournalEngine = 'memory',
  dir = 'data/journal',
): JournalStore {
  switch (engine) {
    case 'memory':
      return new MemoryJournalStore();
    case 'file':
      return new FileJournalStore(path.resolve(dir));
    case 'rocksdb':
      return new RocksDbJournalStore(path.resolve(dir));
    default:
      throw new Error(`unknown journal engine: ${engine}`);
  }
}

export async function createNodechainAsync(opts?: {
  engine?: JournalEngine;
  dir?: string;
  requireRealCrypto?: boolean;
  keys?: KeyRegistry;
  verifyEveryN?: number;
}): Promise<{ store: JournalStore; nodechain: NodechainService; keys: KeyRegistry }> {
  const engine =
    opts?.engine ??
    ((process.env.AST_JOURNAL_ENGINE as JournalEngine | undefined) || 'memory');
  const dir = path.resolve(opts?.dir ?? process.env.AST_JOURNAL_DIR ?? 'data/journal');
  const keys =
    opts?.keys ??
    (engine === 'memory' ? bootstrapPipelineKeys() : await loadOrCreateKeys(dir));
  const store = createJournalStore(engine, dir);
  const options: NodechainOptions = {
    keys,
    requireRealCrypto: opts?.requireRealCrypto ?? true,
    verifyEveryN:
      opts?.verifyEveryN ??
      (process.env.AST_VERIFY_EVERY_N ? Number(process.env.AST_VERIFY_EVERY_N) : 5),
  };
  const nodechain = new NodechainService(store, options);
  return { store, nodechain, keys };
}

/** Sync helper for tests (memory + ephemeral keys). */
export function createNodechain(opts?: {
  engine?: JournalEngine;
  dir?: string;
  requireRealCrypto?: boolean;
  keys?: KeyRegistry;
  verifyEveryN?: number;
}): { store: JournalStore; nodechain: NodechainService; keys: KeyRegistry } {
  const engine = opts?.engine ?? 'memory';
  if (engine !== 'memory' && !opts?.keys) {
    throw new Error('createNodechain sync requires keys for file/rocksdb; use createNodechainAsync');
  }
  const keys = opts?.keys ?? bootstrapPipelineKeys();
  const dir = opts?.dir ?? 'data/journal';
  const store = createJournalStore(engine, dir);
  const nodechain = new NodechainService(store, {
    keys,
    requireRealCrypto: opts?.requireRealCrypto ?? true,
    verifyEveryN: opts?.verifyEveryN ?? 5,
  });
  return { store, nodechain, keys };
}
