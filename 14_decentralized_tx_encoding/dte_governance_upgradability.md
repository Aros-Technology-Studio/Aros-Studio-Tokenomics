# DTE — Governance & Upgradability

**Module:** AST — Aros Studio Tokenomics
**Component:** Decentralized Transaction Encoding (DTE)
**Submodule:** Governance & Upgradability Rules
**Stands on:** I5 (determinism), I6 (no speculative surface), I7 (Eye veto), I8 (append-only causality). See `01_coin_engine/README.md` §1 and the governance model in the repository README.

---

## 1. Purpose

Define **how an encoding rule changes** — schema version, canonical field order, digest algorithm — without breaking the determinism the whole model depends on. An encoding change is a change to the function that produces the object PoT confirms; therefore it must be controlled, recorded before effect (I8), and reproducible (I5). This document derives that procedure from the invariants.

---

## 2. Governance structure — role-based AI oversight

Governance in AST is a **role-based hierarchy of AI oversight**, not a vote (governance model; I6). No token weighting, no holder franchise, no human quorum-by-stake — *because* a held ARO balance has no object in this model (I6), it can confer no say over encoding rules. The hierarchy for DTE changes:

1. **Encoding Standards Role** — an AI oversight role that proposes and specifies encoding changes: canonical form, backward-decode plan, determinism proof obligations.
2. **Integration Review Role** — an AI oversight role that verifies a proposed change against the PoT pipeline and NodeChain record: does it preserve bit-exact determinism, and does it keep every already-recorded package decodable?
3. **All-Seeing Eye (apex)** — observes every step and **can veto** any change that would violate I1–I6 (I7). It initiates no change; its power is strictly negative.

Every role's decision is appended to NodeChain before it takes effect (I8), so the rule in force for any encoded package is reproducible from the record (I5).

---

## 3. Upgrade principles (each derived)

- **Backward decode preserved** — every already-recorded package must remain decodable, *because* it is a cause on NodeChain and I8 makes recorded causes immutable and permanently verifiable. Retiring the ability to read a past package would orphan its effects.
- **Determinism preserved** — a new rule must itself be a pure function of canonical inputs (I5). A change that reintroduced any node-dependent step (floats, unordered maps, wall-clock in the digest) is rejected at review as a violation of I5.
- **No in-flight invalidation** — an encoding change must not invalidate packages already handed to an active PoT cycle; the new rule applies from a recorded activation point forward (I8).
- **Reversible** — every change ships with a recorded rollback to the prior rule version, deployable without loss of decode capability.

---

## 4. Upgrade process

### 4.1 Proposal
The Encoding Standards Role submits a **DTE Change Proposal (DTE-CP)** containing:
- Problem statement.
- Canonical-form specification (exact new field order / digest / schema).
- **Determinism proof obligation** — evidence the new encoding is a pure function of inputs (I5).
- Backward-decode plan (I8).
- Rollback specification.

### 4.2 Review & testing
The Integration Review Role performs:
- Specification review against I5/I8.
- Testnet deployment across an encoding quorum, asserting bit-identical output on the canonical vector set (`ENCODING_MATCH = 1.0`).
- End-to-end integration with the PoT pipeline.
- Backward-decode verification against archived legacy packages.

### 4.3 Approval
Approval is a **role-based decision**, not a vote: the Integration Review Role certifies that I5 and I8 hold under the change, and the change is admitted to the activation queue. The Eye observes and may veto (I7). There is no stake threshold and no validator ballot — I6 leaves no object for either.

### 4.4 Activation
- The activation record (new rule version + activation reference) is appended to NodeChain **before** any node encodes under the new rule (I8).
- Staged rollout to a subset of encoding nodes first; the acceptance signal is **continued bit-identical agreement** across mixed and then full quorum on the vector set (I5). Operational KPIs (latency, throughput, hand-off health) are monitored, but the *correctness* gate is exact determinism, not a performance band.
- On stable determinism, the rule is active network-wide from the recorded activation point.

---

## 5. Emergency changes

For a determinism-breaking defect discovered in production (e.g. a rule that lets two honest nodes diverge — a live I5 violation), the Encoding Standards Role may issue a **fast-track correction**:
- Immediate append of the correction record (I8), then activation.
- The Eye retains veto over the correction (I7).
- Retrospective role review is recorded on NodeChain.

The correction is a *stop-the-divergence* action, never a discretionary issuance — no unit is created or moved by a DTE change (I1).

---

## 6. Versioning & audit

- Semantic versioning: `MAJOR.MINOR.PATCH` on the encoding rule.
- Every change is logged to NodeChain with: proposal id, reviewing role certification, activation reference, and rollback reference (I8).
- Audit is the restatement of the invariants: for any historical package, re-encoding its inputs under the rule version recorded as active at that point yields the identical digest (I5); every change record precedes its first effect (I8).

---

## 7. Change failures

If, after activation, quorum output ceases to be bit-identical (any I5 divergence) or a legacy package fails to decode (any I8 orphaning):
- The recorded rollback to the prior rule version is activated (its activation record appended first — I8).
- The Eye may veto further activations pending role review (I7).
- The event is recorded on NodeChain for causal audit.
