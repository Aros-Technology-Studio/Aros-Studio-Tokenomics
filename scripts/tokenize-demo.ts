#!/usr/bin/env tsx
import { createNodechain } from '../src/nodechain/journal.factory';
import { TokenizationPipeline } from '../src/intake/tokenization.pipeline';
import type { RocksDbJournalStore } from '../src/nodechain/rocksdb.store';

async function main(): Promise<void> {
  const dirIdx = process.argv.indexOf('--dir');
  const dir = dirIdx >= 0 ? process.argv[dirIdx + 1] : 'data/journal-rocks';
  const engineIdx = process.argv.indexOf('--engine');
  const engine = (engineIdx >= 0 ? process.argv[engineIdx + 1] : 'rocksdb') as
    | 'memory'
    | 'file'
    | 'rocksdb';

  const { store, nodechain, keys } = createNodechain({
    engine,
    dir,
    requireRealCrypto: true,
    verifyEveryN: 5,
  });

  const pipe = new TokenizationPipeline(nodechain, keys);
  const processId = `AST-DEMO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString(36)}`;
  const result = await pipe.runPrimaryTokenization({
    processId,
    institutionId: 'DEMO',
    valuation: '1000.000000000',
    holderId: 'holder-demo',
  });

  console.log(
    JSON.stringify(
      {
        engine,
        dir,
        ...result,
      },
      null,
      2,
    ),
  );

  if (engine === 'rocksdb' && store && 'close' in store) {
    await (store as RocksDbJournalStore).close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
