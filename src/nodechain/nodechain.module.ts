import { Module } from '@nestjs/common';
import { createLedgerStore } from './ledger.factory';
import { LEDGER_STORE } from './ledger-store.interface';
import { NodechainService } from './nodechain.service';
import { PostgresIndexMirror } from './postgres-index-mirror';

/**
 * Phase 1.2: LEDGER_BACKEND + optional Postgres index mirror.
 * Primary SoT is always LedgerStore — never Postgres.
 */
@Module({
  providers: [
    {
      provide: LEDGER_STORE,
      useFactory: () => createLedgerStore(),
    },
    PostgresIndexMirror,
    NodechainService,
  ],
  exports: [NodechainService, LEDGER_STORE, PostgresIndexMirror],
})
export class NodechainModule {}
