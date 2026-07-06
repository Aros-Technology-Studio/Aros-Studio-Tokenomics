# contract_versioning_policy.md

**Stands on:** I5 (determinism), I8 (append-only causality), I7 (Eye veto), I2 (born-and-burned), I1 (PoT-gated origin). See `README.md` §1.

## Purpose

Define how the contracts that execute AST's supply logic are versioned. Versioning exists to serve determinism: because every token movement must be reproducible from recorded inputs (I5), the *exact code* that produced it must be identifiable. A version is the label that binds a registry entry (and its `hash`) to a specific, immutable set of bytes, so that "which code ran for this process?" always has one answer.

Versioning changes no supply rule. A new version may change *how* a mechanic is computed only within the bounds the invariants already fix; it can never change *that* a mint is PoT-gated (I1) or *that* a process part is burned at cycle close (I2).

---

## Versioning format

AST contracts use semantic versioning:

```
vMAJOR.MINOR.PATCH
```

- **`MAJOR`** — a change to how a mechanic is computed within the invariant bounds (e.g. re-implementing the commission split while preserving `NODE_SHARE`/`RESERVE_SHARE`). A `MAJOR` bump can never introduce a new supply cause or remove the PoT gate; such a change has no representable target (I1, I6).
- **`MINOR`** — backward-compatible additions (e.g. a new read-only view over the audit trail).
- **`PATCH`** — bug fixes and metadata updates, fully backward-compatible.

Because the invariants are fixed (`aroscoin_supply_model.md`, `token_supply_governance.md` §3), no version number — including `MAJOR` — can alter `SYMBOL`, `DECIMALS`, `BASE_UNIT`, the born-and-burned mechanism, or the split. Those are outside the versioned surface entirely.

---

## Registry version enforcement

Every entry in the Smart Contract Registry carries a `version` matching this format and a `hash` of the deployed bytes. When a contract is superseded:

- the prior version is marked `deprecated` (recorded, not deleted — I8);
- the new version is registered with fresh metadata and a `supersedes` back-reference to the prior `contract_id`;
- dependents are re-pointed via `UpgradeProxy` (see `contract_upgrade_proxy.md`).

Because deprecation is an appended state and never an erasure, the authoritative version at any past instant remains reproducible (I5, I8).

---

## Upgrade workflow

| Stage | Description | Guaranteed by |
|---|---|---|
| `Proposal` | A role-based AI committee proposes the version change (never a token-weighted vote — I6). | I7 |
| `Audit` | The implementation is audited; its code `hash` is submitted to the registry. | I5 |
| `Simulation` | The candidate is exercised in a sandbox with re-derivation checks against recorded causes. | I5 |
| `Eye review` | The Eye reviews the candidate and may **veto** any version whose logic would violate I1–I6. | I7 |
| `Deployment` | The new version is deployed; its `hash` is recorded. | I8 |
| `Registry` | `contractRegistryService` records the new version and deprecates the old, before activation. | I8 |
| `Activation` | `UpgradeProxy` points to the new implementation; it becomes authoritative. | I5 |

Every stage transition is appended to NodeChain before the next is acknowledged (I8).

---

## Upgrade constraints

- Supply-critical contracts (`EmissionService`, `CommissionSplitter`, `ReserveIndex`) require role-based committee approval, an audited state-migration snapshot, and Eye clearance before a `MAJOR` bump.
- `MINOR`/`PATCH` changes with no state migration may be fast-tracked once the audit is cleared and the Eye has not vetoed — but they are still recorded before effect (I8).
- No version may modify a recorded ledger state. Correction is only ever a new appended cause, never an edit of history (I8).

---

## Compatibility guarantees

- Contracts with external-facing service interfaces must preserve backward-compatible interfaces on `MINOR` and `PATCH`.
- A `MAJOR` (interface-breaking) change carries a minimum activation delay so dependents re-point deterministically, with the old version retained (deprecated) for re-derivation.

---

## Emergency rollback

If an activated version is found to produce a result inconsistent with the invariants, the Eye **vetoes further use** of that version (I7) — a halt, not a rewrite. The role-based committee then re-points `UpgradeProxy` to a prior cleared version. Both the veto and the re-point are appended to NodeChain before effect (I8), so the rollback is itself reproducible (I5). The Eye never authors the rollback deployment; it only halts the offending step.

---

## Linked Documents

- `smart_contract_registry.md`
- `contract_upgrade_proxy.md`
- `smart_contract_upgrade_policy.md`
