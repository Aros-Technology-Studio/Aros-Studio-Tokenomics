import { Logger } from '@nestjs/common';
import { FileLedgerStore } from './file-ledger.store';
import { LedgerStore } from './ledger-store.interface';
import { MemoryLedgerStore } from './memory-ledger.store';
import { RocksDbLedgerStore } from './rocksdb-ledger.store';

const log = new Logger('LedgerFactory');

export type LedgerBackend = 'memory' | 'file' | 'rocksdb';

/**
 * LEDGER_BACKEND=memory|file|rocksdb
 * LEDGER_PATH=./data/nodechain (file/rocksdb)
 *
 * Default: memory (tests). Durable: file or rocksdb (file fallback if native missing).
 */
export function createLedgerStore(): LedgerStore {
  const backend = (process.env.LEDGER_BACKEND ?? 'memory').toLowerCase() as LedgerBackend;
  const path = process.env.LEDGER_PATH ?? './data/nodechain';

  if (backend === 'memory') {
    log.log('Ledger backend: memory');
    return new MemoryLedgerStore();
  }

  if (backend === 'rocksdb') {
    log.log(`Ledger backend: rocksdb (path=${path}; file fallback if native unavailable)`);
    return new RocksDbLedgerStore(path);
  }

  // file
  log.log(`Ledger backend: file (path=${path})`);
  return new FileLedgerStore(path);
}
