#!/usr/bin/env bash
# domain-invariants-guard — cross-cutting rules from P0–P4 answers.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
fail=0
EXCLUDES=(--exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.github)
SCAN=(src docs)

# 1) CANON operational defaults section
for needle in \
  "## XII. Operational defaults" \
  "15 minutes" \
  "70%" \
  "decimal.js" \
  "RocksDB" \
  "release.threshold" \
  "UTC only"
do
  if ! grep -qF "$needle" docs/AST-CORE-CANON.md; then
    echo "::error::domain-invariants-guard: docs/AST-CORE-CANON.md missing default/anchor: $needle"
    fail=1
  fi
done

# 2) Admin mint forever forbidden in product code
if [ -d src ]; then
  hits="$(grep -RInE 'adminMint|godModeMint|forceMint|mintWithoutPoT|mintWithoutVerdict' src \
    --include='*.ts' --include='*.js' 2>/dev/null || true)"
  if [ -n "$hits" ]; then
    echo "::error::domain-invariants-guard: admin/bypass mint paths forbidden"
    echo "$hits"
    fail=1
  fi
fi

# 3) NodeChain "blocks" metaphor forbidden in public API surface (src controllers/routes)
if [ -d src ]; then
  hits="$(grep -RInE '(@(Get|Post|Put|Patch|Delete)\([^\)]*\bblocks?\b)|/blocks?/|interface\s+\w*Block\b' src \
    --include='*.ts' 2>/dev/null || true)"
  if [ -n "$hits" ]; then
    filtered="$(echo "$hits" | grep -viE 'blocklist|block-?size|unblock|blocked|fail closed' || true)"
    if [ -n "$filtered" ]; then
      echo "::error::domain-invariants-guard: forbid block/blocks as NodeChain API metaphor"
      echo "$filtered"
      fail=1
    fi
  fi
fi

# 4) Settlement alias: commission is settlement — forbid parallel settle that skips commission naming in docs claiming dual SoT
# (soft check skipped)

# 5) Compensation after verified must not be implemented as Eye rollback
hits="$(grep -RInE 'compensateAfterVerified|rollbackVerifiedPoT|unverifyPoT' "${SCAN[@]}" "${EXCLUDES[@]}" 2>/dev/null || true)"
if [ -n "$hits" ]; then
  echo "::error::domain-invariants-guard: PoT verified is final — no unverify/compensate-after-verified"
  echo "$hits"
  fail=1
fi

# 6) Third-party custody feature flags
hits="$(grep -RInE 'holdClientFunds|customerCustody|thirdPartyCustody\s*=\s*true' "${SCAN[@]}" "${EXCLUDES[@]}" 2>/dev/null || true)"
if [ -n "$hits" ]; then
  filtered="$(echo "$hits" | grep -viE 'forbidden|must not|false|reject' || true)"
  if [ -n "$filtered" ]; then
    echo "::error::domain-invariants-guard: third-party custody forbidden"
    echo "$filtered"
    fail=1
  fi
fi

# 7) Kill switch must be planned (config key presence in docs or env example)
if ! grep -RInE 'KILL_SWITCH|killSwitch|read-?only mode' docs/AST-CORE-CANON.md docs .env.example 2>/dev/null | head -1 >/dev/null; then
  echo "::error::domain-invariants-guard: kill switch / read-only must be documented (P4)"
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  echo "domain-invariants-guard FAILED"
  exit 1
fi
echo "domain-invariants-guard: OK"
exit 0
