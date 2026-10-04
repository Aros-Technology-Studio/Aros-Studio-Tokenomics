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
  --exclude-dir=dist
  --exclude-dir=coverage
  --exclude-dir=sessions
  --exclude-dir=.grok
  --exclude=package-lock.json
  --exclude=yarn.lock
  --exclude=pnpm-lock.yaml
  '--exclude=*.lock'
  '--exclude=*.map'
  # Questionnaire may cite historical external URLs; guards live under .github
  --exclude=COMPONENT_CLARIFICATIONS.md
  --exclude=MIGRATION_GATE.md
  --exclude=AST-CORE-CANON.md
  --exclude=rules.md
  --exclude=AST_RULES.yaml
  --exclude-dir=rules
)

# Case-sensitive: "ALB" matches only the literal epoch acronym, never words like "totalBurned".
# AFC ("Aros Financial Core") is cleared per product-owner ruling 2026-09-22
# (see docs/AST-CORE-CANON.md §XIV): AFC is the process of executing the Aros
# API Contract (AST <-> Anchors) — not a custodial entity, not a claim on
# AST's reserve. It is intentionally NOT in this firewall. The remaining
# terms (ALB / LacMusa / Fiat|Crypto Anchor / Aros Logic Bridge / Illumination
# Banking) are still forbidden — they name the rejected custodial/bridge
# concepts, unaffected by this ruling.
FIREWALL='LacMusa|Fiat Anchor|Crypto Anchor|Aros Logic Bridge|Illumination Banking|\bALB\b'
VOCAB='reward|incentive|stimulus'

fail=0

fw="$(grep -RInE "$FIREWALL" . "${EXCLUDES[@]}" 2>/dev/null || true)"
if [ -n "$fw" ]; then
  echo "::error::Firewall breach — the AST canon forbids ALB / LacMusa / Anchor / bridge references. The reserve is AST's own."
  echo "$fw"
  fail=1
else
  echo "Firewall gate: clean (no ALB / LacMusa / Anchor / bridge)."
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
