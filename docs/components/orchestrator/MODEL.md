# MODEL — `orchestrator`

**Status:** ready  

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| Process | Full tokenization/revaluation lifecycle | processId (UUIDv7 + institutional prefix) |
| IdempotencyKey | Dedupe process start | key + institutionId |
| PipelineStep | Ordered stage | step name + sequence |
| CompensationAction | Reverse of a completed step | stepId + processId |
| ProcessTimeout | Wall clock bounds | process + per-step |

---

## Fixed pipeline (v1 order)

1. **StartProcess** — create processId  
2. **Document + Signature Validation**  
3. **Oracle Gateway** (if needed)  
4. **PoT Evaluation**  
5. **NodeChain Record**  
6. **Emission / Burn** (if ΔValue ≠ 0)  
7. **Settlement (commission)**  
8. **State Update + Notification**  
9. **EndProcess**

---

## States and lifecycle

```
StartProcess → … steps …
  success → EndProcess
  failure → compensate completed steps (reverse order) → terminal failed
```

Idempotent start: same `idempotencyKey` → same process or reject duplicate start.

---

## Invariants

| Rule | Effect |
|------|--------|
| No economic cycle outside orchestrator | reject side entry |
| No emit/settle without prior PoT + NodeChain as pipeline requires | fail closed |
| Compensation never authorizes Eye veto | — |
| Concurrent processes ≤ limit | reject or queue per policy |

---

## Defaults

| Parameter | Default |
|-----------|---------|
| maxConcurrentProcesses / institution | 10 |
| processTimeout | 30 minutes |
| per-step timeout | configurable |
