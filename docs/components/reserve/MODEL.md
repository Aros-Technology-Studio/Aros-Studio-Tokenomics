# MODEL — `reserve`

**Status:** ready  
**Canon refs:** `CANON.md` §4.4, §9.2, §9.7

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| ReserveBag | AST-owned multi-asset pool | bagId |
| ClaimAllocation | Slice of bag tied to process/claim | claimId + processId |
| Lock | Hard lock before mint | lockId, bagId, amount |
| ChildReleaseRecord | Immutable partial release history | parentId + childId |
| RateSnapshot | Asset↔arx rate at PoT | processId + timestamp |
| ReserveIndex | Capitalization metric | derived |

---

## States and lifecycle

```
available → locked → allocated (claims)
allocated → partial_release → child records + remaining parent
allocated → full_release → closed
```

Insufficient available for requested lock/mint → **hard fail** (terminal for that attempt).

---

## Invariants

| ID | Invariant | Effect if violated |
|----|-----------|--------------------|
| I6 | Only AST own funds | fail closed / reject third-party custody ops |
| local | sum(claim allocations) ≤ bag capacity under locks | hard fail |
| local | reserveIndex only from confirmed process volume | reject free set |
| local | primary truth in NodeChain | Solidity divergence → reconcile to NodeChain |

---

## Formulas / constants

```
reserveIndex = log10(1 + totalProcessVolume)
```

`totalProcessVolume` from confirmed processes only (`CANON.md` §9.2).

Release Phase uses `reserveIndex > threshold` with velocity (`CANON.md` §9.7) — owned jointly with `release_daemon` / `velocity_tracker`.

Asset types (v1): **fiat**, **crypto**, **institutional claims** (multi).
