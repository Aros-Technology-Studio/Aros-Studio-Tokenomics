# CONTRACT — `node-reputation`

**Status:** ready  
**Canon refs:** `docs/AST-CORE-CANON.md` §9.8; P1 nodes; P4.16  
**Code path:** `src/node-reputation/`

---

## Inputs

| Input | Source | Required | Notes |
|-------|--------|----------|-------|
| nodeId | nodes / pot / ops | yes | must be registered for suspend path |
| success \| fail | pot / process outcome | yes | participation event |
| uptimeFactor | nodes heartbeats / ops | yes for score | default policy min 95% uptime |
| now | clock | for grace | UTC preferred |

---

## Outputs

| Output | Destination | Notes |
|--------|-------------|-------|
| reputation(nodeId) | callers / commission | scalar |
| weight(nodeId) | commission | ≥ 0 |
| suspend signal | nodes | status suspended |
| restore signal | nodes | status active after grace |

---

## Events

| Event | Direction | Meaning |
|-------|-----------|---------|
| `NodeParticipationRecorded` | out | success/fail counted |
| `NodeSuspendedWithGrace` | out | suspended; grace started |
| `NodeRestoredAfterGrace` | out | active again |
| `NodeReputationQueried` | internal/audit | optional |

---

## Dependencies

| Depends on | Why |
|------------|-----|
| `nodes` | register, suspend, restore, heartbeats |

| Depended on by | Why |
|----------------|-----|
| `commission` | distribution weights |
| `pot` / assignment | exclude suspended from quorum |
| `all-seeing-eye` | observe suspend/restore |

---

## API shape (implementation)

| Method | Behavior |
|--------|----------|
| `recordParticipation(nodeId, success)` | increment total; success++ if true |
| `reputation(nodeId, uptimeFactor)` | formula; 0 if total=0 |
| `weight(nodeId, uptimeFactor)` | max(reputation, 0) |
| `suspendWithGrace(nodeId, now?)` | nodes.suspend + suspendedAt |
| `maybeRestore(nodeId, now?)` | restore if grace elapsed |

---

## Error / fail-closed paths

| Condition | Behavior |
|-----------|----------|
| unknown nodeId on suspend | reject / no silent invent |
| grace not elapsed | maybeRestore = false; stay suspended |
| request to slash / seize funds | **forbidden** — not in API |
| missing uptimeFactor for weight used in settle | fail-closed or use documented default 0 (no free weight) |

---

## Explicit non-goals

- Fund punishment  
- Automatic permanent ban without governance  
- Replacing certificate allowlist  
