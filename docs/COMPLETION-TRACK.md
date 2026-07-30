# AST Completion Track — finish remaining repo components

**Status:** Active  
**Date:** 2026-07-30  
**Law:** `docs/AST-CORE-CANON.md` · decisions · layer acceptances  
**Rule:** No fake Done. Docs first when a unit lacks a written contract.

---

## 1. What is already shipped (do not re-build)

| Area | Evidence |
|------|----------|
| Layers 01–10 code | `docs/layers/LAYER_ISSUE_MAP.md` + `src/*` |
| Core tests | `npm test` — 35 suites / 166 tests |
| Build phases 0–6 | `docs/BUILD_SCHEDULE.md` Done |
| Hardening #68–#70 | HSM KeyProvider, JournalReplicator, L3 LLM adapters |
| Portal edge pilot path | login, document-first wizard, hand-off, certificate, explorer, NodeChain UI, i18n EN/RU/KA |
| Release packaging | Docker Compose, v1.0.0 / v1.1.0 docs |

**Pilot product path is runnable.** “Finish the repo” means close **residual engineering + honesty gaps**, not restart layers from zero.

---

## 2. Definition of “complete” (two bars)

| Bar | Meaning | When to claim |
|-----|---------|---------------|
| **A — Repo engineering complete** | Specs ↔ code ↔ tests ↔ guards green; no known in-repo product hole for pilot | CI + this track Wave 1–2 closed |
| **B — Regulated production ready** | A + hosting, full QES/X.509, mTLS/OIDC, external audit, owner sign-off | Owner-driven; **not** “code Done” alone |

This track targets **Bar A**. Bar B items stay open without fake close.

---

## 3. Residual inventory

### Wave 1 — Hygiene (in progress)

| # | Item | Why |
|---|------|-----|
| W1.1 | Canon API vocabulary: no `/blocks` on Core | `domain-invariants-guard` fails on `blocks` metaphor |
| W1.2 | Portal uses **Nodes list** (`/nodechain/nodes`) | Chain unit = node (height, envelopeHash, prevHash) |
| W1.3 | Portal `npm test` glob | Quoted glob breaks node test runner |
| W1.4 | This track doc | Single map for remaining work |

### Wave 2 — Spec / acceptance depth

| # | Item | Why |
|---|------|-----|
| W2.1 | Governance acceptance expanded | Current checklist too thin vs `src/governance` |
| W2.2 | All-Seeing Eye acceptance expanded | Same |
| W2.3 | NodeChain residual acceptances | Owner review; encryption-at-rest; read scoping; event stream — mark residual ops honestly |
| W2.4 | ArosCoin thin wrapper tests | `src/aroscoin` has no dedicated unit file |
| W2.5 | Stale GitHub open issues | MIGRATE/DOC from pre-clean-slate era — close or re-scope |

### Wave 3 — Product residuals (specs already exist; implement only with acceptance)

| # | Item | Spec anchor | Bar |
|---|------|-------------|-----|
| W3.1 | Institution read scoping on Core HTTP | NodeChain query AuthZ | A (if edge multi-tenant) |
| W3.2 | Durable observer event stream | Eye / events-out | A optional |
| W3.3 | Journal encryption at rest (ops KeyProvider path) | NodeChain acceptance residual | A/B |
| W3.4 | Real QES / X.509 chain | MVP finish track B | B |
| W3.5 | OCR image-only scans | MVP finish track B | B |
| W3.6 | Production mTLS / OIDC | BACKLOG / ROADMAP | B |
| W3.7 | Showcase site content wiring | PUBLIC-SHOWCASE-SITE — **needs owner content packs** | A after content |
| W3.8 | External audit | Owner | B |

### Explicitly out of this track

- Outer API-contract product shell (separate product; builds on AST later)
- Free mint, ERC-as-SoT, third-party custody, Eye veto
- Multi-region BFT mainnet

---

## 4. Verification commands (Bar A gate)

```bash
npm test
npm run check:canon
npm run check:env
# portal edge
cd portal/backend && npm test
# optional companions (tooling must be installed)
cd contracts && forge test
cd rust && cargo test
```

---

## 5. Close rules

1. Close a Wave item only with tests or guard green + doc update.  
2. Do not mark Layer Done if acceptance checkboxes still open without residual label.  
3. Production ops items stay **open** until owner evidence exists.  

---

## 6. Progress log

| Date | Item | Result |
|------|------|--------|
| 2026-07-30 | Inventory + track created | Core 166 tests green; check:canon failed on `/blocks` |
| 2026-07-30 | W1.1–W1.2 | Core/portal → **Nodes list** `GET …/nodechain/nodes` (not blocks, not records list) |
| 2026-07-30 | **A1** | `npm run check:canon` / `run-all-guards: ALL OK` (firewall, domain, pot, layout, …) |
| 2026-07-30 | **A2** | Portal edge: portable `scripts/run-tests.mjs` + CI `portal/backend` test/build + root `test:portal` |
| 2026-07-30 | **A3** | Unified `npm run check:release` / `test:all` (core+portal tests+builds); CI uses same gate |
| 2026-07-30 | **A4** | Foundry installed (brew); `npm run test:contracts`; CI job `contracts`; forge tests expanded |
| 2026-07-30 | **A5** | Rust/rustup installed; `npm run test:rust`; CI job `rust`; companion tests expanded |
| 2026-07-30 | **A6** | Closed 22 stale issues; kept #52 ontology, #41 legal, #34 Notion; matrix in `ISSUE-HYGIENE-A6.md` |
| 2026-07-30 | **A7** | `sessions/` + `.grok/` gitignored; guards exclude; check-env asserts not tracked; CONTRIBUTING note |
| 2026-07-30 | **A8** | NodeChain vocabulary: nodes list (docs + i18n EN/RU/KA + CSS); `docs/layers/01_NodeChain/VOCABULARY.md` |
| 2026-07-30 | **B1** | Owner review package ready (`09_acceptance/OWNER-REVIEW.md`); checkbox waits for **B1 approved** |
| 2026-07-30 | **B2** | Journal encryption at rest (AES-256-GCM) for file/rocksdb; tests; ops in encryption-at-rest.md |
| 2026-07-30 | **B3** | Core HTTP institution read scope (`read-scope.ts`); foreign process → 404; ops token full |
| 2026-07-30 | **B4** | Durable observer event stream (JSONL + resume API); Eye + NodeChain publishers |
| 2026-07-30 | **B5** | Dual API map ListNodes vs network registry (`nodes-vs-registry.md`); STRUCTURE/portal/code notes |
| 2026-07-30 | **B6** | Postgres index mirror runbook + continuous upsert + CLI/HTTP mirror status/replay |
| 2026-07-30 | **C1** | Governance acceptance expanded to L1/L2/L3 + real code map (`09_acceptance/acceptance.md`) |
| 2026-07-30 | **C2** | All-Seeing Eye acceptance expanded (observe/notify, no veto, B4 stream, HTTP) |
| 2026-07-30 | **C3** | ArosCoin dedicated unit tests (`aroscoin.service.spec.ts`); token acceptance updated |
| 2026-07-30 | **C4** | Layers 01–10 acceptance rollup; residuals marked honestly (`ACCEPTANCE-ROLLUP-C4.md`) |
| 2026-07-30 | **C5** | Operator smoke script + checklist (`smoke:operator`, `OPERATOR-SMOKE-C5.md`) |
