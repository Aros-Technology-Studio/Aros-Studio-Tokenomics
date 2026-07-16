# PURPOSE — `emission`

**Status:** ready  
**Canon refs:** `CANON.md` §V, §VI.4–6.5, §IX.10, §XI I1 I2 I9  
**Code path:** `src/emission/`  
**Clarifications:** P1.7 canonical v1

---

## Why this exists

Computes **how much** ARO to mint or burn from **institutional valuation + confirmed ΔValue**, only after PoT, and invokes `aroscoin.mint` / burn paths deterministically from NodeChain inputs. Does **not** appraise assets.

---

## Responsibility

- Owns: valuation+ΔValue amount math, floor rounding to 9 decimals, per-asset-class caps, pro-rata distribution calculation (I9), deterministic replay, calling aroscoin after PoT, zero-emit or burn policy hooks.
- Contributes to: supply changes bound to processId.
- Does **not** own: PoT verdicts, institutional valuation creation, admin mint, old α·TV+β·U+γ formula.

---

## Boundary (must not)

- Must not use deprecated `T_E = α·TV + β·U + γ` as live formula.  
- Must not mint without successful PoT + NodeChain prerequisites.  
- Must not change emission parameters outside canon+governance.  
- Must not invent asset prices (accepts institutional inputs only).

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Inputs: institutional valuation + ΔValue | System self-appraisal |
| Formula model = valuation + ΔValue only | Live αTV+βU+γ |
| Output in **ARO** (9 dp floor to arx) | Unspecified rounding |
| Strictly deterministic from NodeChain | Non-replayable side channels |
| Caps configurable per asset class | Uncapped silent mint |
| Call `aroscoin.mint` after PoT | DTO-only without mint call |
| Zero ΔValue → emit zero or burn per asset policy | Reject-only as sole path |
| Param change: canon + governance only | Hot admin knobs without governance |
| Pro-rata computed **here**, then mint | Push pro-rata solely into aroscoin |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| `pot` | gate verified=1 |
| `aroscoin` | mint/burn execution |
| `reserve` | locks as required by mint path |
| `nodechain` | replay inputs |
| `invariants` | I1 I2 I9 |
