#!/usr/bin/env bash
# Pack local-only AST data for moving to another Mac (iMac).
# Does NOT replace git push of source code — commit+push AST first.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$HOME/Desktop/AST-local-data-$(date +%Y%m%d).tar.gz}"
cd "$ROOT"
echo "==> Packing gitignored data from $ROOT"
tar -czf "$OUT" \
  --exclude='data/journal-rocks' \
  data/institution-secrets.json \
  data/institution-credentials.txt \
  data/edge-processes.json \
  data/journal-pilot \
  data/journal-home \
  data/journal \
  2>/dev/null || true
# also pack if files missing individually
if [[ ! -f "$OUT" ]] || [[ ! -s "$OUT" ]]; then
  tar -czf "$OUT" data 2>/dev/null || true
fi
ls -lh "$OUT"
echo "Copy this archive to iMac and extract inside Aros-Studio-Tokenomics/"
echo "  tar -xzf $(basename "$OUT") -C /path/to/Aros-Studio-Tokenomics"
