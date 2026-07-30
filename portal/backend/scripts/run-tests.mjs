#!/usr/bin/env node
// Portable portal-edge test runner (Node >= 20).
// Walks src/ for files ending in .spec.ts (no shell globs — quoted globs break node:test).
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const srcDir = join(root, 'src');

function collectSpecs(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) collectSpecs(p, out);
    else if (name.endsWith('.spec.ts')) out.push(p);
  }
  return out;
}

const files = collectSpecs(srcDir).sort();
if (files.length === 0) {
  console.error('portal-backend tests: no *.spec.ts under src/');
  process.exit(1);
}

console.error(
  `portal-backend tests: ${files.length} file(s): ${files
    .map((f) => relative(root, f))
    .join(', ')}`,
);

const result = spawnSync(
  process.execPath,
  ['--import', 'tsx', '--test', ...files],
  {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      // Demo institutions allowed in unit tests unless caller overrides
      AST_ALLOW_DEMO: process.env.AST_ALLOW_DEMO ?? '1',
      NODE_ENV: process.env.NODE_ENV ?? 'test',
    },
  },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status === null ? 1 : result.status);
