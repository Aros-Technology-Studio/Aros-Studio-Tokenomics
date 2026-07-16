# Deployment

**Status:** Architecture — aligned to Core Canon v1.0 + P0–P4 + Build Schedule  
**Canon:** [`docs/AST-CORE-CANON.md`](../AST-CORE-CANON.md)  
**Parent:** [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)  
**Schedule:** [`docs/BUILD_SCHEDULE.md`](../BUILD_SCHEDULE.md)

---

## 1. Purpose

Runtime **environments**, **process topology**, **data stores**, **CI protection**, and honest limits on production deployment. No fictional vendor prod claims.

---

## 2. Environments

Core Canon §XII:

| Env | Intent | Economic effects |
|-----|--------|------------------|
| **local** | Developer workstation | Fixtures; kill-switch optional for DX |
| **test** | CI and unit/integration | Isolated stores; no external money movement |
| **sandbox** | Institutional dry-run | Realistic pipelines; example feeRate (e.g. 0.15%); Eye disable allowed |
| **prod** | Live institutional processes | Full fail-closed; Eye on; kill-switch available |

- Clock **UTC only** in every environment.  
- `release.threshold` / `release.target` are environment-scoped (not magic numbers as sole SoT).  
- Eye disable **non-prod only**. Sandbox must not share NodeChain primary volumes with prod.

---

## 3. Runtime stack

| Layer | Technology | Notes |
|-------|------------|--------|
| Language / runtime | **TypeScript**, **Node ≥ 20** | Project minimum |
| Economic core | **NestJS** | Orchestrator, PoT, emission, ledger, invariants |
| Portal edge | **Next.js** under `portal/` | Institutional UX; Orchestrator client only |
| Money math | **decimal.js** | 9 dp ARO / dust 1e-9 |
| ERC / chain | Adapters only (`src/adapters/`) | Not SoT |

Core and portal may share language; they remain **separate deployable surfaces**.

---

## 4. Process topology (logical)

```
┌─────────────────────┐     ┌──────────────────────────────┐
│  portal (edge)      │────▶│  AST core NestJS             │
│  Next.js + Portal   │     │  Orchestrator + domain mods  │
└─────────────────────┘     └──────────────┬───────────────┘
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
            ┌───────────────┐    ┌─────────────────┐    ┌────────────────┐
            │ NodeChain     │    │ Postgres        │    │ All-Seeing Eye │
            │ RocksDB pref. │    │ index mirror    │    │ separate proc  │
            │ enc. at rest  │    │ (not SoT)       │    │ + analytic mir.│
            └───────────────┘    └─────────────────┘    └────────────────┘
```

| Process | Deploy rule |
|---------|-------------|
| **Core / Orchestrator** | Sole economic entry; kill-switch gate |
| **NodeChain / ledger** | Primary **RocksDB preferred**; co-located binary OK (P4: one binary) |
| **All-Seeing Eye** | **Separate process**; NodeChain feed + mirror (lag ≤ 30s) |
| **release-daemon** | Tick consuming reserveIndex + velocity |
| **Portal** | Edge only; no direct ledger write authority |

Validator nodes: institutional mTLS participants — not necessarily co-located containers.

---

## 5. Data stores

| Store | Role | Security |
|-------|------|----------|
| **RocksDB (preferred)** | NodeChain append-only SoT | Encryption at rest for sensitive payloads |
| **Postgres** | Index / query **mirror only** | Rebuildable; never alternate SoT |
| **Eye analytic mirror** | Ops analytics | Lag ≤ 30s; read-oriented |

No sharding in v1. Institution reads: **own processes only**.

---

## 6. CI and protective automation

| Mechanism | Role |
|-----------|------|
| **GitHub Actions** (domain-invariants-guard, related workflows) | Block free/admin mint patterns; doc/code guardrails |
| **`npm run check:canon`** | Local/CI canon and invariant hygiene |
| **Jest** | Component + I1–I9 tests (P0) |
| **E2E / CLI smoke** | e.g. `npm run cli tokenize` where scheduled |

CI fails closed on known violations; it does not replace runtime write-path invariants.

---

## 7. Production deploy status (honest)

Per Build Schedule Phase **5 — Hardening & Production**:

| Item | Status |
|------|--------|
| Kill-switch / read-only | In core path (phase work) |
| Protective CI / invariant guards | Active |
| CLI / e2e scaffolding | Partial / in schedule |
| **Prod deploy runbook, hosting, secrets, multi-region HA** | **TBD** — not claimed complete |
| Formal external audit | Prep until Phase 5 closes |

Amend this file when prod topology is ratified.

---

## 8. Eye as separate deployment target

Eye runs **outside** the core command plane. Inputs: NodeChain + module events. Outputs: alerts, reason-coded records, analytic mirror. **Forbidden:** mint/burn/pay/veto/rollback into core. Non-prod may disable Eye; executing modules keep fail-closed. In-process Eye inside Orchestrator blurs observe vs command — avoid.

---

## 9. Operational defaults (deploy-relevant)

From §XII / packs: PoT 15m; step 5m; process 30m; suspend grace 24h; commission 70/30; max 10 concurrent processes/institution; kill switch **yes**. Economic parameter changes that alter canon defaults need governance/canon process.

---

## 10. Related documents

| Doc | Topic |
|-----|--------|
| [`system-context.md`](./system-context.md) | Actors and SoT boundary |
| [`security-model.md`](./security-model.md) | mTLS, kill switch, encryption |
| [`data-flow.md`](./data-flow.md) | Runtime data paths |
| [`docs/WORKFLOWS.md`](../WORKFLOWS.md) | Workflow and env notes |
| [`docs/ROADMAP.md`](../ROADMAP.md) | Phase 5 hardening |

If this document conflicts with Core Canon, **Core Canon wins**.
