# Release daemon and velocity inputs

**Modules:** `release-daemon`, `velocity-tracker`  
**Code:** `src/release-daemon/`, `src/velocity-tracker/`  
**Canon:** §7.3 activation mechanism; §9.6 velocity; §9.7 Release Phase condition  
**Packs:** `docs/components/release-daemon/`, `docs/components/velocity-tracker/`  
**Decisions:** P4 — release_daemon real; velocity_tracker real  

---

## Role of release-daemon

The daemon **continuously tracks** eligibility metrics and **initiates** Release Phase transition when both conditions hold. It does **not**:

- Store phase as source of truth (that is `release` + NodeChain)  
- Self-activate without calling into `release`  
- Implement partial-release of single assets  
- Act as Eye veto  
- Allow holder self-trigger of phase  

---

## Tick algorithm

```text
poll (UTC):
  reserveIndex = reserve.reserveIndex()
  velocity     = velocityTracker.velocity()
  met = (reserveIndex > threshold) ∧ (velocity > target)

  if !met:
    return { met: false, activated: false, metrics }

  // eligible — initiate
  result = release.activateFromDaemon(metrics)
  if success:
    return { met: true, activated: true }
  else:
    // governance pending / reject / not yet committed
    return { met: true, activated: false }
```

| Entity | Meaning |
|--------|---------|
| DaemonConfig | threshold + target from config/env |
| TickResult | met, activated, metrics snapshot |
| InitiationAttempt | Call into release with time + metrics |

---

## Configuration

| Key | Meaning |
|-----|---------|
| `release.threshold` | reserveIndex must be **greater than** this |
| `release.target` | velocity must be **greater than** this |

Numeric values: **config-only** in v1 (example env: `RELEASE_THRESHOLD`, `RELEASE_TARGET`). Code must not hard-code production thresholds as the sole source of truth.

---

## Velocity tracker

**Code:** `src/velocity-tracker/`  
**Formula (Canon §9.6):**

```text
velocity = processVolume_24h / circulatingSupply
```

| Entity | Meaning |
|--------|---------|
| ProcessVolume24h | Sum of confirmed process volume in last **24 hours UTC** |
| CirculatingSupply | Protocol circulating ARO (or defined unit) |
| Velocity | Derived scalar |

### Rules

| Rule | Effect |
|------|--------|
| `circulatingSupply ≤ 0` | Velocity treated as **0** (phase eligibility cannot become true via velocity) |
| Negative volume | Reject |
| Window | 24h, UTC only |
| Phase state | **Not** stored in tracker |

### Lifecycle

```text
ingest volume series (confirmed processes)
ingest / set circulatingSupply
  → velocity = processVolume_24h / circulatingSupply
  → release-daemon.tick() reads velocity
```

Tracker is not reserveIndex, not phase activation, not a trading venue.

---

## reserveIndex input

Owned by **reserve** module:

```text
reserveIndex = log10(1 + totalProcessVolume)
```

Daemon reads; does not recompute ad-hoc alternate formulas.

---

## Initiation vs activation

```text
met (metrics)     = daemon observation
activated         = release module accepted transition (governance + NodeChain as required)
```

| Report | Meaning |
|--------|---------|
| `met=false` | Not eligible |
| `met=true, activated=false` | Eligible but not yet activated (governance, timing, reject) |
| `met=true, activated=true` | Phase activation accepted |

`activated` must never be reported true unless release accepted (local invariant).

---

## Invariants

| ID | Invariant | Effect if violated |
|----|-----------|--------------------|
| I8-related | Phase flip only through release + ledger rules | Reject off-ledger flip |
| local | activated ⇒ release accepted | Never false activated |
| local | Thresholds from config | No silent sole hardcode |
| velocity local | supply ≤ 0 ⇒ velocity 0 | Fail closed on “met” via velocity |

---

## Interaction with gates

Daemon eligibility does not open CEX listing by itself. After activation:

1. `release` state becomes Active  
2. Gates allow external actions **with compliance**  
3. Pre-activation attempts remain denied  

See [release-phase.md](./release-phase.md).

---

## Anti-scope

| Out of scope | Owner if any |
|--------------|--------------|
| Partial-release of positions | `partial-release` |
| Eye veto/rollback | Forbidden |
| Holder self-trigger of phase | Forbidden |
| Computing institutional valuation | Forbidden (AST does not appraise) |
| Mint on phase flip | Phase is circulation regime, free emission is forbidden |

---

## Operational notes

- Poll interval: deployment config (must be continuous enough for product SLO; not specified as economic law).  
- Clock: **UTC only**.  
- Environments: local/test/sandbox/prod — thresholds may differ per env config.  
- Eye observes activation/denial events; does not authorize them.  
