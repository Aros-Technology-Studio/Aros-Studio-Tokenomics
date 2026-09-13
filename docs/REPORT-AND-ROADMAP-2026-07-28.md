# Full report & roadmap — through 2026-07-28

**Repos:** Aros Studio Tokenomics (AST) — `Aros-Technology-Studio/Aros-Studio-Tokenomics`  
**Related:** AFC — `Aros-Design-Studio-L-L-C/AFC` (separate org/entity)  
**Tags on AST:** `v1.0.0`, `v1.1.0`  
**Latest AST push discussed:** `2075768` (language switcher visibility; pilot path `bb4ce7b`)

---

## 1. Why this work exists

| Goal | Meaning |
|------|---------|
| **AST** | Institutional **tool**: NodeChain SoT, PoT-gated economics, portal edge (no mint on portal) |
| **AFC** | **Process of executing** the Aros API Contract (AST ↔ Anchors) — not a platform/product |
| **Separation** | Different orgs/repos/legal stories; do not merge monorepos |

AST is the running engine. AFC builds the contractual/process layer **on top of / beside** AST after pilot stability.

---

## 2. Stages completed (AST)

### Stage A — Core engine (shipped earlier, still foundation)

| Item | Status | Why |
|------|--------|-----|
| NodeChain journal (memory/file/RocksDB) | Done | Source of truth |
| PoT (attestations, validators, challenges) | Done | Gate for economic mint |
| Orchestrator + intake + institution auth | Done | Process path |
| Commission 70/30, reserve, ARO unit | Done | Economics |
| Releases `v1.0.0` / `v1.1.0` | Done | Docker/prod kit without demo defaults |

### Stage B — Institutional portal (edge)

| Item | Status | Why |
|------|--------|-----|
| Login / session / secrets file | Done | Pilot & real institutions |
| Document-first wizard | Done | Valuation from paper, not invented rate |
| E-sign attestation + package hash | Done | Admission evidence (full QES later) |
| Core hand-off / continue / progress | Done | Stuck PoT/progress fixes |
| Certificate print/PDF + QR | Done | Digitization attestation |
| Public explorer `/explore` | Done | Transparency without login |
| NodeChain UI `/nodechain` | Done | Blockchain-style journal (EN labels) |
| Brand: AST only (drop “Aros Financial Core” UI) | Done | Clear product naming on portal |
| Certificate technical sans font | Done | Digital-doc visual, not “fancy” |
| i18n EN / RU / KA | Done | Language switcher in header |
| `home-up` / tunnel / domain scripts | Done | Local + temporary public access |

### Stage C — Ops / transfer (this Mac → iMac)

| Item | Status | Why |
|------|--------|-----|
| Large AST commit pushed to Technology Studio | Done (`bb4ce7b`+) | Code not trapped on one laptop |
| Data archive (secrets + journals) | Done (Desktop tar) | Gitignored data for AirDrop |
| Grok session pack for chat transfer | Done | Resume conversation on iMac |
| Permanent domain on home CGNAT | **Blocked** | ISP grey IP; not a code bug |

---

## 3. Stages completed (AFC — related, not this monorepo)

| Item | Status | Why |
|------|--------|-----|
| Assessed legacy `aros-financial-core` | Done | Docs-heavy, code stubs, do not rebuild in place |
| KEEP → Notion + `~/AFC-KEEP-ARCHIVE` | Done | Preserve knowledge |
| New clean repo **AFC** | Done | Docs foundation only |
| Deep Dive static `site/` | Done | Chapter 1 showcase HTML |
| Roadmap AST release + Technology site IA | Done | No “TV” (dictation typo) |
| Universal Contract decisions Q1–Q6 | Done | Anchors, institution, instance, SC, language, scaffold |
| Contract **outline** (articles) | Done | Awaiting owner “outline OK” → EN scaffold text |

---

## 4. What works today (pilot demo bar)

```
Login pilot → document package → e-sign → start → Core/PoT → certificate/QR
→ public explore + NodeChain UI (EN/RU/KA)
```

**Hard rule held:** portal never mints; NodeChain remains SoT after PoT.

**Login (after salt rotation on MacBook):** see `data/institution-credentials.txt` (gitignored).  
Default historical: `pilot` / `pilot` unless rotated.

---

## 5. Tops remaining (prioritized)

### P0 — Close transfer & verify

1. iMac: `git pull` AST + unpack `data` + `home-up`  
2. Confirm EN/RU/KA switcher visible  
3. Confirm login with current salt  
4. Optional: archive legacy AFC GitHub repo as read-only  

### P1 — Universal Aros API Contract (AFC)

5. Owner approve outline (`UNIVERSAL-AROS-API-CONTRACT-v1-OUTLINE.md`)  
6. Write EN **scaffold** Parts I–III (then IV–IX) — approach B  
7. Optional RU twin later  

### P2 — Technology public site

8. Brand domain decision  
9. Site IA live: Home · AFC · AC · Docs · API/Gateway · White paper · Deep dive · AST CTA  
10. Wire white paper + API docs from AFC KEEP  

### P3 — AST first external release

11. Deploy off home CGNAT (VPS recommended)  
12. Pilot E2E with owner PDF + sign-off checklist  
13. Tag pilot release; rotate shared pilot salt after demos  

### P4 — Later hardening (not first release)

14. Full QES / X.509  
15. OCR image-only scans  
16. Production mTLS / OIDC  
17. External security audit  
18. AFC runtime gateway (only after written specs)  

---

## 6. Explicit non-goals (near term)

- Rewriting legacy `aros-financial-core` in place  
- Calling AFC a “platform”  
- Permanent production on residential CGNAT  
- Merging AFC + AST into one repo  
- Fake Done on empty scaffolds  

---

## 7. Recommended next 7 days

| Day | Focus |
|-----|--------|
| 1 | iMac green: portal + languages + login |
| 2–3 | Universal Contract EN scaffold (after outline OK) |
| 4–5 | Technology site shell + AFC/AC/Docs/API routes |
| 6 | AST on VPS (or decide tunnel-only for pilot) |
| 7 | External reader: site + AST pilot brief |

---

## 8. Key links

| Resource | URL / path |
|----------|------------|
| AST GitHub | https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics |
| AFC GitHub | https://github.com/Aros-Design-Studio-L-L-C/AFC |
| Contract decisions | `AFC/docs/02-api-contracts/DECISIONS-universal-contract.md` |
| Contract outline | `AFC/docs/02-api-contracts/UNIVERSAL-AROS-API-CONTRACT-v1-OUTLINE.md` |
| Pilot review brief | `docs/portal/PILOT-STATUS-FOR-REVIEW.md` |
| MVP finish track | `docs/portal/MVP-FINISH-TRACK.md` |
| This report | `docs/REPORT-AND-ROADMAP-2026-07-28.md` |

---

*Report date: 2026-07-28. Update when outline approved or first VPS pilot ships.*
