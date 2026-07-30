# D3 — Demo script / checklist owner sign-off

**Date prepared:** 2026-07-30  
**Purpose:** Product-owner sign-off that the **document-first pilot demo** works end-to-end with a real PDF package (fixture or owner file).  
**Depends on:** D1 (`home-up`) · D2 (`demo:pdf-e2e`)  
**Law:** Core Canon · portal is edge only (no mint on portal)

---

## 1. Verdict requested from owner

| Decision | Meaning |
|----------|---------|
| **Approve D3** | Demo path accepted for pilot demos; residual D4+ (QES X.509, OCR, mTLS, domain) stay open |
| **Reject / amend** | List gaps; do not mark D3 Done |

Reply in chat: **`D3 approved`** or list amendments.

---

## 2. What you run (owner alone)

### Start stack (D1)

```bash
cd /Users/ketevanarevadze/Aros-Studio-Tokenomics
npm run home:up
# wait for READY card / .home-run/READY.txt
```

**Login:** use values in READY card. If `data/institution-secrets.json` is loaded, salt is in `data/institution-credentials.txt` (not always `pilot`/`pilot`).

### Document-first e2e (D2)

```bash
# Fixture PDF (repo sample — not a legal instrument)
npm run demo:pdf-e2e

# Or your own signed PDF
npm run demo:pdf-e2e -- \
  --pdf "/path/to/your-signed-valuation.pdf" \
  --amount 500000 \
  --currency USD
```

Expect final line: **`D2 PDF E2E PASS`** and JSON with `processId` starting with `AST-`.

### UI cross-check (same process)

| Link | Check |
|------|--------|
| `http://127.0.0.1:3200/tokenization/{processId}` | Status / certificate |
| `http://127.0.0.1:3200/nodechain?processId=…` | Journal nodes for process |

### Stop

```bash
npm run home:down
```

---

## 3. Acceptance checklist (evidence)

| # | Check | How | Status (agent 2026-07-30) |
|---|--------|-----|---------------------------|
| 1 | Stack starts without chat | `npm run home:up` → READY | ✅ D1 |
| 2 | Real PDF bytes used | fixture `fixtures/demo-package/valuation-sample.pdf` or `--pdf` | ✅ ~1634 B fixture |
| 3 | Login against live edge | script auto-salt from secrets file | ✅ PILOT |
| 4 | Extract + package hash | `documentPackageHash` 64 hex | ✅ |
| 5 | E-sign attestation (v1) | `verify-signature` verified | ✅ |
| 6 | Tokenization start | `processId` `AST-…` | ✅ `AST-PILOT-20260730-fd7f1b6e5c54` |
| 7 | Status / certificate path | poll + certificate `hasVerify` | ✅ status `closed`, cert OK |
| 8 | Portal never mints | script note + Canon | ✅ edge only |
| 9 | Docs for owner | `OWNER-START-D1.md`, `DEMO-PDF-E2E-D2.md`, this file | ✅ |

### Recorded sample (fixture run)

```text
D2 PDF E2E PASS
processId: AST-PILOT-20260730-fd7f1b6e5c54
documentPackageHash: 91c30ce3f61661f08746856aa3c43a136ef95707c04d23df01ac3286965c05a3
status: closed
certificate: hasVerify true
```

---

## 4. Owner manual sign-off block

| Check | Yes / No | Notes |
|-------|----------|--------|
| I ran `npm run home:up` alone | | |
| I ran `npm run demo:pdf-e2e` (fixture or my PDF) | | |
| Final line was `D2 PDF E2E PASS` | | |
| I opened UI status and/or certificate for the processId | | |
| I understand: portal never mints; mint only on Core after PoT | | |
| I understand: v1 e-sign is institutional attestation, not full national QES X.509 (D4) | | |

| Field | Value |
|-------|--------|
| Reviewer (owner) | ________________ |
| Date | ________________ |
| Decision | Approve D3 / Amend |
| Notes | ________________ |

**Repo action after approve:** mark D3 ✅ in `docs/COMPLETION-TRACK.md` and check the MVP finish acceptance line in `docs/portal/MVP-FINISH-TRACK.md`.

---

## 5. Explicit residual (not part of D3)

| ID | Residual | Why not blocking D3 |
|----|----------|---------------------|
| **D4** | X.509 detached crypto path | **Done** pilot crypto; national QTSP residual — `QES-X509-D4.md` |
| **D5** | OCR image-only scans | Text/PDF extract assist only |
| **D6** | mTLS / OIDC institution auth | Shared secret pilot path |
| **D7–D12** | Secrets rotation, domain, showcase packs | Ops / content |

---

## 6. Related docs

| Doc | Role |
|-----|------|
| [`OWNER-START-D1.md`](OWNER-START-D1.md) | Start stack alone |
| [`DEMO-PDF-E2E-D2.md`](DEMO-PDF-E2E-D2.md) | PDF e2e script detail |
| [`portal/MVP-FINISH-TRACK.md`](portal/MVP-FINISH-TRACK.md) | Finish track acceptance |
| [`COMPLETION-TRACK.md`](COMPLETION-TRACK.md) | A–D progress log |

---

## 7. Scripts

| Command | Script |
|---------|--------|
| `npm run home:up` | `scripts/home-up.sh` |
| `npm run demo:pdf-package` | `scripts/generate-demo-pdf.ts` |
| `npm run demo:pdf-e2e` | `scripts/demo-pdf-e2e.ts` |
