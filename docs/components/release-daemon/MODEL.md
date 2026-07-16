# MODEL — `release-daemon`

**Status:** ready  
**Canon refs:** `docs/AST-CORE-CANON.md` §9.7; release pack

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| DaemonConfig | threshold + target | config / env keys |
| TickResult | met, activated, metrics snapshot | per poll |
| InitiationAttempt | call into release | time + metrics |

---

## States and lifecycle

```
poll (UTC):
  reserveIndex = reserve.reserveIndex()
  velocity = velocityTracker.velocity()
  met = (reserveIndex > threshold) ∧ (velocity > target)
  if !met → { met:false, activated:false }
  if met → release.activateFromDaemon(metrics)
       → success: activated=true
       → governance/reject: activated=false, met=true
```

Daemon does not store phase as SoT; `release` + NodeChain do.

---

## Invariants

| ID | Invariant | Effect if violated |
|----|-----------|--------------------|
| I8-related | phase flip only through release + ledger rules | reject off-ledger flip |
| local | activated implies release accepted | never report false activated |
| local | thresholds from config | no silent sole hardcode |

---

## Formulas / constants

```
ReleasePhase_eligible = (reserveIndex > release.threshold) ∧ (velocity > release.target)
```

```
reserveIndex = log10(1 + totalProcessVolume)   // owned by reserve
velocity = processVolume_24h / circulatingSupply  // owned by velocity-tracker
```

Config keys only for numeric thresholds in v1.  
Env mapping example (implementation detail): `RELEASE_THRESHOLD`, `RELEASE_TARGET`.

---

## Anti-scope

- Partial-release of single asset positions.  
- Eye veto/rollback.  
- Holder self-trigger of phase.  
