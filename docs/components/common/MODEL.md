# MODEL — `common`

**Status:** ready  

---

## Contents (v1 allow-list)

| Area | Examples |
|------|----------|
| Money / Decimal | decimal.js or big.js wrappers |
| IDs | processId, claimId, snapshotId helpers/types |
| Errors | centralized catalog + reason codes |
| Crypto | hash, signature verification primitives |
| Types & interfaces | shared non-domain base types |
| Logging / tracing | helpers |
| Config | shared loading |

---

## Forbidden contents

- Domain rules  
- Business logic  
- Policies (fee schedules, PoT, custody, etc.)  
- Full domain event type registries  

---

## Versioning

- Semver for the package surface  
- Breaking changes: **deprecate** first; **do not remove** in v1  

---

## Export model

Public API = **barrel only** (`src/common/index.ts` or package export map). Deep paths are unsupported.
