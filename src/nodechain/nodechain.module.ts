import { Module } from '@nestjs/common';
import { NodechainService } from './nodechain.service';
import { MemoryJournalStore } from './memory.store';
import { FileJournalStore } from './file.store';
import type { JournalStore } from './store.interface';

export const JOURNAL_STORE = 'JOURNAL_STORE';

@Module({
  providers: [
    {
      provide: JOURNAL_STORE,
      useFactory: (): JournalStore => {
        const dir = process.env.AST_JOURNAL_DIR;
        if (dir) {
          return new FileJournalStore(dir);
        }
        return new MemoryJournalStore();
      },
    },
    {
      provide: NodechainService,
      useFactory: (store: JournalStore) => new NodechainService(store),
      inject: [JOURNAL_STORE],
    },
  ],
  exports: [NodechainService, JOURNAL_STORE],
})
export class NodechainModule {}
