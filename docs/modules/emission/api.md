# Emission — API

**Code:** `src/emission` (`EmissionService`)  
**Canon:** §9.10, I9  
**Order:** PoT + NodeChain → plan → aroscoin.mint/burn  

---

## Conceptual operations

### planEmission

Build a deterministic `EmissionPlan` from institutional valuation / ΔValue and holder snapshot.

**Requires**

- `processId` with PoT `verified = 1`  
- ValuationInput / ΔValue package  
- asset class policy (caps, zero-Δ)  
- holder set for I9 when minting new emission  

**Returns:** plan (totals, pro-rata map, input refs) — not yet executed.

### executeEmission

Execute plan: call `aroscoin.mint` / burn for each leg; ensure NodeChain recording via aroscoin path.

**Rejects** if plan stale, caps fail, or pot no longer valid.

### getPlan / getPlanByProcessId

Read planned or executed plan for audit/replay.

---

## Events

| Event | Meaning |
|-------|---------|
| `EmissionPlanned` | Deterministic plan ready |
| `EmissionExecuted` | After aroscoin success |
| `EmissionCapped` | Cap blocked execution |
| `EmissionZeroOrBurn` | Non-positive Δ policy path |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| No PoT | Reject |
| Cap exceeded | Reject / fail closed |
| Non-deterministic input gap | Reject |
| Param change without governance | Reject |
| aroscoin/NodeChain failure | Fail closed; no silent “planned = done” |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `pot` | verified gate |
| `nodechain` | inputs + records |
| `aroscoin` | mint/burn |
| `reserve` | as mint path requires |
| `invariants` | asserts |
| `common` | money (decimal.js), errors |

---

## Explicit non-APIs

| Forbidden | Reason |
|-----------|--------|
| `mintWithoutPot` | Free mint |
| `appraiseAsset` | AST does not appraise |
| `setAlphaBetaGamma` live mint model | Replaced by institutional + ΔValue |
| Eye-triggered execute | Observation only |

---

## Downstream note

Orchestrator sequences: after PoT/NodeChain, invoke emission, then settlement (`commission`). Mint success + settlement failure → **retry settlement**, do not burn-compensate mint (§XII).
