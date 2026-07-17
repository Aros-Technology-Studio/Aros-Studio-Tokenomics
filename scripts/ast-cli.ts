#!/usr/bin/env tsx
/**
 * AST CLI — first tool: NodeChain journal genesis + first record.
 */
import * as path from 'path';
import { FileJournalStore } from '../src/nodechain/file.store';
import { MemoryJournalStore } from '../src/nodechain/memory.store';
import { NodechainService } from '../src/nodechain/nodechain.service';

function usage(): void {
  console.log(`Usage:
  npm run cli -- journal genesis [--dir data/journal]
  npm run cli -- journal first-record [--dir data/journal]
  npm run cli -- journal tip [--dir data/journal]
  npm run cli -- journal verify [--dir data/journal]
  npm run cli -- journal dump [--dir data/journal]
`);
}

function makeService(dir?: string): NodechainService {
  if (dir) {
    return new NodechainService(new FileJournalStore(path.resolve(dir)));
  }
  return new NodechainService(new MemoryJournalStore());
}

function parseDir(args: string[]): string | undefined {
  const i = args.indexOf('--dir');
  if (i >= 0 && args[i + 1]) return args[i + 1];
  return process.env.AST_JOURNAL_DIR;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    usage();
    process.exit(1);
  }

  const [domain, cmd] = args;
  const dir = parseDir(args) ?? 'data/journal';

  if (domain !== 'journal') {
    usage();
    process.exit(1);
  }

  const nc = makeService(dir);

  if (cmd === 'genesis') {
    const r = await nc.ensureGenesis('system');
    console.log(JSON.stringify({ ok: true, action: 'genesis', dir, ...r }, null, 2));
    return;
  }

  if (cmd === 'first-record') {
    const g = await nc.ensureGenesis('system');
    const first = await nc.append({
      clientRecordId: 'first-journal-record',
      recordType: 'system_boot',
      payload: {
        event: 'first_journal_record',
        layer: '01_NodeChain',
        genesisRecordId: g.recordId,
        note: 'First operational append after genesis — journal is live',
        at: new Date().toISOString(),
      },
      writerId: 'system',
      writerRole: 'system',
    });
    const verify = await nc.verifyChain();
    console.log(
      JSON.stringify(
        {
          ok: true,
          action: 'first-record',
          dir,
          genesis: g,
          firstRecord: first,
          chain: verify,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (cmd === 'tip') {
    const tip = await nc.getTip();
    console.log(JSON.stringify({ dir, tip }, null, 2));
    return;
  }

  if (cmd === 'verify') {
    const v = await nc.verifyChain();
    console.log(JSON.stringify({ dir, ...v }, null, 2));
    process.exit(v.ok ? 0 : 2);
  }

  if (cmd === 'dump') {
    const all = await nc.listAll();
    console.log(JSON.stringify({ dir, count: all.length, records: all }, null, 2));
    return;
  }

  usage();
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
