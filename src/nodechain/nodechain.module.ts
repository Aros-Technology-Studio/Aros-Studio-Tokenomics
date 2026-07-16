import { Module } from '@nestjs/common';
import { MemoryLedgerStore } from './memory-ledger.store';
import { NodechainService } from './nodechain.service';

@Module({
  providers: [MemoryLedgerStore, NodechainService],
  exports: [NodechainService, MemoryLedgerStore],
})
export class NodechainModule {}
