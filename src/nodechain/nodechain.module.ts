import { Global, Module } from '@nestjs/common';
import { NodechainService } from './nodechain.service';
import { createNodechainAsync } from './journal.factory';
import type { JournalStore } from './store.interface';
import type { KeyRegistry } from '../common/crypto/key-registry';

export const JOURNAL_STORE = 'JOURNAL_STORE';
export const KEY_REGISTRY = 'KEY_REGISTRY';

@Global()
@Module({
  providers: [
    {
      provide: 'AST_RUNTIME',
      useFactory: async () => {
        const engine = (process.env.AST_JOURNAL_ENGINE as 'memory' | 'file' | 'rocksdb') || 'file';
        const dir = process.env.AST_JOURNAL_DIR || 'data/journal';
        return createNodechainAsync({ engine, dir });
      } },
    {
      provide: JOURNAL_STORE,
      inject: ['AST_RUNTIME'],
      useFactory: (rt: { store: JournalStore }) => rt.store },
    {
      provide: KEY_REGISTRY,
      inject: ['AST_RUNTIME'],
      useFactory: (rt: { keys: KeyRegistry }) => rt.keys },
    {
      provide: NodechainService,
      inject: ['AST_RUNTIME'],
      useFactory: (rt: { nodechain: NodechainService }) => rt.nodechain },
  ],
  exports: [NodechainService, JOURNAL_STORE, KEY_REGISTRY] })
export class NodechainModule {}
