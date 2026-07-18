import { Module } from '@nestjs/common';
import { NodechainService } from './nodechain.service';
import { createJournalStore, createNodechain } from './journal.factory';
import type { JournalStore } from './store.interface';

export const JOURNAL_STORE = 'JOURNAL_STORE';

@Module({
  providers: [
    {
      provide: JOURNAL_STORE,
      useFactory: (): JournalStore => {
        const engine = (process.env.AST_JOURNAL_ENGINE as 'memory' | 'file' | 'rocksdb') || 'file';
        const dir = process.env.AST_JOURNAL_DIR || 'data/journal';
        return createJournalStore(engine, dir);
      },
    },
    {
      provide: NodechainService,
      useFactory: () => createNodechain().nodechain,
    },
  ],
  exports: [NodechainService, JOURNAL_STORE],
})
export class NodechainModule {}
