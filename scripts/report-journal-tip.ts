#!/usr/bin/env tsx
/**
 * E3 — Attest NodeChain journal tip to ArosCoinView (representation only).
 *
 * Usage:
 *   npm run contracts:report-tip
 *   npm run contracts:report-tip -- --dry-run
 *   npm run contracts:report-tip -- --height 3 --tip 0x…64hex
 *
 * Env: RPC_URL, REPORTER_PK, ARO_VIEW|AST_ARO_VIEW_CONTRACT, CORE_API_URL
 */
import { spawnSync } from 'child_process';

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function has(flag: string): boolean {
  return process.argv.includes(flag);
}

function normalizeTip(hex: string): string {
  let h = hex.trim().toLowerCase();
  if (h.startsWith('0x')) h = h.slice(2);
  if (!/^[a-f0-9]{64}$/.test(h)) {
    throw new Error(`tip must be 32-byte hex (64 chars), got length ${h.length}`);
  }
  return '0x' + h;
}

async function fetchTipFromCore(base: string): Promise<{ height: number; tipHash: string }> {
  const root = base.replace(/\/$/, '');
  const urls = [
    `${root}/v1/core/nodechain/status`,
    `${root}/v1/core/nodechain/tip`,
  ];
  let lastErr = '';
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        lastErr = `${url} → ${res.status}`;
        continue;
      }
      const j = (await res.json()) as {
        tip?: { height?: number; tipHash?: string; envelopeHash?: string };
        height?: number;
        tipHash?: string;
        envelopeHash?: string;
      };
      const tip = j.tip ?? j;
      const height = tip.height ?? j.height;
      const tipHash = tip.tipHash ?? tip.envelopeHash ?? j.tipHash ?? j.envelopeHash;
      if (height != null && tipHash) {
        return { height: Number(height), tipHash: String(tipHash) };
      }
      lastErr = `missing tip fields in ${url}`;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(`Core tip unavailable (${lastErr})`);
}

function main(): void {
  void (async () => {
    const dry = has('--dry-run');
    const rpc = arg('--rpc-url') ?? process.env.RPC_URL ?? '';
    const pk = arg('--private-key') ?? process.env.REPORTER_PK ?? process.env.PRIVATE_KEY ?? '';
    const view =
      arg('--view') ??
      process.env.ARO_VIEW ??
      process.env.AST_ARO_VIEW_CONTRACT ??
      '';
    const core = arg('--core') ?? process.env.CORE_API_URL ?? 'http://127.0.0.1:3000';

    let height: number;
    let tipHash: string;
    if (arg('--height') && arg('--tip')) {
      height = Number(arg('--height'));
      tipHash = normalizeTip(arg('--tip')!);
    } else {
      console.log(`Fetching tip from ${core} …`);
      const t = await fetchTipFromCore(core);
      height = t.height;
      tipHash = normalizeTip(t.tipHash);
    }

    if (!Number.isFinite(height) || height < 0) {
      throw new Error(`invalid height ${height}`);
    }

    console.log('E3 report-journal-tip');
    console.log(`  height: ${height}`);
    console.log(`  tip:    ${tipHash}`);
    console.log(`  view:   ${view || '(unset)'}`);
    console.log(`  rpc:    ${rpc || '(unset)'}`);

    if (dry) {
      console.log('DRY-RUN — no transaction');
      console.log(
        `cast send ${view} "attestJournalTip(uint256,bytes32)" ${height} ${tipHash} --rpc-url $RPC_URL --private-key $REPORTER_PK`,
      );
      process.exit(0);
    }

    if (!rpc || !pk || !view) {
      throw new Error('RPC_URL, REPORTER_PK, and ARO_VIEW (or AST_ARO_VIEW_CONTRACT) required (or --dry-run)');
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(view)) {
      throw new Error(`ARO_VIEW must be 0x address, got ${view}`);
    }

    const cast = spawnSync(
      'cast',
      [
        'send',
        view,
        'attestJournalTip(uint256,bytes32)',
        String(height),
        tipHash,
        '--rpc-url',
        rpc,
        '--private-key',
        pk,
      ],
      { encoding: 'utf8' },
    );
    if (cast.status !== 0) {
      console.error(cast.stdout || '');
      console.error(cast.stderr || '');
      throw new Error(`cast send failed (exit ${cast.status})`);
    }
    console.log(cast.stdout);
    console.log('E3 ATTEST PASS');
    process.exit(0);
  })().catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
}

main();
