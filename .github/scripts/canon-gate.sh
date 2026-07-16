#!/usr/bin/env bash
# Optional grep firewall for legacy / banned terms in repo content.
#   1. Firewall terms — AFC / ALB / LacMusa / Fiat Anchor / Crypto Anchor / ...
#   2. Vocabulary — reward / incentive / stimulus
set -uo pipefail

EXCLUDES=(
  --exclude-dir=.git
  --exclude-dir=.github
  --exclude-dir=node_modules
  --exclude-dir=migration
  --exclude=package-lock.json
  --exclude=yarn.lock
  --exclude=pnpm-lock.yaml
  '--exclude=*.lock'
  # Questionnaire may cite historical external URLs; guards live under .github
  --exclude=COMPONENT_CLARIFICATIONS.md
  --exclude=MIGRATION_GATE.md
)

# Case-sensitive: "ALB" matches only the literal epoch acronym, never words like "totalBurned".
FIREWALL='AFC|Aros Financial Core|LacMusa|Fiat Anchor|Crypto Anchor|Aros Logic Bridge|Illumination Banking|\bALB\b'
VOCAB='reward|incentive|stimulus'

fail=0

fw="$(grep -RInE "$FIREWALL" . "${EXCLUDES[@]}" 2>/dev/null || true)"
if [ -n "$fw" ]; then
  echo "::error::Firewall breach — the AST canon forbids AFC / ALB / LacMusa / Anchor references. The reserve is AST's own."
  echo "$fw"
  fail=1
else
  echo "Firewall gate: clean (no AFC / ALB / LacMusa / Anchor)."
fi

vb="$(grep -RIniE "$VOCAB" . "${EXCLUDES[@]}" 2>/dev/null || true)"
if [ -n "$vb" ]; then
  echo "::error::Forbidden vocabulary — AST has only payment for confirmed work; no reward / incentive / stimulus."
  echo "$vb"
  fail=1
else
  echo "Vocabulary gate: clean (no reward / incentive / stimulus)."
fi

if [ "$fail" -ne 0 ]; then
  echo ""
  echo "Canon gate FAILED. See CANON.md (AST Core Canon — hard prohibitions §X, invariants I1–I9)."
fi
exit "$fail"
