# AST Completion Track — finish remaining repo components

**Status:** Blocks **A · B · C · D engineering complete** (2026-07-30)  
**Law:** `docs/AST-CORE-CANON.md` · decisions · layer acceptances  
**Rule:** No fake Done. Docs first when a unit lacks a written contract.  
**Owner residual:** live domain cutover, IdP/JWKS, prod OCR engine, content languages, Block **I**.

---

## Blocks overview (owner list)

| Block | Scope | Status |
|-------|--------|--------|
| **A** | Repo hygiene / CI / companions / issues / vocabulary | **Done** (A1–A8) |
| **B** | NodeChain Core residuals | **Done** code path (B2–B6); **B1** owner sign-off still optional |
| **C** | Acceptance depth + operator smoke | **Done** (C1–C5) |
| **D** | Portal / pilot finish | **Done** engineering D1–D12 · owner ops residual (see D8/D11) |
| **I** | Infra Kafka · K8s · Redis · logging · Spring decision | **Open** (owner decide) |

---

## Block A — Repo engineering hygiene ✅

| ID | Item | Status |
|----|------|--------|
| A1 | `check:canon` / all guards green | ✅ |
| A2 | Portal backend tests portable + CI | ✅ |
| A3 | Unified `check:release` (core+portal) | ✅ |
| A4 | Foundry + `test:contracts` + CI | ✅ |
| A5 | Rust + `test:rust` + CI | ✅ |
| A6 | Stale GitHub issues closed (keep #52, #41, #34) | ✅ |
| A7 | `sessions/` / `.grok` gitignored + guards | ✅ |
| A8 | NodeChain vocabulary: **nodes**, not blocks | ✅ |

---

## Block B — NodeChain Core ✅

| ID | Item | Status |
|----|------|--------|
| B1 | Owner review package (`OWNER-REVIEW.md`) | ✅ package; sign-off optional (`B1 approved`) |
| B2 | Journal encryption at rest (AES-256-GCM) | ✅ |
| B3 | Institution Core HTTP read scope | ✅ |
| B4 | Durable observer event stream | ✅ |
| B5 | ListNodes vs network registry dual API | ✅ |
| B6 | Postgres index mirror ops + CLI/HTTP | ✅ |

---

## Block C — Acceptance + smoke ✅

| ID | Item | Status |
|----|------|--------|
| C1 | Governance L1/L2/L3 acceptance depth | ✅ |
| C2 | All-Seeing Eye acceptance depth | ✅ |
| C3 | ArosCoin dedicated unit tests | ✅ |
| C4 | Layers 01–10 acceptance rollup | ✅ `ACCEPTANCE-ROLLUP-C4.md` |
| C5 | Operator smoke `npm run smoke:operator` | ✅ `OPERATOR-SMOKE-C5.md` |

---

## Block D — Portal / pilot finish ✅ engineering

| ID | Item | Status |
|----|------|--------|
| **D1** | Owner `home-up` alone | ✅ `OWNER-START-D1.md` · READY card · `npm run home:up` |
| **D2** | Real PDF e2e | ✅ `demo:pdf-e2e` · fixture · `DEMO-PDF-E2E-D2.md` |
| **D3** | Demo script sign-off package | ✅ `DEMO-SIGN-OFF-D3.md` |
| **D4** | X.509 detached / QES crypto path | ✅ `QES-X509-D4.md` · `demo:x509-e2e` · national QTSP residual |
| **D5** | OCR image-only | ✅ optional tesseract / `AST_OCR_CMD` · `OCR-D5.md` |
| **D6** | mTLS / OIDC pilot hooks | ✅ `login/mtls` · `login/oidc` · `MTLS-OIDC-D6.md` · IdP residual |
| **D7** | Secrets rotation | ✅ `secrets:rotate` · `SECRETS-ROTATION-D7.md` |
| **D8** | Domain ops card | ✅ `DOMAIN-D8.md` + tunnel/proxy scripts · **owner DNS** |
| **D9** | Showcase routes | ✅ `/showcase` `/whitepaper` `/deep-dive` `/docs` |
| **D10** | Content packs (demo EN) | ✅ `fixtures/content-packs/` · `SHOWCASE-D9-D10.md` |
| **D11** | Production readiness checklist | ✅ `PRODUCTION-READINESS-D11.md` · owner rows |
| **D12** | Portal finish rollup | ✅ `PORTAL-FINISH-D5-D12.md` |

---

## Next (open)

### I — Infrastructure (owner decision)

| ID | Item | Notes |
|----|------|--------|
| I1 | PostgreSQL mirror in default prod | Schema + B6 exist |
| I2 | Redis | Sessions/cache — not SoT |
| I3 | Kafka | Events out — optional beyond B4 file stream |
| I4 | Logging stack | JSON stdout → pick Loki/ELK |
| I5 | Kubernetes | After compose-stable |
| I6 | Spring Boot | **S1 recommended** (keep Nest); confirm |
| I7 | Observability alerts | Metrics + health |

---

## 1. What was already shipped before A/B/C

| Area | Evidence |
|------|----------|
| Layers 01–10 code | `docs/layers/` + `src/*` |
| Build phases 0–6 | `docs/BUILD_SCHEDULE.md` Done |
| Hardening #68–#70 | HSM, replication, L3 LLM |
| Portal pilot path | login, wizard, certificate, explorer, i18n |
| Release packaging | Docker / v1.0.0–v1.1.0 |

---

## 2. Bars of “complete”

| Bar | Meaning |
|-----|---------|
| **A — Repo engineering** | Specs ↔ code ↔ tests ↔ guards — **A/B/C done** |
| **B — Pilot portal path** | D1–D12 engineering — **done** (owner DNS/IdP/copy residual) |
| **C — Regulated production infra** | Block **I** + live cutover — **open** |

---

## 3. Verification

```bash
npm test
npm run check:canon
npm run check:env
npm run smoke:operator
npm run check:release   # includes smoke + portal when deps installed
npm run test:contracts  # needs forge
npm run test:rust       # needs cargo
# Portal pilot (stack up):
npm run home:up
npm run demo:pdf-e2e
npm run demo:x509-e2e
npm run secrets:rotate -- --help
# Showcase: http://127.0.0.1:3200/showcase
```

---

## 4. Progress log (detail)

| Date | Item | Result |
|------|------|--------|
| 2026-07-30 | Inventory + track | Started |
| 2026-07-30 | **A1–A8** | Block A complete |
| 2026-07-30 | **B1–B6** | Block B complete (B1 = package; optional owner checkbox) |
| 2026-07-30 | **C1–C5** | Block C complete |
| 2026-07-30 | Commit `6f374de` | Pushed to `origin/main` |
| 2026-07-30 | List refresh | Blocks A/B/C marked **Done** in this file |
| 2026-07-30 | **D1** | Owner alone start: preflight, READY.txt, OWNER-START-D1.md, npm run home:up/down |
| 2026-07-30 | Commit `37cde2c` | D1 on `origin/main` |
| 2026-07-30 | **D2** | Real PDF e2e: fixture + `npm run demo:pdf-e2e` → `D2 PDF E2E PASS` |
| 2026-07-30 | **D3** | Owner sign-off package `DEMO-SIGN-OFF-D3.md` |
| 2026-07-30 | **D4** | X.509 detached verify (`QES-X509-D4.md`); `demo:x509-e2e`; national QTSP residual |
| 2026-07-30 | Commit `8c9bcbe` | D2–D4 (+ canon note) on `origin/main` |
| 2026-07-30 | List refresh | **D1–D4 Done**; D5+ / I remain open |
| 2026-07-30 | **D5–D12** | OCR · mTLS/OIDC · rotate · domain card · showcase · packs · readiness · rollup |
| 2026-07-30 | List refresh | Block **D** engineering complete; **I** open |

---

## 5. Close rules (unchanged)

1. Close an item only with tests/guards/docs evidence.  
2. No fake layer Done without residual labels.  
3. Production ops stay open until owner evidence.  
