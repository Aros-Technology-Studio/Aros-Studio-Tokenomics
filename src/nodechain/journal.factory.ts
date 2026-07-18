import * as path from 'path';
import type { JournalStore } from './store.interface';
import { MemoryJournalStore } from './memory.store';
import { FileJournalStore } from './file.store';
import { RocksDbJournalStore } from './rocksdb.store';
import { NodechainService, type NodechainOptions } from './nodechain.service';
import { bootstrapPipelineKeys } from '../common/crypto/bootstrap-keys';
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

export function createNodechain(opts?: {
  engine?: JournalEngine;
  dir?: string;
  requireRealCrypto?: boolean;
  keys?: KeyRegistry;
  verifyEveryN?: number;
}): { store: JournalStore; nodechain: NodechainService; keys: KeyRegistry } {
  const engine =
    opts?.engine ??
    ((process.env.AST_JOURNAL_ENGINE as JournalEngine | undefined) || 'memory');
  const dir = opts?.dir ?? process.env.AST_JOURNAL_DIR ?? 'data/journal';
  const keys = opts?.keys ?? bootstrapPipelineKeys();
  const store = createJournalStore(engine, dir);
  const options: NodechainOptions = {
    keys,
    requireRealCrypto: opts?.requireRealCrypto ?? process.env.AST_REQUIRE_CRYPTO === '1',
    verifyEveryN: opts?.verifyEveryN ?? (process.env.AST_VERIFY_EVERY_N ? Number(process.env.AST_VERIFY_EVERY_N) : 5),
  };
  // default on for non-memory engines
  if (opts?.requireRealCrypto === undefined && engine !== 'memory' && process.env.AST_REQUIRE_CRYPTO !== '0') {
    options.requireRealCrypto = true;
  }
  if (opts?.requireRealCrypto === undefined && process.env.AST_REQUIRE_CRYPTO === undefined) {
    // tests/demo: enable real crypto by default when keys present
    options.requireRealCrypto = true;
  }
  const nodechain = new NodechainService(store, options);
  return { store, nodechain, keys };
}
