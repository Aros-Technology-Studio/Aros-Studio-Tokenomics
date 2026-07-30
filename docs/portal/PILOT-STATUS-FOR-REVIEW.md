# AST Pilot Status — for external review

**Product:** Aros Studio Tokenomics (AST)  
**Document type:** Operator readiness brief (not a legal certificate)  
**Date:** 2026-07-25  
**Audience:** Partner, institution, auditor, product owner who needs a **yes/no** view of readiness  

This is a **truthful** checklist: what works end-to-end today, what is intentionally out of scope, and what is blocked by infrastructure (not by missing product code).

---

## 1. One-line status

| Layer | Verdict |
|-------|---------|
| **Core product path** (document → PoT → journal → mint path) | **Ready for pilot demo** |
| **Institutional portal edge** (login, wizard, status, certificate) | **Ready for pilot demo** |
| **Public transparency** (explorer + NodeChain UI) | **Ready for pilot demo** |
| **Permanent production domain** (`https://arosfinancialcore.com` from home) | **Not ready** — ISP CGNAT blocks inbound ports |
| **Full QES / X.509 / mTLS production hardening** | **Not ready** (follow-on) |

---

## 2. How a third party can verify (hands-on)

### A. Open the live edge (temporary public URL)

While the home stack and tunnel are running, open the URL printed by:

```bash
cat .home-run/public-url.txt
# or after: bash scripts/home-tunnel.sh
```

Typical form: `https://*.trycloudflare.com`  
**Local fallback:** `http://127.0.0.1:3200`

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open home page | AST branding, EN/RU/KA language switch |
| 2 | `/system` | Can / cannot boundaries |
| 3 | `/explore` | Public process lookup form (no login) |
| 4 | `/nodechain` | Nodes list, verify chain, EN/RU/KA i18n |
| 5 | `/login` | Login `pilot` · Salt `pilot` |
| 6 | Cabinet → Tokenization | Document-first wizard |
| 7 | Complete process | Status progress, certificate print + QR |
| 8 | Open NodeChain with processId | Related journal events |

**Hard rules visible in UI/docs:** portal **never mints** ARO; mint only after Core PoT.

### B. Health probes (technical)

```bash
curl -s http://127.0.0.1:3100/v1/health
curl -s http://127.0.0.1:3100/v1/health/ready
curl -s http://127.0.0.1:3100/v1/public/nodechain/status
curl -s http://127.0.0.1:3000/v1/core/nodechain/status   # if Core exposed locally
```

Expect: edge `status: ok`, NodeChain `chain.ok: true`, genesis present, tip height ≥ 0.

### C. Canon / decisions (paper)

| File | Role |
|------|------|
| `docs/AST-CORE-CANON.md` | Sole law |
| `docs/P0-P4-TECHNICAL-DECISIONS.md` | Ratified technical choices |
| `docs/portal/ARCHITECTURE.md` | Edge vs Core boundary |
| `docs/portal/MVP-FINISH-TRACK.md` | Finish track status |
| This file | External review snapshot |

---

## 3. Ready (shipped for pilot demo)

| Capability | Evidence |
|------------|----------|
| NodeChain append-only journal (SoT) | Core + `/nodechain` UI + public status API |
| PoT-gated economic path | Core orchestrator; no free mint on portal |
| Institution login (session) | Allowlist / secrets file; pilot `pilot`/`pilot` |
| Document-first digitization wizard | Upload → e-sign attestation → fields → start |
| Core hand-off from edge | Portal edge → Core; fail-closed if Core down |
| Process status + continue / retry paths | Dashboard + process status UI |
| Digitization certificate (print/PDF) | Technical layout, QR verify URL, AST brand only |
| Wallet-compat metadata (export) | Documented; representation only |
| Public process explorer | `/explore` without credentials |
| Multi-language UI (EN / RU / KA) | Header language switch, `localStorage` |
| Home runbooks | `scripts/home-up.sh`, `home-down.sh`, `home-tunnel.sh` |

---

## 4. Not ready / limited (honest)

| Item | Status | Why it matters |
|------|--------|----------------|
| **Permanent domain on home broadband** | Blocked | Modem WAN is CGNAT (`100.x`); ISP does not forward 80/443 to house IP. Rules on router exist; certificates from Let's Encrypt fail from outside. |
| Temporary public URL | Works only while Mac + tunnel run | URL changes each tunnel start |
| Full national QES / X.509 chain | Not implemented | v1 uses package hash + signature attestation flag |
| OCR for image-only scans | Not implemented | PDF/text extract assist only |
| Production mTLS / OIDC | Not required for pilot | Session + institution token path today |
| Multi-region replication mesh | Beyond single-node pilot | Specs/later |
| External security audit | Not done | Operator responsibility before real institutions |
| Outer product shell | Out of scope for this pilot | Positioning later; AST is the economic tool |

---

## 5. Fixed pilot credentials (demo only)

| Field | Value |
|-------|--------|
| Login | `pilot` |
| Salt | `pilot` |

**Not** for production institutions. Real tenants use `data/institution-secrets.json` / operator-issued tokens (`docs/portal/INSTITUTION-SECRETS.md`).

---

## 6. Architecture in one diagram

```
Reviewer browser
      │
      ├─ temporary: https://*.trycloudflare.com
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

---

## 7. Suggested review verdict template

A reviewer can fill:

| Question | Yes / No / Partial | Notes |
|----------|-------------------|--------|
| Can open public site and switch language? | | |
| Can log in as pilot and open cabinet? | | |
| Can run document-first flow and see process status? | | |
| Can open certificate with QR? | | |
| Can see process events on NodeChain? | | |
| Is minting clearly not available on portal? | | |
| Is permanent production domain live? | | (expected **No** until white IP or VPS) |
| Acceptable for **closed pilot demo**? | | |
| Acceptable for **regulated production**? | | (expected **No** without audit + QES + hosting) |

---

## 8. Operator start/stop (for the host machine)

```bash
cd /path/to/Aros-Studio-Tokenomics
bash scripts/home-up.sh          # Core + edge + UI
bash scripts/home-tunnel.sh      # temporary public HTTPS
cat .home-run/public-url.txt     # share this URL with reviewer

bash scripts/home-down.sh        # stop everything
```

---

## 9. Bottom line for the other person

1. **The product path for a pilot demonstration is built and runnable.**  
2. **They can verify it in the browser** with the temporary URL + pilot login + the table in §2.  
3. **What is missing is not “the system doesn’t work”** — it is **production hosting identity** (white IP or VPS), **full e-seal crypto**, and **audit/hardening** for real regulated use.  
4. Treat temporary tunnel as **demo access**, not as production SLA.

*End of brief.*
