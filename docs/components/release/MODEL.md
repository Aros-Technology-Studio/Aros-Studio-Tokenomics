# MODEL — `release`

**Status:** ready  

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| ReleasePhaseState | inactive / active | singleton or network-scoped |
| ThresholdConfig | reserveIndex threshold, velocity target | config keys |
| PhaseTransition | activation or deactivation event | processId / event hash |
| GovernanceApproval | multi-step approval | approvalId |
| CirculationGate | allow/deny external actions | rule set |

---

## Phase condition (canon)

```
ReleasePhase = (reserveIndex > threshold) ∧ (velocity > target)
```

Values of `threshold` and `target`: **configuration only** in v1.

Daemon: continuously monitors; **initiates** transition when conditions hold; governance approval still required per owner answers.

---

## States and lifecycle

```
Inactive (internal roles only)
  → metrics met + governance → Active
  → governance reverse + NodeChain → Inactive
```

### Blocked while Inactive (external)

- Free transfer to external chains  
- CEX listing  
- Public trading  

### Allowed when Active (still compliance-bound)

- External transfers  
- Bridge  
- Listing  

---

## Split responsibility

| Concern | Module |
|---------|--------|
| Phase activation / deactivation | `release` (+ daemon) |
| Partial asset/token release paths | **separate module** |

---

## Invariants

| ID / rule | Effect |
|-----------|--------|
| I8 pre-phase | block external list above |
| atomicity with burn/reserve | all-or-nothing |
| reverse only with governance + NodeChain | reject silent flip |
