#!/usr/bin/env tsx
/**
 * F6 — smoke Core health + Prometheus metrics (kill-switch gauge present).
 *
 *   npm run monitor:smoke
 *   npm run monitor:smoke -- --base http://127.0.0.1:3000
 */
function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  const base = (
    arg('--base') ??
    process.env.CORE_API_URL ??
    process.env.AST_CORE_URL ??
    'http://127.0.0.1:3000'
  ).replace(/\/$/, '');

  console.log('F6 monitor smoke\n');
  console.log(`  base: ${base}`);

  const healthRes = await fetch(`${base}/health`);
  if (!healthRes.ok) throw new Error(`health HTTP ${healthRes.status}`);
  const health = (await healthRes.json()) as {
    ok?: boolean;
    killSwitch?: boolean;
    chainOk?: boolean | null;
  };
  if (health.ok !== true) throw new Error(`health.ok !== true: ${JSON.stringify(health)}`);
  console.log(
    `PASS  /health ok killSwitch=${health.killSwitch} chainOk=${health.chainOk}`,
  );

  const metricsRes = await fetch(`${base}/metrics`);
  if (!metricsRes.ok) throw new Error(`metrics HTTP ${metricsRes.status}`);
  const text = await metricsRes.text();
  for (const needle of ['ast_up 1', 'ast_kill_switch', 'ast_journal_height', 'ast_chain_ok']) {
    if (!text.includes(needle.split(' ')[0]!)) {
      // allow either "ast_up 1" or just series present
      if (!text.includes(needle) && !text.includes(needle.replace(' 1', ''))) {
        throw new Error(`metrics missing ${needle}`);
      }
    }
  }
  if (!/^ast_up 1$/m.test(text) && !text.includes('ast_up 1')) {
    throw new Error('metrics missing ast_up 1');
  }
  if (!text.includes('ast_kill_switch')) throw new Error('metrics missing ast_kill_switch');
  if (!text.includes('ast_chain_ok')) throw new Error('metrics missing ast_chain_ok');
  console.log('PASS  /metrics has ast_up, ast_kill_switch, ast_chain_ok, ast_journal_height');

  console.log('\nMONITOR SMOKE PASS (F6)');
  console.log('Wire deploy/alerts/prometheus-rules.example.yml into your Prometheus stack.');
}

main().catch((e) => {
  console.error('FAIL:', e instanceof Error ? e.message : e);
  process.exit(1);
});
