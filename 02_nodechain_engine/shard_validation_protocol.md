# Shard Validation Protocol

**Stands on:** I1 (PoT-gated origin), I5 (determinism), I7 (Eye veto), I8 (append-only causality). See `README.md` §1.

## Purpose of this document

Define how a transaction shard becomes **confirmed work** — signed by independent nodes, hash-agreed, quorum-accepted, and time-aligned. Shard validation is the step that manufactures the confirmation which, aggregated across a transaction's shards, is exactly the PoT verdict the Coin Engine consumes (I1). Every signature and verdict is appended before the shard is acknowledged (I8), and the whole check is a pure function of recorded inputs (I5).

---

## 1. Core objectives

1. Define the **validation flow** from shard distribution to confirmation.
2. Establish **quorum rules** that make a shard's acceptance a reproducible function of recorded signatures (I5).
3. Standardize the **signing format** and **time-alignment** so confirmations are comparable and replayable.
4. Ensure **tamper-resistance**: a shard is accepted only if independent nodes agree on its hash.
5. Support **parallel validation** so many shards confirm at once without breaking determinism.

---

## 2. Why validation is the PoT verdict — derived

*Because* I1 says a unit of ARO exists only as the consequence of a PoT verdict `verified === 1` for a specific process, and *because* that verdict is nothing more than "this process's work was executed and independently confirmed," **therefore** the aggregate of a transaction's shard validations *is* the PoT verdict — there is no separate, discretionary "approval" step layered on top. When every shard of process P reaches quorum with matching hashes, `verified` for P becomes `1`; the Coin Engine then mints, burns, and pays on that recorded cause (I1, I2, I3). No shard quorum ⇒ no verdict ⇒ no unit.

---

## 3. Validation lifecycle

```mermaid
sequenceDiagram
    participant C as Transaction Source
    participant G as Gateway Node
    participant N1 as Node A
    participant N2 as Node B
    participant V as Verifier Engine
    participant E as All-Seeing Eye

    C->>G: Submit transaction for process P
    G->>N1: Distribute shard (encrypted fragment)
    G->>N2: Distribute shard (encrypted fragment)
    N1->>V: Return signed shard + hash
    N2->>V: Return signed shard + hash
    V->>V: Check quorum + hash match + time delta (I5)
    V-->>G: Signatures appended before verdict (I8)
    E-->>V: Observes; may VETO an invariant-violating step (I7)
    G->>C: Confirm (verified===1) or reject
```

The Eye observes the check and can halt it; it never signs a shard or authors the verdict (I7).

---

## 4. Quorum rules

A shard is **valid** only if all of the following hold, each computed from recorded inputs (I5):

- It receives at least **Q independent node signatures**, where `Q = ceil(2/3 · K)` for a shard assigned to `K` validators (Byzantine-fault threshold; see `shard_quorum_protocol.md`).
- Participating nodes' **timestamps differ by no more than ΔT** (e.g. `ΔT = 3s`), so the confirmation is a single aligned event and not a stitched-together artifact.
- Every signatory's **shard hash matches** — one mismatched digest rejects the shard.

```json
{
  "process_id": "P-8821",
  "shard_id": "shd-8821-A",
  "valid_signatures": 4,
  "quorum_required": 4,
  "time_delta_max_s": 3,
  "hash_match": true,
  "status": "valid"
}
```

Because `valid` is a deterministic predicate over the recorded signatures, hashes, and timestamps, any auditor recomputes the same verdict (I5) — the confirmation is reproducible, which is precisely what makes the downstream mint reproducible (I1, I5).

---

## 5. Signature format

Each node signs its shard portion using ECDSA over secp256k1 (or a configured PQ-safe scheme):

```json
{
  "process_id": "P-1394",
  "shard_id": "shd-1394-A",
  "signature": "0x3045022100ab...cd90",
  "node_id": "node-eu-03",
  "signed_at": "2026-06-23T17:55:00Z"
}
```

All signature bundles are appended to NodeChain during quorum confirmation (I8) and retained as the reproducible cause of the verdict (I5). See `shard_signature_model.md` for the hashing and binding detail.

---

## 6. Hash integrity check

Every validated shard must:

- match an identical **SHA-256 hash** across all signatory nodes;
- be **rejected** if even one signatory returns a mismatched digest — because a mismatch means the nodes did not confirm the same work, so no single verdict exists;
- be **flagged and re-sharded** on mismatch (with a new recorded salt; see `transaction_sharding_logic.md` §7), the flag appended before the retry (I8).

---

## 7. Parallelism and load strategy

- Nodes are grouped into **validation pools**; multiple shards validate concurrently.
- Parallel quorum groups reduce latency without affecting determinism, because each shard's verdict is an independent pure function of its own recorded signatures (I5).
- The gateway distributes shards with a **load-aware round-robin** that also enforces the anti-monopoly and rotation bounds from `node_registration_and_auth.md` §5 — a node's share of work is bounded, never bought (I6).

---

## 8. Failure codes

| Code | Condition | Invariant defended |
|---|---|---|
| `E_QUORUM_SHORT` | fewer than Q valid signatures for a shard | I1 (no verdict without confirmed work) |
| `E_HASH_MISMATCH` | signatories disagree on the shard hash | I5 (no single reproducible confirmation) |
| `E_TIME_SKEW` | signatures fall outside ΔT | I5 (confirmation not a single aligned event) |
| `E_ACK_BEFORE_RECORD` | verdict acknowledged before its signatures were appended | I8 |
| `E_EYE_VETO` | a step would violate I1–I6 and was halted | I7 |

Each impossible state is nameable and rejected, not merely improbable.

---

## 9. Repository location

```
02_nodechain_engine/
└── shard_validation_protocol.md
```
