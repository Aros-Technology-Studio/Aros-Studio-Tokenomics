# MODEL — `velocity-tracker`

**Status:** ready  
**Canon refs:** `docs/AST-CORE-CANON.md` §9.6, §9.7

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| ProcessVolume24h | Sum of confirmed process volume in last 24h UTC | window key |
| CirculatingSupply | Protocol circulating ARO (or defined unit) | snapshot |
| Velocity | Scalar activity measure | derived |

---

## States and lifecycle

```
ingest volume series (from confirmed processes)
ingest / set circulatingSupply
  → velocity = processVolume_24h / circulatingSupply
  → release-daemon.tick() reads velocity
```

No phase state inside tracker.

---

## Invariants

| ID | Invariant | Effect if violated |
|----|-----------|--------------------|
| local | circulatingSupply ≤ 0 ⇒ velocity treated as 0 (no phase true) | fail closed on “met” |
| local | volume ≥ 0 | reject negative volume |
| I8-related | pre-phase external leak not authorized by this module | N/A — no transfer API |

---

## Formulas / constants

```
velocity = processVolume_24h / circulatingSupply
```

Release gate (consumer, not owned here):

```
ReleasePhase = (reserveIndex > release.threshold) ∧ (velocity > release.target)
```

- Window: **24 hours**, **UTC**.  
- Thresholds: config keys only (`release.threshold`, `release.target`) — not hard-coded as sole SoT in release/daemon.

---

## Anti-scope

- Not reserveIndex.  
- Not phase activation.  
- Not trading venue.  
