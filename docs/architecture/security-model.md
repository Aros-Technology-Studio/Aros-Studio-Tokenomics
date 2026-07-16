# Security Model

**Status:** Architecture — aligned to Core Canon v1.0 + P0–P4  
**Canon:** [`docs/AST-CORE-CANON.md`](../AST-CORE-CANON.md)  
**Parent:** [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)  
**Principle:** [`docs/principles/ANTI_POLICE.md`](../principles/ANTI_POLICE.md)

---

## 1. Purpose

AST security is **structural**: selective custody, identity and allowlists, fail-closed write paths, machine invariants, and an observe-only Eye. This document maps those controls to architecture. It is **not** a compliance manual or enforcement playbook.

---

## 2. Selective Custody (own funds only)

Core Canon §4.4, §X; invariant **I6** (canon): *AST holds only its own funds.*

| Allowed | Forbidden |
|---------|-----------|
| Reserves booked for tokenized rights under AST protocol | Holding participants’ third-party cash or assets as custodian |
| Commission pool / AST share of fees | Omnibus custody of client wallets |
| Own capitalization | “Escrow all user funds in AST” designs |

**Machine rules:** reserve and settlement modules treat AST books as own-funds only; third-party custody paths are rejected fail-closed. Product language must not promise custody of client funds.

---

## 3. Identity, transport, and allowlists

### 3.1 Institutional and node identity

| Control | v1 rule |
|---------|---------|
| **КЭП / X.509** | Qualified e-signature on institutional packages; node cert + key pair |
| **Allowlist** | Manual approval; process initiation requires allowed architectural context (PoT **P1**) |
| **mTLS** | Node and institutional edge authentication; signed challenges |
| **JWT** | Internal / browser session only — **not** a substitute for node-edge cert auth |
| **Votes** | Multi-node per institution → **1 vote per institutional certificate** |

### 3.2 Portal edge

Portal uses mTLS + institutional cert at the trust edge; short-lived session JWT after login for browser UX. Portal **must not** expose direct mint/settle/PoT APIs that bypass Orchestrator.

### 3.3 Roles

Fixed node roles: **executor**, **confirmer**, **observer**. Suspend path: reputation + quorum exclude + 24h grace — **no slashing** of third-party funds (consistent with selective custody).

---

## 4. Kill switch / read-only mode

| Item | Rule |
|------|------|
| Presence | **Yes** in v1 (Core Canon §XII) |
| Effect | Blocks **new economic side-effects** (orchestrator gate) |
| Scope | Read-only / maintenance posture; does not invent compensation after `verified = 1` |
| Governance | Ops-controlled; not Eye-controlled |

Kill switch is a **safety brake**, not a free-mint or rollback authority.

---

## 5. Fail-closed default

Every critical write path asserts invariants and gates **before** side-effects.

| Failure | Outcome |
|---------|---------|
| PoT criterion or quorum fail | `verified ≠ 1`; no emission |
| NodeChain append fail | no emission |
| Required oracle fail | process expired |
| Invariant breach | fail-closed + NodeChain record where applicable; **no** Eye veto/rollback |
| Settlement after successful mint | **retry settle**; do not burn-compensate |

Compensation saga is allowed **only before** `verified = 1`. After positive PoT + ledger, economic truth is retained (Canon §XII).

---

## 6. Invariants I1–I9 as security properties

Authoritative text: Core Canon **§XI**. Below: security/enforcement reading used by write-path guards and CI.

| ID | Canon statement | Security property |
|----|-----------------|-------------------|
| **I1** | Value arises only when `verified = 1` (PoT) | No economic value without positive PoT gate |
| **I2** | Every emission / burn bound to a confirmed process | No orphan mint/burn; processId linkage mandatory |
| **I3** | Every significant event recorded in NodeChain | No “silent” economic mutation; write-ahead SoT |
| **I4** | Determinism: same input → one result | Replayable pipeline; dual confirm rejected |
| **I5** | What is earned is retained; no speculative holding | No staking/farming/passive yield paths |
| **I6** | AST holds only its own funds | Selective custody enforced in reserve/settlement |
| **I7** | Token always reflects current confirmed asset value | Supply changes only via confirmed revaluation processes |
| **I8** | Until Release Phase, internal roles only | Pre-phase block: free external transfer, CEX, public trading |
| **I9** | New emission pro-rata to current holders | Revaluation distribution cannot favor privileged accounts |

Architecture checklist (operational guards in `docs/ARCHITECTURE.md` §7) elaborates write-path checks (e.g. no free mint, Eye non-command, ERC adapter not SoT). Those **implement** canon invariants; they do not replace §XI wording. New invariants require formal canon update (semver).

API surface: `assertInvariant`, `checkAll`, `InvariantBroken` (`docs/components/invariants/`).

---

## 7. Eye: observe-only

| Allowed | Forbidden forever |
|---------|-------------------|
| Consume all significant events | Veto of PoT or pipeline |
| Async batch + critical sync alerts | Rollback of NodeChain or balances |
| Reason-coded violation records | Mint, burn, pay, initiate process |
| Analytic mirror (lag ≤ 30s) | Acting as economic SoT |

Eye deploys as a **separate process**. Disabling Eye is non-prod only and never replaces module fail-closed.

---

## 8. Encryption and data protection

| Layer | Requirement |
|-------|-------------|
| **NodeChain** | Encryption at rest for sensitive payloads (P1 nodechain decision) |
| **State-recording** | Encrypt sensitive fields before write; no redaction after append |
| **Institution query** | Own-process scope only |
| **Hashes** | Content hashes + `processId` chaining; immediate immutability |

Postgres (if used) is an **index mirror only** — not an alternative SoT and not a place to store cleartext that NodeChain forbids.

---

## 9. Token protocol and adapter risk

AST Token Protocol: **Canonical Layer** = NodeChain + PoT. ERC-20 / ERC-3643 / ERC-1400 / bridges are **representation adapters** (`src/adapters/`). Security rule: adapter compromise must not authorize mint/burn/transfer of rights without NodeChain + PoT. Privileged mint is **forbidden forever**.

---

## 10. Related documents

| Doc | Topic |
|-----|--------|
| [`system-context.md`](./system-context.md) | Trust boundaries |
| [`data-flow.md`](./data-flow.md) | Economic and Eye flows |
| [`deployment.md`](./deployment.md) | Env isolation, CI guards |
| `docs/components/invariants/` | Machine predicates |
| `docs/components/all-seeing-eye/` | Eye contract |

If this document conflicts with Core Canon, **Core Canon wins**.
