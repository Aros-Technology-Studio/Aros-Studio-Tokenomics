# PURPOSE — `velocity-tracker`

**Status:** ready  
**Canon refs:** `docs/AST-CORE-CANON.md` §9.6, §9.7  
**Code path:** `src/velocity-tracker/`  
**Clarifications:** P4.16 real in v1; release + release-daemon consumers

---

## Why this exists

Computes **circulation velocity** used by Release Phase gates:

```
velocity = processVolume_24h / circulatingSupply
```

Feeds `release-daemon` (and `release`) so phase activation is metric-driven, not holder self-trigger.

---

## Responsibility

- Owns: 24h confirmed process volume intake, circulating supply input, velocity scalar (UTC windows).
- Contributes to: `ReleasePhase = (reserveIndex > threshold) ∧ (velocity > target)`.
- Does **not** own: reserveIndex formula, phase state machine, governance approval, mint supply invent.

---

## Boundary (must not)

- Must not invent volume without confirmed-process inputs.  
- Must not report “target met” when inputs incomplete (fail closed / velocity 0).  
- Must not flip Release Phase itself (daemon + release + governance).  
- Must not use non-UTC ambiguous windows as sole production rule.

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Formula §9.6 exactly | Ad-hoc velocity proxies without canon |
| Window 24h UTC | Rolling undefined TZ |
| Deterministic from NodeChain-derived inputs (target) | Unreproducible off-chain only SoT |
| Incomplete supply → no false positive phase (velocity 0 / fail closed) | “Assume supply” |
| Decimal-safe math | IEEE float as sole ledger money path |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| `nodechain` / processes | source of confirmed volume |
| `aroscoin` | circulating supply |
| `release-daemon` | primary consumer |
| `release` | phase gates |
| `reserve` | peer metric (reserveIndex) |
