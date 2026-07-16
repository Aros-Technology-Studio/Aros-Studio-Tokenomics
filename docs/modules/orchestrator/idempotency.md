# Orchestrator — idempotency, concurrency, timeouts

**Module:** `orchestrator`  
**Canon:** Core Canon §XII  
**Decisions:** P2 orchestrator  
**Code:** `src/orchestrator/orchestrator.service.ts`

---

## 1. Mandatory idempotencyKey

Every `StartProcess` **must** include a caller-supplied `idempotencyKey`.

| Rule | Behavior |
|------|----------|
| Missing / empty key | **Reject** start |
| First use for `(institutionCode, idempotencyKey)` | Create new `processId`, store mapping |
| Repeat same key for same institution | Return **existing** `processId` and current step (no second process) |
| Same key, different institution | Independent keys (scoped by institution) |

### Scope

```text
idempotencyScope = institutionCode + ":" + idempotencyKey
```

Implementation stores a map from that scope to `processId`.

### Caller obligations

- Keys must be unique per intended business intent (e.g. one key per user-initiated tokenization submission).  
- Minimum practical entropy: treat as opaque string; core API enforces a minimum length (see `api.md`).  
- Retries after network failure **must** reuse the same key to avoid duplicate processes.  
- Do **not** reuse a key for a new economic intent after a completed process — generate a new key.  

### What idempotency does **not** do

- Does not skip PoT or NodeChain on later pipeline steps  
- Does not allow a second mint for a new intent under the same key  
- Does not replace process-type rules (expired process still needs a **new** processId and usually a new key)

---

## 2. Concurrency limit

| Parameter | Default | Scope |
|-----------|---------|--------|
| Max concurrent processes | **10** | Per institution |

### Counting

A process counts against the institution’s concurrent budget while it is **in flight** (not terminal `completed` / `failed` / `expired` under implementation policy). Start increments; terminal end releases.

### Over limit

```text
concurrent ≥ 10  →  reject StartProcess (or configured backpressure)
```

Default v1 behavior: **hard reject** with a structured error (no unbounded queue flooding the economic path).

### Rationale

Protects PoT validators, NodeChain writers, and ops capacity from a single institution flooding the system. Configurable in principle; **default 10** is canonical for v1 decisions.

---

## 3. Timeouts

All clocks **UTC only**.

| Bound | Default | Effect |
|-------|---------|--------|
| Per-step timeout | **5 minutes** | Step fails → compensation if pre-`verified=1` |
| Process timeout | **30 minutes** | Whole process fails → same compensation rule |
| PoT confirmation timeout | **15 minutes** (PoT module) | PoT expired → no emission; new processId required |

### Step timeout

- Configurable per step in production config; **default 5m** is the ship default.  
- Applies to each pipeline stage wall time under Orchestrator supervision.  
- Infinite hang is forbidden (pack + Canon §XII).  

### Process timeout

- Wall-clock from StartProcess to terminal state.  
- On expiry: mark `expired` or `failed` per implementation mapping; release concurrency; compensate only if still allowed.  

### Relation to oracle fail-closed

Oracle Gateway failure is fail-closed → process **expired** path (not a soft continue). That is independent of the 5m/30m clocks but may also race with them.

---

## 4. Kill switch / read-only

When kill switch asserts read-only / no new economic causes:

- **StartProcess** rejects new processes  
- In-flight handling follows ops policy; no new mints from new causes  

Idempotent retry of an **already started** process is not a free pass around kill switch for **new** side-effects; implementing services must re-check write guards.

---

## 5. Determinism and retries

| Concern | Rule |
|---------|------|
| Same inputs after PoT | Same economic result (I4) |
| Client retry of StartProcess | Same processId via idempotency |
| Client retry of mid-pipeline | Orchestrator / step APIs must be safe; never double-mint |
| PoT double confirm | Error + Eye-visible record |

---

## 6. Operational summary

```text
StartProcess
  require idempotencyKey
  resolve existing by (institution, key) OR create if concurrent < 10
  enforce kill switch
  start clocks (process 30m; steps 5m default)

On any failure before verified=1
  compensate → terminal

On verified=1
  no saga undo; settlement retries if needed
```

See also: [saga-compensation.md](./saga-compensation.md), [pipeline.md](./pipeline.md), [api.md](./api.md).  
