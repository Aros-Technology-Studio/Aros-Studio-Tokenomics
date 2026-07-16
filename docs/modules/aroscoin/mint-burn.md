# ArosCoin — Mint and Burn

**Code:** `src/aroscoin`  
**Canon:** §VI.4, §III.5, I1–I2, I7  
**Decisions:** P0 aroscoin  

---

## Hard gates (mint)

Mint is allowed **only** when all hold:

1. PoT `verified = 1` for `processId`  
2. NodeChain record of that confirmation exists (height/hash)  
3. Emission (or other canon-approved planner) supplied amount DTO  
4. Required reserve lock proof present where process type demands it  
5. Write-path invariants pass (I1, I2, …)  
6. No kill-switch / read-only mode  

**Privileged / admin mint is forbidden forever.**

---

## Hard gates (burn)

Burn occurs on:

- Confirmed **decrease** in asset value (emission plan burn path)  
- Reassignment flows that require **burn + remint** (no silent reassign)  
- Release / partial-release paths that atomize burn with reserve child records  

Burn still requires process confirmation and NodeChain recording. Burn without process binding violates I2.

---

## Ordering (ack rule)

```
plan (emission) → assert invariants → execute mint/burn in TS core
  → NodeChain append success
  → only then client ack
  → optional adapter mirror (never reverse order for SoT)
```

If NodeChain write fails → **no client ack**. Never ack first.

---

## Binding fields

| Field | Rule |
|-------|------|
| `processId` | Primary; every mint/burn |
| `claimId` | Allocation / claim identity |
| Amount | From emission plan; floor to 9 decimals |
| Valuation/rate ref | Institutional input reference, not AST appraisal |

---

## Double-mint protection

- Guard in TypeScript accounting path.  
- Guard on Solidity / adapter path when representation mint is used.  
- Second mint for same process+claim economic intent → fail closed (`AroDoubleMintRejected` class behavior).  
- Reassignment = **burn then remint** under new process rules — not balance rewrite.

---

## Transfer (internal)

- Internal participant transfer is permissioned and must pass **PoT** for significant rights movement.  
- Pre-Release: external free transfer blocked.  
- Dust below minimum on split → reject or coalesce per config (min dust 1e-9 ARO).

---

## Interaction with emission

Emission **computes** amounts and pro-rata map, then **calls** `aroscoin.mint` / burn path.  
ArosCoin does not invent ΔValue or pro-rata weights; it enforces gates and records supply changes.

Special policy: if mint succeeded and settlement later fails → **retry settlement** (do not burn-compensate mint) — canon §XII.

---

## Failure matrix

| Condition | Behavior |
|-----------|----------|
| Mint without PoT/emission | Reject forever |
| Admin mint attempt | Reject forever (`ADMIN_MINT_FORBIDDEN`) |
| Double mint | Fail closed |
| Reassign without burn+remint | Reject |
| NodeChain write fail | No client ack |
| Transfer without PoT / pre-Release external | Reject |
| Insufficient reserve lock | Hard fail (`INSUFFICIENT_RESERVE`) |

---

## Events

| Event | When |
|-------|------|
| `AroMinted` | After NodeChain append |
| `AroBurned` | After NodeChain append |
| `AroTransferred` | Permissioned internal after rules |
| `AroDoubleMintRejected` | Guard trip |
