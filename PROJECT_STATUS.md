# AST — Project Build-Out Plan (sequence of actions and transfers)

_Updated: 2026-07-06. **Status: PLAN awaiting approval. Nothing has been transferred into this repository yet** — content moves in only after your "go" on this plan, phase by phase._

This document is not a report of work done; it is a **plan**: the order in which the project is brought up and what moves where, and when. Every phase ends at a stop point (separate PR → you review the diff → you merge), so that you see and confirm each step.

---

## 0. Where we are now (facts)

- ✅ Repository created (this one, `Aros-Studio-Tokenomics`).
- ✅ Source review complete — `MIGRATION_REVIEW.md` (all 483 files classified).
- ✅ **The canon version of the layers is already written** and lives in the old repository `AST-Aros-Financial-Paradigm` (`main`, after PR #546). It has **NOT** been transferred into this clean repository yet — that is the subject of the plan below.
- ✅ **Canon cleanup in the old repo is finished** (PR #547–#549): layer 11 deleted (slashing re-grounded in layer 10), `src/` cleared of AFC identifiers, `ArosCoinReserveManager.sol` rewritten to canon, and **`01_coin_engine` removed — the invariant spine I1–I8 re-homed to the root `CANON.md`** (TokenSpec → 03, node infrastructure spec → 02).
- ✅ **Engineering scaffold of this repository is up**: Node 20, `package.json` (NestJS/TypeORM/pg — exactly what the canonical `src/` imports), tsconfig/jest/eslint/prettier, build-lint-test CI (`ci.yml`) alongside the canon gate, Docker (`Dockerfile` + `docker-compose.yml`: postgres + app), and a SessionStart hook for Claude Code on the web. Build/lint/test/gate — all green.

---

## 1. Target structure of the clean repository

```
Aros-Studio-Tokenomics/
├── CANON.md                  # the canon spine: invariants I1–I8, constants, the one cycle (module-neutral, above the layers)
├── README.md                 # project overview
├── PROJECT_STATUS.md         # this plan/tracker
├── MIGRATION_REVIEW.md       # source review
├── LICENSE, .gitignore
├── 02_nodechain_engine/      # \
├── 03_token_management_layer/#  |
├── 06_governance_layer/      #  |
├── 07_processing_layer/      #  |  canon layers (transferred in Phase 2)
├── 08_fee_distribution/      #  |
├── 10_proof_of_transaction_engine/
├── 13_extra_supervisory_layer/
├── 14_decentralized_tx_encoding/
├── 15_reserve/               # /
├── src/, reference/, smart_contracts/   # code (Phase 4, after canon cleanup)
└── docs/                     # specifications/legal (Phase 5, after canon cleanup)
```

_(`01_coin_engine` is excluded from the structure by ratified decision: emission is a consequence of PoT + Token Management, not a layer of its own. Its spine lives in `CANON.md`.)_

---

## 2. Sequence of actions (phases)

| Phase | What we do | Stop point |
|---|---|---|
| **P1 — Approve the plan** ← *now* | You confirm this structure, the order, and the transfer/no-transfer registry. | your "go" |
| **P2 — Transfer CANON.md + 9 layers** | Transfer `CANON.md` and the canon layers from the old repo (list in §3, 89 files); run the firewall + vocabulary gate. | PR → you merge |
| **P3 — Layer 11** | ✅ DECIDED and executed in the old repo (PR #547): layer 11 deleted, slashing re-grounded in `10/pot_slashing_conditions.md`. Not transferred here. | — |
| **P4 — Code to canon** | ✅ Canon cleanup of the code done in the old repo (PR #547: `AFC_RESERVE`→`SYSTEM_RESERVE` etc.; PR #548: `ArosCoinReserveManager.sol` rewritten). Remaining: transfer `src/` + `reference/` + `smart_contracts/` here. | PR |
| **P5 — `docs/` to canon** | Canon cleanup of specifications/legal/architecture (11 files containing `AFC`). | PR |
| **P6 — Debris + CI** | Do not transfer `AGENT_*_REPORT`, `ci_logs/`, `reports/`, `failed_*`; rewrite `nightly-audit.yml` ("AFC invariants" → AST). | PR |
| **P7 — Final gate** | Firewall grep across the whole repository → empty; build/lint green. | PR |

---

## 3. Registry: what transfers / what does not

**Transfers (ready in the old repo, canon-clean) — Phase 2:**
`CANON.md` (the I1–I8 spine), `02_nodechain_engine`, `03_token_management_layer` (+ `AROS_Coin_TokenSpec.json`), `06_governance_layer` (new, AI hierarchy), `07_processing_layer`, `08_fee_distribution` (Variant A), `10_proof_of_transaction_engine`, `13_extra_supervisory_layer` (the Eye with veto), `14_decentralized_tx_encoding`, `15_reserve` (new). — **89 files.**

**Awaiting decision / rework (Phases 4–5):**
code `src/` + `reference/` + `smart_contracts/` (already canon-clean in the old repo — transfer), `docs/` (11 files containing `AFC`), `frontend/` (is a UI needed here?).

**Not transferred — excluded from the canon:**
`01_coin_engine` (removed: emission = consequence of PoT + Token Management; spine → `CANON.md`), `04_aros_value_circulation`, `05_bridge_layer`, `09_crypto_ingestion_pipeline`, `11_node_security_and_payments` (deposits/staking contradict I6; deleted in the old repo), `12_nodechain_ai_agents` (dropped entirely), the forks `ast/extra_supervisory_layer` and `aros-tokenomics/03`, debris (`AGENT_*_REPORT`, `ci_logs/`, `reports/`, `failed_*`).

---

## 4. Gates (on every transfer)

- Firewall: `grep -RInE 'AFC|Aros Financial Core|LacMusa|Fiat Anchor|Crypto Anchor'` → empty.
- Vocabulary: `grep -RIniE 'reward|incentive|stimulus'` → empty.
- JSON validity / build where applicable.

---

## 5. Invariants (the canon spine)

- **I1** — a unit of ARO comes into existence only as the consequence of a PoT verdict `verified===1`.
- **I2** — born-and-burned: the process part is minted and atomically burned; net = 0.
- **I3** — payment for confirmed work, post-factum; the earned part is retained. No reward/incentive vocabulary.
- **I4** — the reserve is AST's own; the index derives from confirmed volume only.
- **I5** — determinism: everything is reproducible from NodeChain.
- **I6** — no speculative surface (no cap, no staking, no voting by balance, no volatility control).
- **I7** — the All-Seeing Eye observes and **has veto**, but never initiates.
- **I8** — the cause is written to NodeChain before the effect is acknowledged.

---

**Awaiting your "go" on Phase 1.** Once approved, Phase 2 (transfer of CANON.md + 9 layers) starts as a separate PR.
