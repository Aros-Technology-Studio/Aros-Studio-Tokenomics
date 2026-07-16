# Orchestrator — saga compensation

**Module:** `orchestrator`  
**Canon:** Core Canon §XII (`Compensation after verified = 1` = not compensatable)  
**Decisions:** P2 orchestrator; cross-cutting defaults  
**Pack:** `docs/components/orchestrator/MODEL.md`, `PURPOSE.md`

---

## Purpose

Compensation is the Orchestrator’s **ordered reverse** of completed pipeline steps when a process fails **before** PoT finalizes `verified = 1`.

It exists so partial technical progress does not leave dangling half-states for unconfirmed processes.

It is **not**:

- All-Seeing Eye veto or rollback  
- A way to undo confirmed economic value  
- A substitute for NodeChain immutability  
- Burn-compensation after a successful mint when only settlement fails  

---

## Hard boundary: `verified = 1`

```text
verified ≠ 1  →  compensation saga ALLOWED (reverse completed pre-confirm steps)
verified = 1  →  compensation FORBIDDEN for economic finality of that PoT
```

| Phase | Compensation |
|-------|----------------|
| Before PoT positive verdict | Yes — reverse prior successful steps in reverse order |
| After `verified = 1` | **No** — process outcome is not compensatable as a saga undo |
| Mint OK, settlement fail | **Retry settlement** only; do **not** burn the mint to “compensate” |

Rationale: PoT is the sole gate for origin/change of value (Canon §4.2, I1). Once value is confirmed, undoing via orchestrator saga would violate canon and confuses audit truth on NodeChain.

---

## Saga shape

```text
StartProcess → S1 → S2 → … → Sk  (failure at step k+1)
                ↓
        ProcessCompensating
                ↓
        reverse(Sk) → … → reverse(S1) as defined per step
                ↓
        ProcessFailed (terminal)
```

### Properties

1. **Only completed steps** are compensated — not steps that never succeeded.  
2. **Reverse order** — last success first.  
3. **Step-owned reverse** — Orchestrator coordinates; each step owner implements its own safe reverse API when applicable.  
4. **No silent partial success** — caller sees terminal `failed` (or `expired`) after compensation attempt policy.  
5. **Idempotent compensate** where practical — double compensate must not invent new economic side-effects.  

---

## What can be compensated (pre-verified)

Typical pre-PoT / pre-finalization work:

| Completed step | Compensation intent |
|----------------|---------------------|
| StartProcess bookkeeping | Release concurrent slot; mark process failed/expired; no economic mint to reverse |
| Document intake | Mark docs rejected/abandoned; no valuation change |
| Oracle accept (if recorded before PoT) | No “un-oracle” of external world; mark process expired; ledger remains append-only (compensating state is process terminal + reason codes, not delete) |
| Partial internal prep short of mint | Undo provisional internal holds only if they exist and are not confirmed value |

**Append-only NodeChain:** compensation does **not** delete records. It appends compensating / terminal records (`process_failed`, compensation markers) so history remains reconstructible.

---

## What must not be compensated via saga

| Situation | Correct action |
|-----------|----------------|
| `verified = 1` already written | No saga undo of value |
| Emission/mint after PoT | Not saga-burned because settlement failed |
| Settlement failure after mint | Retry `settleCommission` / distribute path |
| Eye-detected anomaly | Alert ops; executing module fail-closed; **no** Eye-driven rollback |
| Governance reverse of Release Phase | Separate governance + NodeChain path — not this saga |
| Holder “undo my tokenization” | New process under product rules if any; not silent reverse |

---

## Interaction with timeouts

| Timeout | Default | Compensation |
|---------|---------|--------------|
| Per-step | 5 minutes | Fail step → compensate completed prior steps if still pre-`verified=1` |
| Process wall clock | 30 minutes | Fail process → same rule |
| PoT confirmation | 15 minutes | Expired → new `processId`; no emission |

Timeout expiry is a **failure path**, not a privileged override of the `verified = 1` boundary.

---

## Events (pack)

| Event | Meaning |
|-------|---------|
| `ProcessCompensating` | Saga reverse in progress |
| `ProcessFailed` | Terminal fail after compensate (or fail without compensable work) |
| `ProcessEnded` | Success terminal (`completed`) — not a compensation event |

---

## Explicit non-equivalence

```text
Compensation saga  ≠  Eye rollback
Compensation saga  ≠  Database delete of NodeChain history
Compensation saga  ≠  Admin privileged unmint after PoT
```

Eye **observes** compensation events; it does **not** authorize or execute them.

---

## Acceptance checks (documentation)

- [x] Compensation only before `verified = 1`  
- [x] Mint+settle-fail → retry settle, no burn-compensate  
- [x] Compensation ≠ Eye veto/rollback  
- [x] Reverse order of completed steps  
- [x] Append-only ledger preserved  

Implementation checkboxes remain in `docs/components/orchestrator/ACCEPTANCE.md`.  
