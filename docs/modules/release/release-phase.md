# Release Phase

**Module:** `release`  
**Code:** `src/release/`  
**Canon:** §VII Release Phase; §XI I8; formulas §9.2, §9.6, §9.7  
**Pack:** `docs/components/release/`

---

## Definition

**Release Phase** is a defined stage of system maturity at which the circulation regime for ArosCoin and asset tokens expands beyond internal roles (process unit and payment unit).

Until activation, any attempt to take process value into free market circulation is **architecturally blocked** (Canon §7.4, I8).

---

## Activation conditions

Both must hold **at once**:

```text
reserveIndex > release.threshold
AND
velocity > release.target
```

| Metric | Formula / source |
|--------|------------------|
| `reserveIndex` | `log10(1 + totalProcessVolume)` — soft growth of capitalization through confirmed work |
| `velocity` | `processVolume_24h / circulatingSupply` — circulation activity (24h window, UTC) |
| `threshold`, `target` | **Configuration keys only** in v1 |

No single metric alone activates phase. No hard-coded magic numbers as the sole product source of thresholds.

---

## Activation mechanism

```text
Inactive (internal roles only)
  → release_daemon continuously tracks metrics
  → when (reserveIndex > threshold) ∧ (velocity > target)
  → daemon initiates transition into release module
  → governance multi-step approval (per pack / owner rules)
  → NodeChain PhaseTransition record (prevStateHash + verifier signatures)
  → Active
```

| Actor | Role |
|-------|------|
| `release-daemon` | Detect eligibility; **initiate** |
| `release` | State machine; gates; atomicity with burn/reserve where applicable |
| Governance | Approvals for large / phase ops |
| NodeChain | Immutable phase events |
| Holders / institutions | **Cannot** self-trigger phase |

Automatic eligibility does not mean ungoverned silent flip: daemon initiates; activation completes through release + governance + ledger rules.

---

## Lifecycle

### States

| State | Circulation |
|-------|-------------|
| Inactive | Internal roles only |
| Active | Broader external regime possible (+ compliance) |

### Reverse

```text
Active
  → governance reverse request
  → NodeChain record
  → Inactive
```

Silent deactivate off-ledger is **forbidden**.

---

## Circulation gates

### Blocked while Inactive (external)

| Action | Gate |
|--------|------|
| Free transfer to external chains | Deny |
| CEX listing | Deny |
| Public trading | Deny |

Events: `ReleaseGateDenied` when attempts occur.

### Allowed when Active (still compliance-bound)

| Action | Gate |
|--------|------|
| External transfers | Allow + compliance |
| Bridge | Allow + compliance |
| Listing | Allow + compliance |

Events: `ReleaseGateAllowed` when compliant; still deny non-compliant.

Adapters (ERC representation, bridges) must **query phase gates** — representation layers are not SoT and cannot bypass I8.

---

## Events

| Event | Meaning |
|-------|---------|
| `ReleasePhaseActivated` | After NodeChain + governance path |
| `ReleasePhaseDeactivated` | Reverse path |
| `ReleaseGateDenied` | Pre-phase (or non-compliant) external attempt |
| `ReleaseGateAllowed` | Post-phase compliant action |

---

## Invariants and atomicity

| Rule | Effect |
|------|--------|
| I8 pre-phase | Block external list above |
| Atomicity with burn/reserve when module participates | All-or-nothing for that op |
| Reverse only with governance + NodeChain | Reject silent flip |
| Phase flip only through release + ledger rules | Reject off-ledger flip |

---

## Split from partial release

| Release Phase | Partial release |
|---------------|-----------------|
| System-wide regime | Single position process |
| Daemon + metrics + governance | Holder + institution + Orchestrator |
| Does not require per-holder request | Full new `processId` |
| See this document | See [partial-release.md](./partial-release.md) |

---

## Fail-closed paths

| Condition | Behavior |
|-----------|----------|
| External action pre-phase | Deny |
| Transition without governance | Reject |
| Transition without NodeChain record | Reject |
| Partial failure mid atomic op | Full module-level reverse of that op (not Eye rollback) |
| velocity with circulatingSupply ≤ 0 | Velocity treated as 0 → phase eligibility false |

---

## Relation to internal value estimate

```text
ArosCoin_internalPrice = base × reserveIndex
```

Informational only — **not** market price and **not** used for minting (Canon §9.3). Phase thresholds use reserveIndex and velocity, not this informational price as mint basis.  
