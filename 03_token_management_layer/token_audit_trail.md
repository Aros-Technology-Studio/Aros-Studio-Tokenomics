# token_audit_trail.md

**Stands on:** I8 (append-only causality), I5 (determinism), I1 (PoT-gated origin), I2 (born-and-burned), I3 (payment), I4 (AST reserve), I7 (Eye veto). See `README.md` §1.

## Purpose

Define how ARO activity is audited. Auditing in AST is **not a separate compliance layer** bolted onto the ledger; it is the restatement of the invariants as checks over the NodeChain record. Because every cause is appended before its effect (I8) and every effect is reproducible (I5), an audit is a *re-derivation*: replay the recorded causes and confirm the recorded effects follow. Nothing needs to be trusted; everything can be recomputed.

---

## Scope

The audit trail covers every token-lifecycle event, each of which is a recorded cause→effect pair on NodeChain:

- **mint** of a process part (caused by a `verified === 1` verdict, I1);
- **burn** of that process part at cycle close (I2);
- **node payment** — the `NODE_SHARE` of commission retained for confirmed work (I3);
- **reserve accrual** — the `RESERVE_SHARE` of commission to `SYSTEM_RESERVE` (I4);
- **`COMMISSION_RATE` changes** — bounded, role-based committee decisions (see `token_supply_governance.md`);
- **contract-lifecycle events** — registration, versioning, upgrade, decommission (see the contract-lifecycle files);
- **Eye vetoes** — every halt the Eye issued (I7).

There is no `LOCK`/`UNLOCK` event type, because there is no lock in the model (`token_lock_unlock_rules.md`). There is no "governance override" event, because the Eye overrides nothing — it only vetoes, and a veto is a halt, not a substitution (I7).

---

## Key components

### 1. Event record (cause before effect)

Every token action appends a signed event to NodeChain **before** its effect is acknowledged (I8). Each event carries:

- event type — one of `emission.minted`, `emission.burned`, `payment.node`, `reserve.accrual`, `param.commissionRate`, `contract.*`, `eye.veto`;
- the `processId` (for supply events) or `contractId` (for contract-lifecycle events) it is bound to;
- the causing record's reference (e.g. the PoT `verdictId`) — so the cause is always locatable;
- amount in `arx` (for supply events);
- timestamp and the appending node's signature.

Because the causing record is referenced, every effect is *traceable to its cause* — the defining property the audit relies on (I1, I8).

### 2. Merkle archiving

Periodic Merkle-root snapshots of the NodeChain segment are computed so that any historical state can be proven consistent with the current root. The snapshots do not *create* trust; they make the existing append-only record efficiently verifiable (I8). The archive is internal to AST NodeChain; it references no external chain and ingests no external value (I6).

### 3. Node checkpoints

Nodes publish signed state hashes at intervals. Because the state is a pure function of the recorded causes (I5), independent nodes computing the same segment must produce the same hash; a divergence is a detected inconsistency, resolvable by re-derivation, not by vote.

### 4. Eye-veto log

Every veto the Eye issued is recorded: the step it halted and the invariant (I1–I6) it defended. The log contains **only** observations and vetoes — never a mint, burn, or payment authored by the Eye (I7). Auditing the Eye is auditing that it never initiated anything.

---

## The audit, as invariant restatement

| Check | Assertion over NodeChain | Invariant |
|---|---|---|
| Supply conservation | for every completed process, `processMinted == processBurned` | I2 |
| Payment causality | every `payment.node` credit is preceded by a `verified === 1` verdict for the same process | I1, I3 |
| Reserve integrity | `reserveIndex` is a pure function of confirmed process volume; no other input moves it | I4 |
| Split exhaustiveness | `payment.node + reserve.accrual == commission` for each cycle | I3, I4 |
| Idempotency | replaying a recorded cause produces no second effect | I5, I8 |
| Cause-before-effect | every effect's causing record has an earlier NodeChain position | I8 |
| Eye discipline | the Eye's log holds only observations and vetoes | I7 |

An audit is passed not by attestation but by the absence of any counterexample to these assertions in the record.

---

## Access & interfaces

- **Read-only query API** — endpoints that return event history and derived supply figures. They are pure reads; no endpoint mutates the ledger.
- **Exportable bundles** — JSON exports of a NodeChain segment plus its Merkle proof, so a third party can re-derive and verify offline.
- **Dashboard** — a view over the same reads (supply figures, veto log, contract lineage). It displays; it does not control.

There are no compliance modules for external regulatory export, KYC/AML masking, or fiat reporting — AST is service-to-service and ingests no external identity or value (I6); such modules would name obligations the model does not carry.

---

## Security & integrity

- Audit events are signed (BLS or ECDSA) and stored append-only on NodeChain (I8).
- Integrity rests on re-derivability (I5), not on redundancy alone: even a single honest copy of the causes reproduces the effects.
- Records are immutable; correction is only ever a *new appended cause*, never an edit of a past one (I8).

---

## Linked Documents

- `smart_contract_registry.md`
- `burn_mechanism.md`
- `token_distribution_model.md`
- `01_coin_engine/burn_and_mint_rules.md`
