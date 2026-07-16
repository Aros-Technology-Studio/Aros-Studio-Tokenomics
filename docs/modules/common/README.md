# Module: Common

**Code:** `src/common`  
**Canon:** §XII (defaults that common implements as utilities)  
**Decisions:** P2–P3 common  
**Pack:** `docs/components/common/`

---

## Purpose

Shared **primitives** used by all modules: money/decimal, process identifiers, error catalog, crypto helpers, config/logging hooks. Common is a **library**, not an economic service.

**No domain rules** live here: no PoT criteria, no fee policy, no mint authorization, no custody policy.

---

## Responsibility

| Owns | Does not own |
|------|----------------|
| decimal.js money helpers | Emission formulas as business policy |
| processId / claimId helpers | Orchestrator pipeline |
| `AstErrorCode` catalog | Invariant evaluation logic (registry is separate) |
| Hash / verify primitives | Node identity lifecycle |
| Barrel exports | Full domain event registries |

---

## Design summary

1. **Money** — `decimal.js`; ARO 9 decimals; arx = 1e-9.  
2. **Ids** — `processId = AST-{INST}-{YYYYMMDD}-` + UUIDv7.  
3. **Errors** — centralized `AstErrorCode`; reason codes for pot/invariants.  
4. **Crypto** — hash and signature verification primitives (not key custody policy).  
5. **Export** — public API = **barrel only** (`src/common/index.ts`).  
6. **Versioning** — deprecate-not-delete in v1.  

---

## Documents in this folder

| File | Content |
|------|---------|
| [ids.md](./ids.md) | processId pattern and validation |
| [money.md](./money.md) | decimal.js, arx, floor, dust |
| [errors.md](./errors.md) | AstErrorCode and usage |
| [crypto.md](./crypto.md) | Hash/verify surface |

---

## Dependencies

| External | Why |
|----------|-----|
| `decimal.js` | Money |
| Node crypto / vetted libs | Hash/verify |

Consumers: essentially all `src/*` modules.

---

## Forbidden

- Domain business rules in common  
- Free mint helpers  
- Eye veto utilities  
- Yield vocabulary in error names  
- Deep-import as supported public API (barrel only)  
