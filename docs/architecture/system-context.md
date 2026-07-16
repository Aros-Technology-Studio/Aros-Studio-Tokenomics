# System Context

**Status:** Architecture — aligned to Core Canon v1.0 + P0–P4  
**Canon:** [`docs/AST-CORE-CANON.md`](../AST-CORE-CANON.md)  
**Parent:** [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)  
**Decisions:** [`docs/P0-P4-TECHNICAL-DECISIONS.md`](../P0-P4-TECHNICAL-DECISIONS.md)

---

## 1. Purpose

This document describes **who interacts with AST**, **what sits inside the trust boundary**, and **what deliberately stays outside the source of truth**. It is a C4-style **system context** view: actors, major systems, and hard legal/economic boundaries — not a deployment topology (see [`deployment.md`](./deployment.md)).

---

## 2. Actors

| Actor | Role toward AST |
|-------|-----------------|
| **Institution** | Submits confirmed valuation packages, КЭП-signed documents, process initiation; multi-node per org allowed (1 vote per cert). |
| **Validator nodes** | Executor / confirmer / observer roles; PoT quorum; mTLS + institutional certs on allowlist. |
| **Holders** | Own claims on reserves (ARO / asset tokens); internal transfer via PoT; partial release via full process. |
| **Ops / governance** | Kill-switch, release governance, node approval — not free mint authority. |
| **External oracles** | Attested external data transport only when process type requires; multi-oracle + signatures; **not** AST appraisal. |

---

## 3. Major systems

| System | Boundary | Responsibility |
|--------|----------|----------------|
| **Portal edge** (`portal/`) | Outside core economic engine | Human-facing institutional UX; auth, upload, status; **client of Orchestrator only**. |
| **AST core (NestJS)** | Inside trust boundary | Orchestrator, PoT, emission, aroscoin, reserve, commission, invariants, release, state-recording. |
| **NodeChain** | Sole economic **source of truth (SoT)** | Append-only immutable ledger; ExecutionSnapshot; write-ahead before emission. |
| **All-Seeing Eye** | Parallel observation plane | Observe, record, notify; **no veto, no rollback, no mint/burn/pay**. |
| **External oracles** | Outside SoT | Signed feeds via `oracle-gateway`; fail-closed if required and unavailable. |
| **ERC / representation adapters** | Outside SoT | ERC-20 / ERC-3643 / ERC-1400 (etc.) plugins only; never authoritative for mint or rights. |

---

## 4. Legal and economic boundaries

Per Core Canon §§I–II, §4.4, §X:

| AST **is** | AST **is not** |
|------------|----------------|
| Infrastructure for **recording and accompanying** tokenized rights | Holder of participants' funds (**forbidden**) |
| Selective custody of **own** funds only (reserves, commissions, own capitalization) | A **valuation body** (no self-appraisal) |
| Sovereign process token-economy with NodeChain + PoT as validity | A public L1 product chain or free-mint issuer |
| Adapter host for external token standards | A system where ERC state overrides NodeChain |

Any design that places participant funds in AST custody, lets Eye command economic state, or mints without PoT + NodeChain is a **canon violation**.

---

## 5. C4-style system context (text)

```
                         ┌──────────────────────────────────────┐
                         │     External / non-SoT plane         │
                         │  Oracles │ Bridges │ ERC adapters    │
                         └──────────▲───────────────▲───────────┘
                                    │ attested data │ representation only
┌────────────┐   mTLS/КЭП    ┌──────┴───────────────┴───────────┐
│ Institution│──────────────▶│     PORTAL EDGE (Next.js)        │
│  (browser) │  session JWT  │  auth · forms · own-process view │
└────────────┘               └──────────────┬──────────────────┘
                                            │ sole economic entry
┌────────────┐               ┌──────────────▼──────────────────┐
│  Holders   │◀── status ────│     AST CORE (NestJS, Node≥20)  │
└────────────┘               │  Orchestrator → PoT → Emission  │
                             │  ArosCoin · Reserve · Commission│
┌────────────┐   mTLS/roles  │  Invariants · Release · State   │
│ Validator  │──────────────▶│              │                  │
│   nodes    │  quorum PoT   └──────────────┼──────────────────┘
└────────────┘                              │ append-only SoT
                             ┌──────────────▼──────────────────┐
                             │     NODECHAIN (ledger SoT)      │
                             │  RocksDB primary · enc. at rest │
                             └──────────────▲──────────────────┘
                                            │ events (async)
                             ┌──────────────┴──────────────────┐
                             │   ALL-SEEING EYE (separate proc)│
                             │   observe · alert · no command  │
                             └─────────────────────────────────┘
```

---

## 6. Trust boundary summary

**Inside SoT / economic authority:** Orchestrator pipeline, PoT (`verified = 1`), NodeChain append, emission after write-ahead, selective custody books, I1–I9 guards.

**Edge, not SoT:** Portal UI and Portal API (may not call mint/settle/PoT directly).

**Observe-only:** Eye (separate process; analytic mirror lag ≤ 30s).

**Adapters only:** Any ERC or cross-chain representation; critical ops still require NodeChain + PoT (Canon §6.2–6.3).

---

## 7. Related documents

| Doc | Topic |
|-----|--------|
| [`data-flow.md`](./data-flow.md) | Tokenization, release, Eye flows |
| [`security-model.md`](./security-model.md) | Custody, mTLS, kill switch, invariants |
| [`deployment.md`](./deployment.md) | Envs, stack, CI |
| [`INSTITUTIONAL_PORTAL.md`](./INSTITUTIONAL_PORTAL.md) | Portal edge detail |
| [`docs/PORTAL.md`](../PORTAL.md) | Portal product architecture |
| Process packs | `docs/processes/primary-tokenization.md` |

If this document conflicts with Core Canon, **Core Canon wins**.
