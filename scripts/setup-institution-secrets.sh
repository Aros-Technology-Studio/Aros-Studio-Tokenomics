#!/usr/bin/env bash
# Create real (non-DEMO) institution credentials for portal edge.
# Writes gitignored file under data/ — never commit tokens.
#
# Usage:
#   bash scripts/setup-institution-secrets.sh
#   bash scripts/setup-institution-secrets.sh --id NAPR --name "Public Registry Pilot"
#   bash scripts/setup-institution-secrets.sh --with-demo   # also keep DEMO for local tests
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${AST_SECRETS_DIR:-$ROOT/data}"
OUT_FILE="${AST_INSTITUTION_SECRETS_FILE:-$OUT_DIR/institution-secrets.json}"
CREDS_FILE="$OUT_DIR/institution-credentials.txt"

INST_ID="PILOT"
DISPLAY="Pilot Institution"
WITH_DEMO=0
# Default quick salt for pilot happiness (override with --salt)
SALT="pilot"
RANDOM_SALT=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --id) INST_ID="$2"; shift 2 ;;
    --name) DISPLAY="$2"; shift 2 ;;
    --salt) SALT="$2"; shift 2 ;;
    --random-salt) RANDOM_SALT=1; shift ;;
    --with-demo) WITH_DEMO=1; shift ;;
    --out) OUT_FILE="$2"; shift 2 ;;
    -h|--help)
      sed -n '1,15p' "$0"
      exit 0
      ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

INST_ID="$(echo "$INST_ID" | tr '[:lower:]' '[:upper:]' | tr -cd 'A-Z0-9')"
if [[ -z "$INST_ID" ]]; then
  echo "institution id empty after normalize"
  exit 1
fi

if [[ "$RANDOM_SALT" == "1" ]]; then
  SALT="$(openssl rand -hex 24)"
fi
TOKEN="$SALT"
mkdir -p "$(dirname "$OUT_FILE")"

if [[ "$WITH_DEMO" == "1" ]]; then
  python3 - <<PY
import json
path = r"""$OUT_FILE"""
data = [
  {
    "institutionId": "$INST_ID",
    "displayName": """$DISPLAY""",
    "token": """$TOKEN""",
    "allowlisted": True,
  },
  {
    "institutionId": "DEMO",
    "displayName": "Demo Institution",
    "token": "demo-institution-token",
    "allowlisted": True,
  },
]
with open(path, "w", encoding="utf-8") as f:
  json.dump(data, f, indent=2)
  f.write("\n")
print(path)
PY
else
  python3 - <<PY
import json
path = r"""$OUT_FILE"""
data = [
  {
    "institutionId": "$INST_ID",
    "displayName": """$DISPLAY""",
    "token": """$TOKEN""",
    "allowlisted": True,
  },
]
with open(path, "w", encoding="utf-8") as f:
  json.dump(data, f, indent=2)
  f.write("\n")
print(path)
PY
fi

chmod 600 "$OUT_FILE" 2>/dev/null || true

{
  echo "# Generated $(date -u +%Y-%m-%dT%H:%M:%SZ) — DO NOT COMMIT"
  echo "Login:  $(echo "$INST_ID" | tr '[:upper:]' '[:lower:]')"
  echo "Salt:   $TOKEN"
  echo "Display: $DISPLAY"
  echo ""
  echo "File: $OUT_FILE"
  echo ""
  echo "Browser: Login = pilot · Salt = pilot (when defaults)"
  echo "Start: bash scripts/home-up.sh"
  echo "URL:   http://127.0.0.1:3200/login"
} | tee "$CREDS_FILE"
chmod 600 "$CREDS_FILE" 2>/dev/null || true

echo ""
echo "Credentials also written to: $CREDS_FILE (gitignored under data/)"
