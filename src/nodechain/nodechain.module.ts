import { Module } from '@nestjs/common';
import { MemoryLedgerStore } from './memory-ledger.store';
import { NodechainService } from './nodechain.service';

/**
 * Phase 1.1: MemoryLedgerStore as primary.
 * Phase 1.2: swap store implementation (RocksDB) without changing service contract.
 */
@Module({
  providers: [MemoryLedgerStore, NodechainService],
  exports: [NodechainService, MemoryLedgerStore],
})
export class NodechainModule {}
