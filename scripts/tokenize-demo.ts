#!/usr/bin/env tsx
import * as path from 'path';
import { FileJournalStore } from '../src/nodechain/file.store';
import { NodechainService } from '../src/nodechain/nodechain.service';
import { TokenizationPipeline } from '../src/intake/tokenization.pipeline';

async function main(): Promise<void> {
  const dir = process.argv.includes('--dir')
    ? process.argv[process.argv.indexOf('--dir') + 1]
    : 'data/journal';
  const nc = new NodechainService(new FileJournalStore(path.resolve(dir)));
  const pipe = new TokenizationPipeline(nc);
  const processId = `AST-DEMO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString(36)}`;
  const result = await pipe.runPrimaryTokenization({
    processId,
    institutionId: 'DEMO',
    valuation: '1000.000000000',
    holderId: 'holder-demo',
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
