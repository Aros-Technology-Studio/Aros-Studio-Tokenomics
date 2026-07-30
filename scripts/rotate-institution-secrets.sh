#!/usr/bin/env bash
# D7 — rotate institution shared token(s) in data/institution-secrets.json
# Old tokens stop working after edge restart. Never commit the file.
#
# Usage:
#   bash scripts/rotate-institution-secrets.sh
#   bash scripts/rotate-institution-secrets.sh --id PILOT
#   bash scripts/rotate-institution-secrets.sh --id PILOT --salt 'explicit-new-token'
#   bash scripts/rotate-institution-secrets.sh --all
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_FILE="${AST_INSTITUTION_SECRETS_FILE:-$ROOT/data/institution-secrets.json}"
CREDS_FILE="$ROOT/data/institution-credentials.txt"
ID=""
SALT=""
ALL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --id) ID="$2"; shift 2 ;;
    --salt) SALT="$2"; shift 2 ;;
    --all) ALL=1; shift ;;
    --out) OUT_FILE="$2"; shift 2 ;;
    -h|--help)
      sed -n '1,12p' "$0"
      exit 0
      ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ ! -f "$OUT_FILE" ]]; then
  echo "No secrets file at $OUT_FILE — run setup-institution-secrets.sh first"
  exit 1
fi

# Archive previous
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
ARCHIVE="$ROOT/data/institution-secrets.rotated-$STAMP.json"
cp "$OUT_FILE" "$ARCHIVE"
chmod 600 "$ARCHIVE" 2>/dev/null || true
echo "==> Archived previous secrets → $ARCHIVE"

python3 - <<PY
import json, secrets, sys
path = r"""$OUT_FILE"""
target = r"""$ID""".strip().upper()
explicit = r"""$SALT"""
rotate_all = """$ALL""" == "1"
with open(path, encoding="utf-8") as f:
    data = json.load(f)
if not isinstance(data, list) or not data:
    print("invalid secrets JSON", file=sys.stderr)
    sys.exit(1)
changed = []
for row in data:
    iid = str(row.get("institutionId", "")).upper()
    if rotate_all or (target and iid == target) or (not target and not rotate_all and len(data) == 1):
        new_tok = explicit if explicit else secrets.token_urlsafe(24)
        row["token"] = new_tok
        row["institutionId"] = iid
        changed.append((iid, new_tok, row.get("displayName", iid)))
if not changed:
    if target:
        print(f"institution {target} not found", file=sys.stderr)
        sys.exit(1)
    # default: rotate first
    row = data[0]
    iid = str(row.get("institutionId", "")).upper()
    new_tok = explicit if explicit else secrets.token_urlsafe(24)
    row["token"] = new_tok
    row["institutionId"] = iid
    changed.append((iid, new_tok, row.get("displayName", iid)))
with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
print(path)
for iid, tok, name in changed:
    print(f"ROTATED {iid} ({name})")
    print(f"  Login: {iid.lower()}")
    print(f"  Salt:  {tok}")
PY

chmod 600 "$OUT_FILE" 2>/dev/null || true

{
  echo "# Rotated $STAMP — DO NOT COMMIT"
  echo "File: $OUT_FILE"
  echo "Archive: $ARCHIVE"
  echo "Restart edge after rotation: npm run home:down && npm run home:up"
} | tee "$CREDS_FILE" >/dev/null

# Re-append login lines from python is hard; re-read JSON for credentials card
python3 - <<PY
import json
path = r"""$OUT_FILE"""
creds = r"""$CREDS_FILE"""
with open(path, encoding="utf-8") as f:
    data = json.load(f)
lines = ["# Rotated secrets — DO NOT COMMIT", f"File: {path}", ""]
for row in data:
    iid = str(row.get("institutionId","")).upper()
    lines.append(f"Login:  {iid.lower()}")
    lines.append(f"Salt:   {row.get('token','')}")
    lines.append(f"Display: {row.get('displayName', iid)}")
    lines.append("")
lines.append("Restart: npm run home:down && npm run home:up")
with open(creds, "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")
print("Credentials:", creds)
PY
chmod 600 "$CREDS_FILE" 2>/dev/null || true

echo ""
echo "D7 rotation complete. Restart portal edge to load new tokens."
echo "  npm run home:down && npm run home:up"
