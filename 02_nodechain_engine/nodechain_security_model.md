# NodeChain Security Model

**Stands on:** I1 (PoT-gated origin), I3 (payment for confirmed work), I5 (determinism), I6 (no speculative surface), I7 (Eye veto), I8 (append-only causality). See `README.md` §1.

## Purpose

Describe the security architecture that protects transaction integrity, node behaviour, encryption, and intrusion prevention across the NodeChain. Security here is the *enforcement face* of the invariants: every control below exists because some invariant must hold, and each control is derived from it — not chosen as a best practice.

---

## 1. Security model overview

The model is a **zero-trust architecture**: no node is trusted implicitly at any stage. It combines decentralized confirmation, per-shard encryption, reputation from the record, and the All-Seeing Eye's veto.

Key principles, each derived:

- **No implicit trust.** *Because* I5 requires state to be reproducible from recorded causes and I8 requires the cause before the effect, a node's assertion is worth nothing until it is a signed, appended cause. Every node proves its work at every stage.
- **Continuous validation** across input → processing → output, because a confirmation is only as reproducible as the weakest unchecked stage (I5).
- **Reputation-based isolation.** Anomalous nodes are isolated by reputation computed deterministically from the append-only record (I5) — not by opaque discretion.
- **Immutable audit trail.** Every security-relevant cause is appended before its effect (I8), so the entire incident history is reproducible.

---

## 2. Key components

### 2.1 Node identity & trust layer

- Every node holds a **cryptographic identity** (public/private keypair + signature certificate); its public key is its on-chain name (I8).
- **Entry to the network is gated by verifiable identity, proof-of-origin, and a cryptographic challenge — never by a capital pledge.** *Because* I6 leaves no object for security-deposit-to-participate, admission cannot rest on a stake; it rests on identity plus standing earned by confirmed work (I3). See `node_registration_and_auth.md` §2–4.
- Behavioural scoring and risk classification are surfaced to the **All-Seeing Eye**, which can veto but never initiates (I7).

### 2.2 Data protection & encryption

- **Per-shard encryption** ensures no single node sees a full transaction payload (`encryption_protocol.md`); the isolation is structural, so a compromised node leaks at most its fragment.
- Node-side logic runs in **memory-safe, sandboxed execution** (e.g. WASM isolation), limiting the blast radius of a compromised node to its own scope.
- Commitments — not plaintext — are appended to NodeChain (I8), so the causal record is complete without retaining recoverable payload.

### 2.3 Behaviour analysis & intrusion prevention

- Node behaviour (latency, divergence rate, failure ratio) is profiled continuously from the recorded event stream (I5).
- Anomalous patterns lower reputation and can suspend a node; the consequence acts on standing and on payment for confirmed work (I3), because there is no held stake to seize (`node_registration_and_auth.md` §2).
- Dishonest confirmation attempts are caught by **multi-signature deviation scoring** — a node signing a hash the quorum rejects is a recorded, reproducible divergence (I5) and a vetoable step (I7).

---

## 3. Governance integration

- The All-Seeing Eye **oversees integrity and can veto** any step that would violate I1–I6; it **initiates nothing** — no mint, burn, payment, ejection, or re-shard originates with the Eye (I7). Its power is strictly negative.
- Escalation is a recorded, reproducible ladder: `notice → warning → quarantine → ejection`, each rung appended before it takes effect (I8).
- Emergency parameter changes are made by **role-based AI governance committees**, recorded before effect (I8) and reproducible (I5). Governance is **never token-weighted** — a held ARO balance confers no authority (I6); there is no holder franchise and no external overseer.

---

## 4. Threat surface mapping

| Threat vector | Mitigation | Invariant defended |
|---|---|---|
| **Sybil** | Identity + proof-of-origin + confirmed-work standing + reputation — influence is proportional to confirmed work, so empty identities buy none | I3, I6 |
| **DDoS on node/shard** | Load-aware distribution + shard redundancy + bounded per-node load from NodeAuth | I5 (availability of a reproducible path) |
| **Transaction replay** | Nonce + bound recorded salt + timestamp window; a re-applied cause is a rejected replay | I5, I8 |
| **Data leakage** | Per-shard encryption; no node holds a full-view | privacy (zero-trust) |
| **Consensus corruption** | ≥ 2/3 Byzantine quorum + node-diversity enforcement + reputation weighting | I5 |
| **Forged confirmation** | Signature must verify against the on-chain identity; mismatch is rejected and recorded | I1, I5, I8 |

Sybil resistance is stated positively: because standing and payment both derive from confirmed work (I3) and a held balance confers nothing (I6), an attacker cannot buy influence — they would have to *do* the confirmed work, at which point they are simply a participating node.

---

## 5. Audits and updates

- Periodic node audits, including zero-knowledge proofs where a node must prove correctness without revealing fragment content.
- Enforced rotation of node execution engines (versioned, recorded).
- Randomized testing of encryption fidelity per shard, results appended (I8).

Every audit result is a reproducible function of the recorded inputs (I5); an audit is the restatement of the invariants as tests over the NodeChain record.

---

## 6. Checklist before deployment

- [ ] All cryptographic identities validated (no capital-pledge gate anywhere — I6)
- [ ] Behaviour-monitoring pipeline active and reproducible from the record (I5)
- [ ] Role-based governance escalation ladder tested (recorded before effect — I8)
- [ ] Eye-veto path verified: halt-only, initiates nothing (I7)
- [ ] ZKP audit layer operational
- [ ] Replay/nonce/salt anti-replay verified (I5, I8)
