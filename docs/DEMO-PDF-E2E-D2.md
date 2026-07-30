# D2 — Real PDF package end-to-end

**Goal:** Run document-first path with a **real PDF file** (fixture or owner file) against a live home stack.  
**Portal never mints** — Core mints only after PoT when hand-off is live.

---

## Prerequisites

```bash
cd /Users/ketevanarevadze/Aros-Studio-Tokenomics
npm run home:up
# wait for READY card
```

---

## Default demo (repo fixture PDF)

```bash
npm run demo:pdf-e2e
```

What it does:

1. Generates `fixtures/demo-package/valuation-sample.pdf` (valuation text 250000 USD)  
2. `POST /v1/auth/login` — institution from `--login` (default `pilot`); salt auto-resolved from  
   `--salt` → `AST_PILOT_SALT` → `data/institution-secrets.json` → `pilot`  
3. `POST /v1/documents/extract` — assist hints  
4. `POST /v1/documents/hash` — SHA-256 package hash  
5. `POST /v1/documents/verify-signature` — institutional attestation (v1)  
6. `POST /v1/tokenization/start`  
7. Polls process status  
8. Tries certificate download  

Expect: **`D2 PDF E2E PASS`** and a JSON summary with `processId` + UI links.

---

## Your own signed PDF

```bash
npm run demo:pdf-e2e -- \
  --pdf "/path/to/your-signed-valuation.pdf" \
  --amount 500000 \
  --currency USD \
  --login pilot \
  --salt pilot
```

Optional: `--base http://127.0.0.1:3100` · `--holder holder-id`

---

## UI cross-check

After the script prints `processId`:

| Link | Purpose |
|------|---------|
| `/tokenization/{processId}` | Status + certificate |
| `/nodechain?processId=…` | Journal nodes for process |

---

## Acceptance (D2)

| Check | Evidence |
|-------|----------|
| Real PDF bytes (not empty form) | fixture or owner path |
| Hash + e-sign attestation | script PASS lines |
| Tokenization start | `AST-…` processId |
| Status / certificate path | poll + optional cert |
| Documented for owner | this file |

**Not D2:** full national QES X.509 (D4), OCR image-only (D5).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| edge not healthy | `npm run home:up` |
| login fail | Secrets file replaces demo accounts. Use salt from `data/institution-credentials.txt`, or `--salt …`, or re-run `setup-institution-secrets.sh` with salt `pilot` / `--with-demo` |
| start 422 | hash + hasQualifiedSignature true |

**Next:** owner demo script sign-off → [`DEMO-SIGN-OFF-D3.md`](DEMO-SIGN-OFF-D3.md).
