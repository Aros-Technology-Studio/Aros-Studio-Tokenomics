# AST Architecture

**Status:** Living — aligned to Core Canon + component packs (2026-07-16 enrichment)  
**Canon:** `docs/AST-CORE-CANON.md` (root `CANON.md` is pointer only)  
**Principle:** [principles/ANTI_POLICE.md](./principles/ANTI_POLICE.md)  
**Registry:** [DOC_MAP.md](./DOC_MAP.md)

---

## 1. What AST is

AST (Aros Technology Studio) is a self-sufficient crypto-economic platform for **institutional asset tokenization**, built on:

| Pillar | Role |
|--------|------|
| **NodeChain** | Append-only process ledger; sole economic source of truth (not a public L1 product chain) |
| **PoT** | Proof-of-Transaction — only gate for origin/change of value |
| **ArosCoin** | Addressed claim on a specific reserve (mint / hold / burn; 9 decimals) |
| **All-Seeing Eye** | Observe, record, notify — **no veto, no rollback** |
| **AST Token Protocol** | Canonical state in NodeChain + PoT; ERC standards = adapters only |
| **Release Phase** | Broader circulation only after `reserveIndex` ∧ `velocity` thresholds + governance rules |

Legal posture (canon): sovereign process token-economy; selective custody of **own** funds only; not a third-party custodian; not a valuation body.

---

## 2. Runtime component map

```
                    ┌─────────────────────┐
                    │   All-Seeing Eye    │  observe / notify (no veto)
                    └──────────▲──────────┘
                               │ observes
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────┴────┐          ┌──────┴──────┐         ┌─────┴─────┐
   │  PoT    │─────────▶│  Emission   │────────▶│ ArosCoin  │
   └────▲────┘          └─────────────┘         └─────▲─────┘
        │                                    AST Token Protocol
   ┌────┴────┐          ┌─────────────┐         ┌─────┴─────┐
   │ Nodes / │          │ Commission  │         │  Reserve  │
   │NodeChain│          │ (post-factum│         │ (own only)│
   │ (SoT)   │          │  70/30)     │         └───────────┘
   └────▲────┘          └─────────────┘
        │
   ┌────┴──────────┐     ┌────────────────┐
   │ Orchestrator  │────▶│ State recording│
   └───────▲───────┘     └────────────────┘
           │
   ┌───────┴────────┐   optional: oracle-gateway
   │ Portal (edge)  │   support: node-reputation, velocity-tracker,
   └────────────────┘           release-daemon, partial-release
```

Detail: `docs/components/<name>/` (PURPOSE · MODEL · CONTRACT · ACCEPTANCE).

---

## 3. One economic cycle (canonical shape)

1. Institution provides confirmed valuation and signed package (RWA path); process starts via **Orchestrator only**.  
2. Optional **oracle-gateway** (multi-oracle + signatures) when process type requires external attested transport — not AST self-appraisal.  
3. **PoT** confirms execution / package (`verified = 1`, criteria P1–P4, M-of-N).  
4. **NodeChain** records PoT **write-ahead** (sole validity before emission).  
5. **Emission** computes amount (valuation + ΔValue; I9 pro-rata); **aroscoin.mint** only after PoT+ledger.  
6. **Commission** settles post-factum (default 70% nodes / 30% AST).  
7. **State-recording** snapshots process state inside NodeChain.  
8. **All-Seeing Eye** observes; does not veto, roll back, or initiate.  
9. Broader circulation only after **Release Phase** (`reserveIndex` ∧ `velocity` via daemon + `release` + governance).

See Core Canon §§III–XI for formulas, prohibitions, invariants I1–I9.

---

## 4. Layering

| Layer | Concern | Primary components |
|-------|---------|-------------------|
| Edge | Institution / holder UX | `portal/` |
| Process | Sole economic entry, fixed pipeline | `orchestrator`, `state-recording` |
| Confirmation | Verified work | `pot`, `nodes`, `oracle-gateway` |
| Ledger | Append-only SoT | `nodechain` |
| Token / reserve | Claims and backing | `aroscoin`, `emission`, `reserve`, `commission` |
| Release | Phase gates + partial | `release`, `release-daemon`, `velocity-tracker`, `partial-release` |
| Reputation | Weight / suspend no slash | `node-reputation` |
| Oversight | Observe / notify | `all-seeing-eye` |
| Guards | I1–I9 | `invariants` |
| Platform | Money, ids, errors, kill-switch | `common` |

Core: TypeScript / NestJS (Node ≥ 20). ERC / Solidity: representation adapters only (`src/adapters/`).

---

## 5. Orchestrator pipeline (fixed)

| Step | Name | Fail-closed note |
|------|------|------------------|
| 1 | StartProcess | processId + idempotencyKey |
| 2 | Docs + КЭП | reject incomplete package |
| 3 | Oracle? | if required: multi-oracle; no skip in v1 |
| 4 | PoT | P1–P4; M-of-N; timeout → expired |
| 5 | NodeChain | write-ahead before emission |
| 6 | Emission | no free mint |
| 7 | Settlement | commission post-factum |
| 8 | State | snapshots in NodeChain |
| 9 | End | terminal |

Compensation saga **only before** `verified = 1`.

Process doc: `docs/processes/primary-tokenization.md`.

---

## 6. Release subsystem

```
reserve.reserveIndex()  ──┐
                          ├──▶ release-daemon.tick()
velocity-tracker.velocity() ──┘         │
                                        ▼
                              release.activateFromDaemon
                                        │
                              governance rules (release pack)
                                        ▼
                              NodeChain phase event
```

- Config keys: `release.threshold`, `release.target` (not magic-number sole SoT).  
- **partial-release** is a **separate** full process (new processId), not phase activation.  
- Pre-phase: block free external transfer / CEX listing / public trading (I8).

---

## 7. Invariant checklist (machine + CI)

| ID | Summary |
|----|---------|
| I1 | No value without PoT `verified = 1` |
| I2 | No emission before NodeChain PoT record |
| I3 | No free / privileged mint |
| I4 | Supply conservation (online + offline reconcile) |
| I5 | Selective custody — own funds only |
| I6 | Eye cannot veto / rollback economic state |
| I7 | ERC adapter is not SoT |
| I8 | Pre–Release Phase internal circulation only |
| I9 | Revaluation pro-rata |

Enforced in `src/invariants/` + protective GitHub workflows. Detail: `docs/components/invariants/`.

---

## 8. Interface table (high level)

| From → To | Contract gist |
|-----------|----------------|
| Portal → Orchestrator | sole economic HTTP entry (core API) |
| Orchestrator → PoT | evidence + assigned validators |
| PoT → NodeChain | verdict append before ok-to-emit |
| PoT → Emission | ok signal **without amount** |
| Emission → ArosCoin | mint/burn after gate |
| Emission → Reserve | bag / claim consistency |
| Commission → Nodes / AST | 70/30 post-factum |
| Daemon → Release | threshold initiation |
| Eye ← * | events only; no command plane into mint |

Per-component tables: each pack `CONTRACT.md`.

---

## 9. What this document is not

- Not a compliance manual  
- Not a policing or enforcement playbook  
- Not a substitute for Core Canon  

If architecture prose and Core Canon diverge, **Core Canon wins**.
