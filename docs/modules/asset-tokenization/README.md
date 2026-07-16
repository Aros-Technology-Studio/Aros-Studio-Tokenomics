# Asset tokenization (institutional RWA path)

**Not a separate runtime binary** — implemented as **Orchestrator process type** + Portal intake + PoT + Emission.  
**Canon:** §V RWA tokenization  
**Intake:** `docs/INTAKE.md`

## Flow

```
Portal (issuer) → КЭП package → Orchestrator StartProcess
  → Docs → Oracle? → PoT → NodeChain → Emission @ institutional price
  → Settlement → State → End
```

## Responsibilities

| Concern | Owner |
|---------|--------|
| Package + signature | Portal / intake |
| Process orchestration | `orchestrator` |
| Confirmation | `pot` |
| Ledger | `nodechain` |
| Mint at institutional valuation | `emission` + `aroscoin` |
| Registry binding | process payload / NodeChain |

## Human-free

Automation allowed under process-type rules; optional human approval is **policy**, not Eye veto.

## Non-goals

- AST appraisal  
- Layer folder `10_*` as required code path name (logical layer maps to modules above)  
