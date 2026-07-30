#!/usr/bin/env tsx
import { createNodechainAsync } from '../src/nodechain/journal.factory';
import type { RocksDbJournalStore } from '../src/nodechain/rocksdb.store';
import { MemoryIndexMirror } from '../src/index-mirror/index-mirror';
import { PostgresIndexMirror } from '../src/index-mirror/postgres-index-mirror';
import type { IndexMirror } from '../src/index-mirror/index-mirror';

function usage(): void {
  console.log(`Usage:
  npm run cli -- journal genesis [--dir data/journal] [--engine file|rocksdb|memory]
  npm run cli -- journal first-record [--dir data/journal] [--engine rocksdb]
  npm run cli -- journal status [--dir data/journal] [--engine rocksdb]
  npm run cli -- journal tip [--dir data/journal] [--engine rocksdb]
  npm run cli -- journal verify [--dir data/journal] [--engine rocksdb]
  npm run cli -- journal dump [--dir data/journal] [--engine rocksdb]
  npm run cli -- mirror status [--dir data/journal] [--engine file]
  npm run cli -- mirror replay [--dir data/journal] [--engine file]
  npm run cli -- mirror process <processId> [--dir data/journal] [--engine file]
`);
}

function parseDir(args: string[]): string | undefined {
  const i = args.indexOf('--dir');
  if (i >= 0 && args[i + 1]) return args[i + 1];
  return process.env.AST_JOURNAL_DIR;
}

function parseEngine(args: string[]): 'memory' | 'file' | 'rocksdb' {
  const i = args.indexOf('--engine');
  if (i >= 0 && args[i + 1]) return args[i + 1] as 'memory' | 'file' | 'rocksdb';
  return (process.env.AST_JOURNAL_ENGINE as 'memory' | 'file' | 'rocksdb') || 'file';
}

function createMirror(): IndexMirror {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return new PostgresIndexMirror(url);
  return new MemoryIndexMirror();
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    usage();
    process.exit(1);
  }

  const [domain, cmd, maybeId] = args;
  const dir = parseDir(args) ?? 'data/journal';
  const engine = parseEngine(args);

  if (domain === 'mirror') {
    const mirror = createMirror();
    const { store, nodechain: nc } = await createNodechainAsync({ engine, dir });
    const close = async () => {
      if (engine === 'rocksdb' && store && 'close' in store) {
        await (store as RocksDbJournalStore).close();
      }
      if (mirror.close) await mirror.close();
    };
    try {
      if (cmd === 'status') {
        const status = mirror.getStatus
          ? await mirror.getStatus(nc)
          : { kind: mirror.kind, role: 'index_mirror_not_sot', ready: true };
        console.log(
          JSON.stringify(
            {
              ok: true,
              action: 'mirror-status',
              sot: 'nodechain',
              databaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
              ...status,
            },
            null,
            2,
          ),
        );
        return;
      }
      if (cmd === 'replay') {
        const result = await mirror.replayFrom(nc);
        const status = mirror.getStatus ? await mirror.getStatus(nc) : null;
        console.log(
          JSON.stringify(
            { ok: true, action: 'mirror-replay', ...result, status, sot: 'nodechain' },
            null,
            2,
          ),
        );
        return;
      }
      if (cmd === 'process' && maybeId) {
        const rows = await mirror.getByProcessId(maybeId);
        console.log(
          JSON.stringify(
            {
              ok: true,
              action: 'mirror-process',
              processId: maybeId,
              count: rows.length,
              records: rows,
              source: 'index_mirror',
              sot: 'nodechain',
            },
            null,
            2,
          ),
        );
        return;
      }
      usage();
      process.exitCode = 1;
    } finally {
      await close();
    }
    return;
  }

  if (domain !== 'journal') {
    usage();
    process.exit(1);
  }

  const { store, nodechain: nc } = await createNodechainAsync({
    engine,
    dir,
  });

  const close = async () => {
    if (engine === 'rocksdb' && store && 'close' in store) {
      await (store as RocksDbJournalStore).close();
    }
  };

  try {
    if (cmd === 'genesis') {
      const r = await nc.ensureGenesis('system');
      console.log(JSON.stringify({ ok: true, action: 'genesis', dir, engine, ...r }, null, 2));
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
            engine,
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

    if (cmd === 'status') {
      const status = await nc.getStatus();
      console.log(JSON.stringify({ ok: true, action: 'status', dir, engine, ...status }, null, 2));
      process.exitCode = status.chain.ok ? 0 : 2;
      return;
    }

    if (cmd === 'tip') {
      console.log(JSON.stringify({ dir, engine, tip: await nc.getTip() }, null, 2));
      return;
    }

    if (cmd === 'verify') {
      const v = await nc.verifyChain();
      console.log(JSON.stringify({ dir, engine, ...v }, null, 2));
      process.exitCode = v.ok ? 0 : 2;
      return;
    }

    if (cmd === 'dump') {
      const all = await nc.listAll();
      console.log(JSON.stringify({ dir, engine, count: all.length, records: all }, null, 2));
      return;
    }

    usage();
    process.exitCode = 1;
  } finally {
    await close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
