# PURPOSE — `orchestrator`

**Status:** ready  
**Canon refs:** `CANON.md` §III–VIII (process cycle); P0/P1 packs for step owners  
**Code path:** `src/orchestrator/`  
**Clarifications:** P2.10 canonical v1

---

## Why this exists

**Sole entrypoint** for every economic cycle. Creates `processId`, runs the fixed v1 pipeline, coordinates services (including AI L1+), and drives **compensating transactions** on failure — without replacing PoT quorum or Eye powers.

---

## Responsibility

- Owns: processId mint (UUIDv7 + institutional prefix), pipeline order, saga-style compensation, idempotencyKey, concurrency limits, step timeouts, optional human approval hooks, wiring to pot/nodechain/emission/commission/notifications.
- Contributes to: operational reaction to Eye **alerts** (not Eye executive power).
- Does **not** own: PoT verification, valuation, mint math, NodeChain storage, commission math.

---

## Boundary (must not)

- Must not be bypassed for economic cycles (sole entry).  
- Must not self-verify PoT or replace validator quorum.  
- Must not implement All-Seeing Eye veto/rollback.  
- Must not skip NodeChain write-ahead / required steps.  
- Compensation ≠ “Eye rollback”; compensation is orchestrated reverse of prior **successful** steps only.

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Create processId = UUIDv7 + institutional prefix | External free processId injection without StartProcess |
| Fixed 9-step pipeline (see MODEL) | Ad-hoc reordering without canon change |
| Compensating saga on mid-failure | Silent partial success |
| Real AI services (L1 required; L2/L3 optional) | Fake-only forever if L1 required |
| Optional human approval by asset policy | Mandatory human on every process |
| Mandatory idempotencyKey at start | Duplicate process for same key |
| Max concurrent processes default 10 (configurable) | Unbounded flood |
| Sole economic entrypoint | Side doors into mint/settle |
| Process timeout 30m; per-step configurable | Infinite hang |
| Technical logs vs business on NodeChain | Business-only in ephemeral logs |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| all P0/P1 modules | pipeline steps |
| `state-recording` | process snapshots inside NodeChain |
| `all-seeing-eye` | alert consumer (ops coordination) |
| AI L1–L3 | real services in v1 |
