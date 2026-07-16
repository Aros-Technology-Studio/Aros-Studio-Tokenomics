# PURPOSE — `release-daemon`

**Status:** ready  
**Canon refs:** `docs/AST-CORE-CANON.md` §VII, §9.6–9.7, I8  
**Code path:** `src/release-daemon/`  
**Clarifications:** P2.12 release; P4.16 real in v1

---

## Why this exists

**Initiates** Release Phase transition when metrics meet config thresholds. Monitors `reserveIndex` and `velocity`; calls into `release` (which still requires governance rules). Does **not** hold Eye powers and does not self-author phase without NodeChain + release pack rules.

---

## Responsibility

- Owns: poll/tick loop, reading metrics, evaluating  
  `met = (reserveIndex > release.threshold) ∧ (velocity > release.target)`,  
  calling `release.activateFromDaemon` (or equivalent) when met.
- Contributes to: system-side phase initiation (with governance).
- Does **not** own: metric formulas (reserve / velocity-tracker), full phase state machine storage (release), partial asset release, Eye veto.

---

## Boundary (must not)

- Must not hard-code threshold numbers as sole SoT (config keys).  
- Must not bypass governance required by `release` pack.  
- Must not reverse phase alone.  
- Must not mint/burn or change custody.  
- Must not act as All-Seeing Eye.

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Real deployable process in v1 | Docs-only forever |
| Config keys `release.threshold`, `release.target` | Magic numbers only in code |
| Read reserveIndex + velocity each tick | Invent metrics |
| Initiate via `release` API | Flip phase off-chain only |
| Catch “met but governance not ready” without lying activated | Report activated when release rejects |
| UTC schedule for polls | Ambiguous local TZ as sole rule |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| `reserve` | reserveIndex |
| `velocity-tracker` | velocity |
| `release` | activation + governance gate |
| `nodechain` | phase events via release |
| `governance` | multi-step as required by release |
| `all-seeing-eye` | observes initiation attempts |
