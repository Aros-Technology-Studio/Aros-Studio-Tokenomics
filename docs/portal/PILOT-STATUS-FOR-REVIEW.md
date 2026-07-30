# AST Pilot Status — for external review

**Product:** Aros Studio Tokenomics (AST)  
**Document type:** Operator readiness brief (not a legal certificate)  
**Date:** 2026-07-30  
**Audience:** Partner, institution, auditor, product owner who needs a **yes/no** view of readiness  

This is a **truthful** checklist: what works end-to-end today, what is intentionally out of scope, and what is blocked by infrastructure (not by missing product code).

---

## 1. One-line status

| Layer | Verdict |
|-------|---------|
| **Core product path** (document → PoT → journal → mint path) | **Ready for pilot demo** |
| **Institutional portal edge** (login, wizard, status, certificate) | **Ready for pilot demo** |
| **Public transparency** (explorer + **Nodes list** UI) | **Ready for pilot demo** |
| **Engineering completion track** (A–G packages) | **Done in repo** — see `docs/COMPLETION-TRACK.md` |
| **Permanent production domain** (named host from home) | **Owner cutover residual** — CGNAT / white IP / tunnel · `docs/cutover/` · D8 |
| **Full QES / national QTSP / live audit / real KMS** | **Owner residual** (packages exist; engagement open) |

---

## 2. How a third party can verify (hands-on)

### A. Open the live edge

```bash
cd /path/to/Aros-Studio-Tokenomics
npm run home:up
# READY card: .home-run/READY.txt
# optional temporary public URL:
bash scripts/home-tunnel.sh
cat .home-run/public-url.txt
```

**Local:** `http://127.0.0.1:3200`  
**Login:** see READY card — if `data/institution-secrets.json` is loaded, salt is **not** always `pilot`/`pilot` (see `data/institution-credentials.txt`).

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open home page | AST branding, EN/RU/KA language switch |
| 2 | `/system` | Can / cannot boundaries |
| 3 | `/explore` | Public process lookup form (no login) |
| 4 | `/nodechain` | **Nodes list** (not “blocks”), verify chain, process filter, EN/RU/KA |
| 5 | `/login` | Institution login (pilot or secrets file) |
| 6 | Cabinet → Tokenization | Document-first wizard |
| 7 | Complete process | Status progress, certificate print + QR |
| 8 | NodeChain `?processId=` | Related journal **nodes** for process |

**Vocabulary (A8 / B5):** product API and UI say **nodes** / **Nodes list** for chain units.  
`GET /v1/core/nodechain/nodes` and public `GET /v1/public/nodechain/nodes` — **not** `/blocks`.  
Network registry is separate: `GET /v1/core/nodes`. See `docs/layers/01_NodeChain/VOCABULARY.md`.

**Hard rules:** portal **never mints** ARO; mint only after Core PoT.

### B. Health probes (technical)

```bash
curl -s http://127.0.0.1:3100/v1/health
curl -s http://127.0.0.1:3100/v1/health/ready
curl -s http://127.0.0.1:3100/v1/public/nodechain/status
curl -s http://127.0.0.1:3100/v1/public/nodechain/nodes?limit=5
curl -s http://127.0.0.1:3000/v1/core/nodechain/status
curl -s http://127.0.0.1:3000/metrics | head
```

Expect: edge `status: ok`, NodeChain `chain.ok: true`, genesis present, tip height ≥ 0, nodes feed tip-first.

### C. Demo scripts (optional)

```bash
npm run demo:pdf-e2e          # D2 document-first path
npm run demo:x509-e2e         # D4 X.509 detached (needs trust fixtures)
npm run smoke:operator        # C5 core path
npm run drill:backup-restore  # F5 offline drill
```

### D. Canon / decisions (paper)

| File | Role |
|------|------|
| `docs/AST-CORE-CANON.md` | Sole law |
| `docs/P0-P4-TECHNICAL-DECISIONS.md` | Ratified technical choices |
| `docs/COMPLETION-TRACK.md` | A–G engineering track |
| `docs/portal/ARCHITECTURE.md` | Edge vs Core boundary |
| `docs/layers/01_NodeChain/VOCABULARY.md` | Nodes vs blocks · list vs registry |
| This file | External review snapshot |

---

## 3. Ready (shipped for pilot demo)

| Capability | Evidence |
|------------|----------|
| NodeChain append-only journal (SoT) | Core + `/nodechain` UI + public status API |
| **Nodes list** (chain units) | UI + `…/nodechain/nodes` · no product “blocks” API |
| PoT-gated economic path | Core orchestrator; no free mint on portal |
| Institution login (session) | Secrets file and/or demo when allowed |
| Document-first digitization wizard | Upload → e-sign → fields → start |
| X.509 detached + OCR assist paths | D4 / D5 packages |
| Core hand-off from edge | Fail-closed if Core down |
| Digitization certificate (print/PDF) | QR verify URL, AST brand only |
| Public process explorer | `/explore` without credentials |
| Multi-language UI (EN / RU / KA) | Header language switch |
| Home runbooks | `npm run home:up` / `home:down` · D1 |

---

## 4. Not ready / limited (honest)

| Item | Status | Why it matters |
|------|--------|----------------|
| **Permanent domain on home broadband** | Owner residual | Often CGNAT; use tunnel (D8) or VPS white IP |
| Temporary public URL | Works while Mac + tunnel run | URL may change each start |
| Full national QES / QTSP profiles | Residual | Detached X.509 path is pilot crypto |
| Production mTLS / OIDC at IdP scale | Residual | Hooks exist (D6); full IdP open |
| Multi-region replication mesh | Residual | Catch-up exists (F3 later) |
| External security audit engagement | Residual | Prep package F1; firm not engaged |
| Real cloud KMS / PKCS#11 | Residual | Soft-HSM ships (F2) |
| Outer product shell | Out of scope for this pilot | AST is the economic tool · **H1** later/separate |
| Public market listing ARO | Out | **H2** |
| Multi-node BFT mainnet | Later | **H3** (not pilot) |
| Eye veto / executive | Forbidden | **H4** Canon |

---

## 5. Credentials

| Situation | Login | Salt |
|-----------|-------|------|
| No secrets file · demo allowed | `pilot` | `pilot` |
| `data/institution-secrets.json` present | see READY / credentials file | **not** always `pilot` |

Real tenants: `docs/portal/INSTITUTION-SECRETS.md` · never commit tokens.

---

## 6. Architecture in one diagram

```
Reviewer browser
      │
      ├─ temporary: https://*.trycloudflare.com  (home-tunnel)
      └─ local:     http://127.0.0.1:3200
              │
              ▼
     Portal UI (Next)  ──/v1──►  Portal Edge (Nest :3100)
                                      │
                                      ▼
                               Core (Nest :3000)
                                      │
                                      ▼
                               NodeChain journal (SoT)
                                      │
                         PoT pass ──► economic mint path
```

Portal = **edge only**. Core = economic authority. NodeChain = source of truth.  
Explorer: **Nodes list** = chain units · **Network nodes** = registry (`/v1/core/nodes`).

---

## 7. iMac / second Mac path

Source of truth for **code** is git (`origin/main`). Local secrets and journals are **not** in git.

```bash
# On source Mac — after git push of code
bash scripts/export-for-imac.sh
# → ~/Desktop/AST-local-data-YYYYMMDD.tar.gz

# On iMac
git clone <repo>   # or git pull
cd Aros-Studio-Tokenomics
tar -xzf AST-local-data-….tar.gz -C .
npm run home:up
```

Do **not** rely on chat-only copies of tokens. Prefer secrets file + credentials.txt on the archive.

---

## 8. Suggested review verdict template

| Question | Yes / No / Partial | Notes |
|----------|-------------------|--------|
| Can open public site and switch language? | | |
| Can log in and open cabinet? | | |
| Can run document-first flow and see process status? | | |
| Can open certificate with QR? | | |
| Can see process events on **Nodes list** (not “blocks”)? | | |
| Is minting clearly not available on portal? | | |
| Is permanent production domain live? | | (often **No** until white IP/VPS) |
| Acceptable for **closed pilot demo**? | | |
| Acceptable for **regulated production**? | | (expected **No** without audit + QTSP + hosting) |

---

## 9. Operator start/stop

```bash
cd /path/to/Aros-Studio-Tokenomics
npm run home:up
bash scripts/home-tunnel.sh      # optional temporary public HTTPS
cat .home-run/READY.txt
cat .home-run/public-url.txt     # if tunnel

npm run home:down
```

---

## 10. Bottom line

1. **Pilot demonstration path is built and runnable** on this Mac (and portable via git + export-for-imac).  
2. **Third parties can verify** via UI + health + Nodes list vocabulary.  
3. **Missing for regulated production** is mostly **hosting identity**, **audit engagement**, and **national crypto/IdP residuals** — not “empty scaffold.”  
4. Treat temporary tunnel as **demo access**, not production SLA.

*End of brief.*
