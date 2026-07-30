#!/usr/bin/env bash
# E2 — validate production env before cutover compose/k8s.
# Usage:
#   npm run cutover:preflight
#   bash scripts/cutover-preflight.sh --env .env.production
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env.production"
STRICT_HOST=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env) ENV_FILE="$2"; shift 2 ;;
    --require-public-host) STRICT_HOST=1; shift ;;
    -h|--help)
      sed -n '1,8p' "$0"
      exit 0
      ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

fail() { echo "FAIL: $*"; exit 1; }
pass() { echo "PASS  $*"; }

[[ -f "$ENV_FILE" ]] || fail "missing $ENV_FILE — copy .env.production.example or run: npm run cutover:env"

# shellcheck disable=SC1090
set -a
# strip comments / blank for safe source of KEY=VAL lines
# (avoid executing arbitrary shell in values)
while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// }" ]] && continue
  if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
    export "$line" 2>/dev/null || true
  fi
done < "$ENV_FILE"
set +a

echo "E2 cutover preflight — $ENV_FILE"
echo ""

[[ "${NODE_ENV:-}" == "production" ]] || fail "NODE_ENV must be production (got: ${NODE_ENV:-unset})"
pass "NODE_ENV=production"

[[ "${AST_ALLOW_DEMO:-0}" == "0" || "${AST_ALLOW_DEMO:-}" == "false" ]] \
  || fail "AST_ALLOW_DEMO must be 0 in production"
pass "AST_ALLOW_DEMO off"

[[ "${AST_REQUIRE_INSTITUTION_AUTH:-}" == "1" || "${AST_REQUIRE_INSTITUTION_AUTH:-}" == "true" ]] \
  || fail "AST_REQUIRE_INSTITUTION_AUTH must be 1"
pass "AST_REQUIRE_INSTITUTION_AUTH=1"

tok="${AST_INSTITUTION_TOKEN:-}"
[[ -n "$tok" ]] || fail "AST_INSTITUTION_TOKEN empty"
echo "$tok" | grep -Eiq 'change-me|demo-institution|yourbank-token|placeholder' \
  && fail "AST_INSTITUTION_TOKEN looks like a placeholder"
pass "AST_INSTITUTION_TOKEN set (non-placeholder shape)"

secrets_json="${AST_INSTITUTION_SECRETS_JSON:-}"
secrets_file="${AST_INSTITUTION_SECRETS_FILE:-}"
if [[ -z "$secrets_json" && -z "$secrets_file" ]]; then
  # allow file next to repo data if present
  if [[ -f "$ROOT/data/institution-secrets.json" ]]; then
    secrets_file="$ROOT/data/institution-secrets.json"
  fi
fi
if [[ -n "$secrets_file" ]]; then
  [[ -f "$secrets_file" ]] || fail "AST_INSTITUTION_SECRETS_FILE not found: $secrets_file"
  secrets_json="$(cat "$secrets_file")"
fi
[[ -n "$secrets_json" ]] || fail "AST_INSTITUTION_SECRETS_JSON or secrets file required"

echo "$secrets_json" | grep -Eiq 'change-me-long-random|demo-institution-token' \
  && fail "institution secrets still contain demo/placeholder tokens"
echo "$secrets_json" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert isinstance(d,list) and len(d)>0' \
  || fail "AST_INSTITUTION_SECRETS_JSON must be a non-empty JSON array"
pass "institution secrets JSON present and non-demo shape"

if [[ "$STRICT_HOST" == "1" ]]; then
  [[ -n "${AST_PUBLIC_HOST:-}" ]] || fail "AST_PUBLIC_HOST required (--require-public-host)"
  pass "AST_PUBLIC_HOST=${AST_PUBLIC_HOST}"
elif [[ -n "${AST_PUBLIC_HOST:-}" ]]; then
  pass "AST_PUBLIC_HOST=${AST_PUBLIC_HOST} (optional set)"
else
  echo "WARN  AST_PUBLIC_HOST unset (ok for private LAN; set for public cutover)"
fi

if [[ -n "${DATABASE_URL:-}" ]]; then
  pass "DATABASE_URL set (index mirror optional)"
else
  echo "INFO  DATABASE_URL unset — memory/file index only (SoT still journal)"
fi

if [[ -n "${REDIS_URL:-}" ]]; then
  pass "REDIS_URL set (session dual-write)"
fi

echo ""
echo "E2 PREFLIGHT PASS"
echo "Next: docker compose -f docker-compose.prod.yml --env-file $ENV_FILE up --build -d"
echo "  or: kubectl path — docs/cutover/E4-OBSERVE-K8S.md"
exit 0
