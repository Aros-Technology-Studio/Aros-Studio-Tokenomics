# CONTRACT — `nodechain`

**Status:** ready  
**Canon refs:** `CANON.md` §4.1; clarifications P1.5

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| append payload | internal service / quorum validator path | yes | role-authorized |
| content hash links | pot / token / commission | yes | primary linkage |
| processId | process pipeline | yes | navigation |
| read query | institution / Eye / audit | yes | scoped |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| append receipt (height + hash) | caller | immutable |
| index projection | Postgres mirror | eventual |
| read stream / page | authorized reader | scoped |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `LedgerAppended` | out | new state entry |
| `LedgerAppendRejected` | out | auth / validation fail |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `nodes` | validator / service identity for append rights |
| crypto / config | encryption at rest keys |

| Depended on by | Why |
|----------------|-----|
| essentially all modules | SoT validity |
| `all-seeing-eye` | full audit read |
| institutions | own-process read only |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| unauthorized append | reject |
| mutate past entry | reject |
| institution requests full history | deny (Eye/audit only) |
| primary store unavailable | fail closed (no silent Postgres-as-truth) |
| missing content hash where required | reject |

API naming: never expose `block*` routes or DTO fields.
