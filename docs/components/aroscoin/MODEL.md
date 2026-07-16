# MODEL — `aroscoin`

**Status:** ready  
**Canon refs:** `CANON.md` §VI, §9.10, §XI

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| ArosCoin unit | Protocol token ARO | base unit `arx`, 1 ARO = 10^9 arx |
| Claim | Process-bound position | `processId` (primary) + `claimId` |
| MintEvent | Supply increase | processId + NodeChain id |
| BurnEvent | Supply decrease | processId + NodeChain id |
| TransferEvent | Permissioned internal move | processId (PoT-gated) |
| RateInput | Institutional valuation input | attested package ref |

---

## States and lifecycle

```
mint (after PoT + emission + reserve lock + NodeChain record)
  → held (internal roles until Release Phase)
  → transfer_internal (permissioned, PoT)
  → burn (revaluation down / remint path / settlement)
  → remint (new processId) for reassignment
```

Partial split: by **amount** with configurable **min dust**.

Optional **expiry** on claim per asset policy (not global-required).

---

## Invariants

| ID | Invariant | Effect if violated |
|----|-----------|--------------------|
| I2 | emission/burn bound to confirmed process | fail closed |
| I7 | token reflects confirmed value (via process-bound supply rules) | fail closed |
| I8 | pre-Release circulation internal only | block external regime |
| I9 | new emission pro-rata holders | fail closed if non-pro-rata path |
| local | no double mint same process/claim keys | both TS + Solidity fail closed |
| local | no admin mint | reject forever |

---

## Formulas / constants

| Constant | Value |
|----------|-------|
| SYMBOL | ARO |
| DECIMALS | 9 |
| BASE_UNIT | arx (1 ARO = 10^9 arx) |

Supply change principle (`CANON.md` §9.10) is applied by emission/tokenomics using institutional ΔValue; aroscoin executes mint/burn results, does not invent valuation.

```
# conceptual (emission-owned math; aroscoin executes)
new_supply = current_supply × (1 ± ΔValue / previous_value)
# distribution: pro-rata current holders (I9)
```
