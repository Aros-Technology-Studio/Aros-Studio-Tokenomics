# PURPOSE — `reserve`

**Status:** ready  
**Canon refs:** `CANON.md` §4.4, §IX.2, §XI I6  
**Code path:** `src/reserve/`  
**Clarifications:** P0.3 canonical v1

---

## Why this exists

Tracks **AST’s own** funds and capitalization from confirmed work under selective custody. Supports accounting for multi-asset reserve and `reserveIndex` used by Release Phase.

---

## Responsibility

- Owns: AST books for reserve (fiat + crypto + institutional claims), bag-level accounting across many claims, locks before mint, child records on partial release, `reserveIndex`, hard fail on insufficient funds.
- Contributes to: snapshot rate at PoT for unit/arx correspondence; contract hard lock as representation mirror.
- Does **not** own: third-party customer custody, public institutional API (v1), primary business truth in Solidity.

---

## Boundary (must not)

- Must not hold participants’ third-party funds (`CANON.md` §4.4, §X).  
- Must not use external Anchor as v1 home of reserve.  
- Must not treat Solidity as primary ledger of truth.  
- Must not soft-queue mint when reserve insufficient (hard fail).  
- Must not erase history on partial release (use child records).

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Multi-asset (fiat + crypto + institutional claims) | Customer custody |
| AST books only in v1 | External Anchor as primary |
| Both asset units and arx + snapshot rate at PoT | Unlocked mint against empty bag |
| One bag, many claims, precise accounting | Silent reallocation without records |
| Reserve service lock + contract hard lock | Orchestrator-only soft lock |
| Child records on partial release | Mutate single row without history |
| Hard fail if insufficient | Queue / Eye veto |
| Internal API only (v1) | Public institution API in v1 |
| NodeChain/TS primary; Solidity mirror | Solidity as source of truth |
| `reserveIndex = log10(1 + totalProcessVolume)` | Free-authority index set |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| `aroscoin` | mint/burn accounting vs bag |
| `pot` | snapshot timing at confirmation |
| `emission` | amounts that may affect reserve accounting |
| `release` / `release_daemon` | reserveIndex for Release Phase |
| `nodechain` | primary record |
| representation adapters | Solidity mirror/lock |
