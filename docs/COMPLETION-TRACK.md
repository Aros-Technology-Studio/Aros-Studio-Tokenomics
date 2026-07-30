# AST Completion Track — finish remaining repo components

**Status:** Blocks **A · B · C · D · E · F · G · I engineering complete** (2026-07-30)  
**Law:** `docs/AST-CORE-CANON.md` · decisions · layer acceptances  
**Rule:** No fake Done. Docs first when a unit lacks a written contract.  
**Owner residual:** `B1 approved` · host cutover · auditor · field tag · Bar B live ops.

---

## Blocks overview (owner list)

| Block | Scope | Status |
|-------|--------|--------|
| **A** | Repo hygiene / CI / companions / issues / vocabulary | **Done** (A1–A8) · Nodes list vocab |
| **B** | NodeChain Core residuals | **Done** code (B2–B6); **B1** owner sign-off **open** |
| **C** | Acceptance depth + operator smoke | **Done** (C1–C5) |
| **D** | Portal / pilot finish | **Done** engineering D1–D12 · owner ops residual |
| **E** | Solidity / representation (ArosCoinView) | **Done** E1–E3 · **E4 out** |
| **F** | Hardening / ops / prod (Bar B) | **Done** package F1–F6 · owner residual |
| **G** | Documents / process | **Done** G1–G5 · **G2 owner reply open** |
| **I** | Infra Postgres · Redis · Kafka · logs · K8s · Nest · alerts | **Done** engineering I1–I7 |
| **Cutover** | Live host packages (domain/secrets/data/health) | **Done** package `docs/cutover/` · owner executes |

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

## Block I — Infrastructure ✅ engineering

| ID | Item | Status |
|----|------|--------|
| **I1** | PostgreSQL index mirror prod path | ✅ compose profile + prod `with-postgres` · `docs/infra/I1-POSTGRES.md` · B6 code |
| **I2** | Redis sessions/cache | ✅ infra compose · portal dual-write · `I2-REDIS.md` · not SoT |
| **I3** | Kafka / event out | ✅ Redpanda profile · HTTP/rpk fan-out · `I3-KAFKA.md` |
| **I4** | Logging | ✅ `AST_LOG_JSON=1` · `json-log.ts` · `I4-LOGGING.md` |
| **I5** | Kubernetes skeleton | ✅ `deploy/k8s/*` · apply residual owner |
| **I6** | Spring vs Nest | ✅ **S1 Nest** · `SPRING-DECISION-I6.md` |
| **I7** | Observability alerts | ✅ `GET /metrics` · `deploy/alerts/*` · `I7-OBSERVABILITY.md` |

Rollup: [`docs/infra/BLOCK-I.md`](infra/BLOCK-I.md).

---

## Block E — Solidity / representation ✅ engineering

| ID | Item | Status |
|----|------|--------|
| **E1** | ArosCoinView Foundry tests green | ✅ `npm run test:contracts` · access-control coverage |
| **E2** | Deploy runbook (testnet) + reporter keys | ✅ `DEPLOY-TESTNET-E2.md` · `contracts:deploy` |
| **E3** | Reporter ↔ journal tip attest (ops) | ✅ `contracts:report-tip` · `REPORTER-TIP-E3.md` |
| **E4** | Free mint / ERC-as-SoT | ❌ **Out** — Canon · `NON-GOALS-E4.md` |

Rollup: [`docs/contracts/SOLIDITY-BLOCK-E.md`](contracts/SOLIDITY-BLOCK-E.md).

---

## Host cutover packages (ops · not Solidity E)

| Package | Status |
|---------|--------|
| Domain / secrets / data plane / health | ✅ `docs/cutover/*` · `cutover:env\|preflight\|health` |

---

## Block F — Hardening / ops / prod (Bar B) ✅ engineering package

| ID | Item | Status |
|----|------|--------|
| **F1** | External security audit | ✅ prep `EXTERNAL-AUDIT-F1.md` · **owner engages firm** |
| **F2** | Cloud KMS / real PKCS#11 | ✅ soft-HSM + interface · **later real KMS/PKCS#11** |
| **F3** | Multi-region replication mesh | ✅ catch-up only · **mesh residual** |
| **F4** | Live multi-vendor LLM keys | ✅ env adapters · **vault residual** |
| **F5** | Kill-switch / backup / restore drill | ✅ `drill:backup-restore` + runbook · **owner quarterly prod drill** |
| **F6** | Monitoring / alerts | ✅ `/metrics` · rules · `monitor:smoke` · **owner wire Prometheus** |

Rollup: [`docs/hardening/BLOCK-F.md`](hardening/BLOCK-F.md).

Prior field packages (still valid, not F1–F6 IDs): `GO-LIVE-F1.md`, `FIELD-RELEASE-F4.md`, `FINAL-ENGINEERING-F5.md`, cutover scripts.

---

## Block G — Documents / process ✅

| ID | Item | Status |
|----|------|--------|
| **G1** | Sync COMPLETION-TRACK / BACKLOG / ROADMAP after triage | ✅ this pass |
| **G2** | Owner review Canon (B1-related) | ✅ package ready · **owner: `B1 approved`** |
| **G3** | Pilot status brief (Nodes list, iMac path) | ✅ `PILOT-STATUS-FOR-REVIEW.md` 2026-07-30 |
| **G4** | CHANGELOG Nodes list + vocabulary | ✅ Unreleased section |
| **G5** | Commit + push | ✅ with G block |

Rollup: [`docs/docs-process/BLOCK-G.md`](docs-process/BLOCK-G.md).  
B1 package: [`layers/01_NodeChain/09_acceptance/OWNER-REVIEW.md`](layers/01_NodeChain/09_acceptance/OWNER-REVIEW.md).

---

## Next (owner only)

```bash
npm run drill:backup-restore
npm run monitor:smoke
npm run cutover:preflight
```

- Reply **`B1 approved`** (or amendments) — G2 / B1  
- Engage external auditor (F1)  
- Host cutover · quarterly restore drill · Prometheus wire  
- Optional: real KMS, multi-region mesh, L3 vault keys  

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
| **B — Pilot portal path** | D1–D12 engineering — **done** |
| **C — Infra package** | I1–I7 engineering — **done** |
| **D — Final field package** | F1–F5 go-live/audit/CI — **done** |
| **E — Solidity representation** | E1–E3 done · E4 out (no free mint) |
| **F — Hardening Bar B** | F1–F6 package done · owner audit/KMS/mesh/live drill |

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
# Infra (optional):
# docker compose -f docker-compose.yml -f docker-compose.infra.yml --profile with-postgres --profile with-redis --profile with-kafka up -d
curl -s http://127.0.0.1:3000/metrics | head
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
| 2026-07-30 | **I1–I7** | Infra package: postgres/redis/kafka/logs/k8s/Nest/metrics · `docs/infra/BLOCK-I.md` |
| 2026-07-30 | List refresh | Block **I** engineering complete; live cutover residual |
| 2026-07-30 | Field packages | Go-live / audit prep / field release / final rollup docs (pre-F redefine) |
| 2026-07-30 | **F1–F6** Hardening Bar B | Audit prep · KMS residual · mesh residual · L3 keys · drill script · monitor smoke |
| 2026-07-30 | List refresh | Block **F** = hardening/ops/prod package |
| 2026-07-30 | **G1–G5** | Docs process: trackers sync · B1 owner package · pilot brief · CHANGELOG Nodes · push |
| 2026-07-30 | Cutover ops packages | `docs/cutover/*` (domain/secrets/data/health) — not Solidity |
| 2026-07-30 | **E1–E3** Solidity | Foundry green · testnet deploy · report-tip; **E4 out** no free mint |
| 2026-07-30 | List refresh | Block **E** = Solidity representation complete |

---

## 5. Close rules (unchanged)

1. Close an item only with tests/guards/docs evidence.  
2. No fake layer Done without residual labels.  
3. Production ops stay open until owner evidence.  
