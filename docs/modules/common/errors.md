# Common — Errors

**Code:** `src/common/errors` (`error-codes.ts`, `ast-error.ts`)  
**Decisions:** P2–P3 common — centralized catalog + reason codes  

---

## Purpose

Provide a single catalog of machine-readable error codes shared across modules so fail-closed paths are consistent in APIs, logs, and Eye observations.

Common defines **codes and envelope types**. Domain modules decide **when** to throw; common does not evaluate PoT or invariants.

---

## AstErrorCode (v1 catalog)

| Code | Typical use |
|------|-------------|
| `INVALID_AMOUNT` | Money amount unusable |
| `INVALID_DECIMAL` | decimal parse failure |
| `INVALID_INSTITUTION_CODE` | processId institution segment |
| `INVALID_PROCESS_ID` | Malformed processId |
| `INVALID_INPUT` | Generic validation |
| `INVARIANT_BROKEN` | Write-path invariant assert |
| `POT_NOT_VERIFIED` | Economic op without verified=1 |
| `POT_CRITERIA_FAILED` | P1–P4 failure |
| `POT_EXPIRED` | 15m timeout |
| `POT_DOUBLE_CONFIRM` | Second confirm after terminal |
| `NODECHAIN_APPEND_UNAUTHORIZED` | Writer denied |
| `NODECHAIN_APPEND_FAILED` | Store/validation fail |
| `QUALIFIED_SIGNATURE_REQUIRED` | Missing/invalid КЭП/signature |
| `IDEMPOTENCY_CONFLICT` | Idempotency key clash |
| `INSUFFICIENT_RESERVE` | Reserve lock/bag shortfall |
| `ADMIN_MINT_FORBIDDEN` | Privileged mint attempt |
| `KILL_SWITCH_ACTIVE` | Read-only / kill switch |

Catalog expands as modules land; **do not** introduce banned yield vocabulary in code names.

---

## Related type aliases

```
PotCriteriaId = 'P1' | 'P2' | 'P3' | 'P4'
InvariantId   = 'I1' | … | 'I9'
```

Reason codes for criteria failures are partial maps from `PotCriteriaId` to strings (pot DTO). Invariant registry may use versioned ids `I-ID-vX.Y` at the invariants module layer.

---

## Envelope expectations

`AstError` (or equivalent) should carry:

| Field | Meaning |
|-------|---------|
| code | `AstErrorCode` |
| message | Human-readable (English in logs) |
| details | Optional structured context (processId, criterion, …) |
| cause | Optional nested error |

HTTP/gRPC mapping is owned by API layers (`core-api`, portal), not by inventing new economic codes per edge.

---

## Fail-closed usage

| Principle | Practice |
|-----------|----------|
| Prefer explicit codes | Avoid bare `Error('fail')` on economic paths |
| Eye visibility | Critical rejects should be observable with reason codes |
| No silent coercion | Invalid decimal → error, not `0` mint |

---

## Forbidden error designs

| Anti-pattern | Why |
|--------------|-----|
| `YIELD_CLAIM_FAILED` | Banned vocabulary / product |
| Swallowing `POT_NOT_VERIFIED` into success | Free mint risk |
| Eye-only “soft error” that still mints | Eye has no economic power |

---

## Versioning

New codes may be added. Removing codes in v1 is discouraged (deprecate-not-delete for public surfaces).
