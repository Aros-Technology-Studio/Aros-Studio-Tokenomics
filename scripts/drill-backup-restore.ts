#!/usr/bin/env tsx
/**
 * F5 — offline kill-switch + backup/restore drill (temp dirs).
 * Not a substitute for quarterly production volume drill.
 */
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createHash } from 'crypto';
import { createNodechainAsync } from '../src/nodechain/journal.factory';
import { globalKillSwitch } from '../src/hardening/kill-switch';

async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const from = path.join(src, e.name);
    const to = path.join(dest, e.name);
    if (e.isDirectory()) await copyDir(from, to);
    else await fs.copyFile(from, to);
  }
}

async function sha256File(p: string): Promise<string> {
  const b = await fs.readFile(p);
  return createHash('sha256').update(b).digest('hex');
}

async function main(): Promise<void> {
  console.log('F5 drill — backup / kill-switch / restore\n');
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ast-drill-'));
  const live = path.join(root, 'live');
  const backup = path.join(root, 'backup');
  const restored = path.join(root, 'restored');
  await fs.mkdir(live, { recursive: true });

  globalKillSwitch.release();

  const { nodechain: nc, store } = await createNodechainAsync({
    engine: 'file',
    dir: live,
  });
  await nc.ensureGenesis();
  await nc.append({
    recordType: 'process_open',
    processId: 'AST-DRILL-F5-000000000001',
    writerId: 'system',
    writerRole: 'system',
    payload: { drill: true },
  });
  let v = await nc.verifyChain();
  if (!v.ok) throw new Error(`chain fail after append: ${v.error}`);
  const tip1 = await nc.getTip();
  console.log(`PASS  live journal tip height=${tip1?.height}`);

  await copyDir(live, backup);
  const jLive = path.join(live, 'journal.jsonl');
  const jBak = path.join(backup, 'journal.jsonl');
  if ((await sha256File(jLive)) !== (await sha256File(jBak))) {
    throw new Error('backup checksum mismatch');
  }
  console.log('PASS  backup copy checksum match');

  globalKillSwitch.engage('F5 drill');
  try {
    globalKillSwitch.assertWritable();
    throw new Error('kill-switch should block');
  } catch (e) {
    if (!(e instanceof Error) || !e.message.includes('KILL_SWITCH')) throw e;
  }
  console.log('PASS  kill-switch engage blocks assertWritable');
  globalKillSwitch.release();
  console.log('PASS  kill-switch release');

  await copyDir(backup, restored);
  const { nodechain: nc2 } = await createNodechainAsync({
    engine: 'file',
    dir: restored,
  });
  v = await nc2.verifyChain();
  if (!v.ok) throw new Error(`chain fail after restore: ${v.error}`);
  const tip2 = await nc2.getTip();
  if (tip2?.height !== tip1?.height || tip2?.tipHash !== tip1?.tipHash) {
    throw new Error(
      `restored tip mismatch live=${JSON.stringify(tip1)} restored=${JSON.stringify(tip2)}`,
    );
  }
  console.log(`PASS  restore verify height=${tip2?.height} tip match`);

  if (store && 'close' in store && typeof (store as { close?: () => Promise<void> }).close === 'function') {
    await (store as { close: () => Promise<void> }).close();
  }

  await fs.rm(root, { recursive: true, force: true });
  console.log('\nDRILL PASS (F5 offline)');
  console.log('Owner: still run quarterly production volume drill — docs/hardening/DRILL-F5.md');
}

main().catch((e) => {
  console.error(e);
  globalKillSwitch.release();
  process.exit(1);
});
