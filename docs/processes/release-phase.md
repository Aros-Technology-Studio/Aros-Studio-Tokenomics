# Process: Release Phase (system circulation regime)

**Status:** Canonical process description (v1)  
**Canon:** Core Canon §VII, §9.2, §9.6–9.7, **I8**; hard prohibitions on free circulation pre-phase  
**Decisions:** `release`, `release_daemon`, `velocity_tracker`, `reserve`; config keys only  
**Code (target):** `src/release/`, `src/release-daemon/`, `src/velocity-tracker/`, `src/reserve/`  
**Not this process:** holder [partial-release](./partial-release.md)

---

## 1. Definition

**Release Phase** is a defined stage of system maturity at which the circulation regime for **ArosCoin** and asset tokens expands beyond **internal roles** (process unit and payment unit) into a broader external regime (with compliance).

Until activation:

- Tokens exist only in internal roles.  
- Any attempt to take process value into free market circulation is **architecturally blocked** (I8).  
- Pre-phase blocks include: free external transfer, CEX listing, public trading.

After activation:

- External transfer, bridge, and listing paths may open **(+ compliance)**.  
- NodeChain remains sole source of truth; PoT still gates value origin/change.

Release Phase is **system + governance** — not a holder self-service toggle.

---

## 2. Activation condition (both required)

Transition is possible **only** when **both** hold at once (Core Canon §7.2, §9.7):

```
ReleasePhase = (reserveIndex > threshold) ∧ (velocity > target)
```

| Symbol | Meaning |
|--------|---------|
| `reserveIndex` | Logarithmic measure of accumulated capitalization through confirmed work |
| `velocity` | Measure of circulation activity |
| `threshold` | Config only — key **`release.threshold`** |
| `target` | Config only — key **`release.target`** |

### 2.1 Metric formulas (canon)

```
reserveIndex = log10(1 + totalProcessVolume)
```

```
velocity = processVolume_24h / circulatingSupply
```

`totalProcessVolume` / confirmed volume respect PoT (`verified = 1` only).  
Numeric threshold/target values are **not** hard-coded as sole source of truth in product code; they live in configuration.

---

## 3. Activation mechanism (`release_daemon`)

1. **`release_daemon`** runs continuously (real module in v1).  
2. Each tick (UTC schedule): read `reserveIndex` (from reserve / metrics) and `velocity` (from `velocity_tracker`).  
3. Evaluate:

   ```
   met = (reserveIndex > release.threshold) ∧ (velocity > release.target)
   ```

4. When `met`, daemon **initiates** activation via `release` API (e.g. `activateFromDaemon`) — it does **not** unilaterally flip phase off-chain.  
5. **`release`** applies governance multi-step approval as required for large/system transitions.  
6. On success: **NodeChain** event with `prevStateHash` + verifier signatures; phase state exposed to gates.  
7. Only after durable phase record may gates allow post-phase actions.

If metrics are met but governance rejects: daemon must **not** report activated. Fail-closed: no silent “activated” without NodeChain + release rules.

---

## 4. Actors and modules

| Module / actor | Role |
|----------------|------|
| `release_daemon` | Poll metrics; initiate when thresholds met |
| `velocity_tracker` | Compute velocity |
| `reserve` | Inputs to `reserveIndex` (own funds books only) |
| `release` | Phase state machine; gates; governance integration |
| Governance | Multi-step approval for activation / reverse |
| NodeChain | Immutable phase transition events |
| ArosCoin / adapters | Enforce allow/deny on transfer/bridge/listing |
| All-Seeing Eye | Observes initiation attempts; **no** veto power |

---

## 5. Pre-phase gates (I8)

Until Release Phase is **activated** and recorded:

| Action | Gate |
|--------|------|
| Free external transfer | **Deny** |
| CEX listing | **Deny** |
| Public trading | **Deny** |
| Internal process / payment unit use | **Allow** (within AST) |
| Economic processes (tokenize, revaluation, internal transfer of rights, internal partial-release) | **Allow** under their own PoT/NodeChain rules |

`ReleaseGateDenied` (or equivalent) on blocked external attempts. Fail-closed default.

---

## 6. Post-phase gates

After activation + NodeChain record:

| Action | Gate |
|--------|------|
| External transfer | **Allow** (+ compliance) |
| Bridge | **Allow** (+ compliance) |
| Listing | **Allow** (+ compliance) |
| PoT / NodeChain for value origin & change | Still mandatory |
| ERC adapter as SoT | Still **forbidden** |

Compliance and licensing remain outside “metrics alone.” Activation does not authorize free mint, staking, or third-party custody.

---

## 7. Reverse (deactivation)

- Only via **governance + NodeChain**.  
- No silent deactivate by daemon alone.  
- No Eye rollback.  
- Reverse path records prior state hash and signatures like activation.

---

## 8. Explicitly not partial-release

| Concern | Owner |
|---------|--------|
| System circulation regime | **This process** (`release` + `release_daemon`) |
| Portion of one holder claim | **`partial-release`** module / [partial-release.md](./partial-release.md) |

Folding partial asset release into phase activation is a **canon violation** (P2–P3 / release pack split). Partial release never flips `ReleasePhase`.

---

## 9. Config keys

| Key | Purpose |
|-----|---------|
| `release.threshold` | Compared to `reserveIndex` (strict `>`) |
| `release.target` | Compared to `velocity` (strict `>`) |

Defaults for operational numbers may appear in env/config files; they must not be magic-only in code without config. Changing thresholds is config/governance — not an ad-hoc mint policy.

---

## 10. Fail-closed summary

| Failure | Outcome |
|---------|---------|
| Only one metric above bound | Phase stays inactive |
| Daemon met, governance not ready | Not activated; no false positive |
| Transition without NodeChain | Reject |
| External action pre-phase | Deny |
| Reverse without governance + ledger | Reject |
| Eye “order” to open gates | Ignore for execution (observe only) |

---

## 11. Hard prohibitions

- Holder self-activation of Release Phase.  
- Hard-coded thresholds as sole SoT.  
- Merging partial-release into phase module.  
- Free external circulation before phase.  
- Eye executive open/close of phase.  
- Forbidden: pre-mine or free emission justified by preparing for release.

---

## Related

- Canon: `docs/AST-CORE-CANON.md` §VII, §9.2, §9.6–9.7, I8  
- Packs: `release`, `release-daemon`, `velocity-tracker`, `reserve`  
- Sibling: [partial-release.md](./partial-release.md)  
- Runtime: `docs/WORKFLOWS.md` §2.6  
- Decisions: `docs/P0-P4-TECHNICAL-DECISIONS.md` § release
