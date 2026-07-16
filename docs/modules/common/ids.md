# Common — Identifiers

**Code:** `src/common/ids` (`process-id.ts`)  
**Canon:** §XII processId prefix pattern  
**Decisions:** P2 orchestrator — processId `AST-{INST}-{YYYYMMDD}-` + UUIDv7  

---

## processId format

```
AST-{INST}-{YYYYMMDD}-<UUIDv7>
```

| Segment | Rule |
|---------|------|
| `AST` | Fixed prefix |
| `{INST}` | Institution code: uppercase alphanumeric (`A-Z0-9+`) |
| `{YYYYMMDD}` | **UTC** calendar date of issuance |
| UUIDv7 | Time-ordered UUID version 7 |

Example shape:

```
AST-DEMO-20260716-018f2a3b-...
```

Validation regex (implementation):

```
^AST-[A-Z0-9]+-\d{8}-[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
```

(case-insensitive hex for UUID part as implemented)

---

## Generation rules

- Clock: **UTC only**.  
- Institution code must pass validation (`INVALID_INSTITUTION_CODE` if not).  
- New economic retry after PoT expiry requires a **new** processId (pot rule).  
- Orchestrator is the sole economic entry that issues processIds in the pipeline; common only provides helpers.

---

## claimId

Claim identifiers bind holder allocations for mint/burn and settlement.

| Property | Rule |
|----------|------|
| Scope | Unique within process / asset context as defined by token module |
| Format | Typed string helper in common or token layer; processId remains primary process key |
| Use | aroscoin mint/burn, emission pro-rata legs |

Common may export generators/validators; assignment policy stays in domain modules.

---

## Related ids (not all owned by common)

| Id | Typical owner |
|----|----------------|
| snapshot / content hashes | nodechain + crypto helpers |
| validator / node ids | nodes |
| scheduleId | commission |
| invariant version ids | invariants (`I-ID-vX.Y`) |

---

## API helpers (conceptual)

| Function | Behavior |
|----------|----------|
| `buildProcessId(inst, now?)` | Compose AST-…-UUIDv7 |
| `isValidProcessId(id)` | Regex/structure check |
| `formatUtcYyyymmdd(now)` | Date segment |

Invalid ids surface as `INVALID_PROCESS_ID` / `INVALID_INSTITUTION_CODE` when used in strict paths.

---

## Non-goals

- Encoding fee rates or mint amounts into processId  
- Using processId as a blockchain block height  
- Institution-self-chosen free-form ids without AST prefix (rejected by validator)  
