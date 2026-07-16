# PURPOSE — `common`

**Status:** ready  
**Canon refs:** stack + shared engineering practice  
**Code path:** `src/common/`  
**Clarifications:** P3.13 canonical v1

---

## Why this exists

Shared **technical utilities** only: money/decimal, IDs, errors/reason codes, crypto primitives, types/interfaces, logging/tracing helpers, config loading. **No domain rules.**

---

## Responsibility

- Owns: barrel-exported helpers listed in MODEL; centralized error catalog; shared config loader; log/trace helpers.
- Contributes to: consistent primitives across modules.
- Does **not** own: pot/emission/reserve/business policies; domain event catalogs; test utilities (separate `testing/`).

---

## Boundary (must not)

- Must not contain business logic or domain policies.  
- Must not deep-import sprawl (barrel only).  
- Must not host domain event types (base interfaces only).  
- Must not remove deprecated shared types within v1 (semver + deprecate).

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Money/Decimal, IDs, errors, crypto verify/hash, types | Domain rules / policies |
| Centralized error + reason code catalog | Per-module incompatible codes only |
| decimal.js or big.js (pick one in implementation) | Float money |
| Logging/tracing helpers | — |
| Shared config loading | — |
| **Barrel exports only** | Deep public imports as supported API |
| Test utils in **`testing/`** | Test-only clutter in common runtime |
| Base interfaces only for events | Full domain event taxonomy here |
| Semver; deprecate, don’t delete in v1 | Breaking silent removals in v1 |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| all modules | import via barrel |
| `testing/` | separate package for tests |
