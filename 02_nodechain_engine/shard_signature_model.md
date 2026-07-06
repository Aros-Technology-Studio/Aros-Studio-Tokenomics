# Shard Signature Model

**Stands on:** I3 (payment for confirmed work), I5 (determinism), I7 (Eye veto), I8 (append-only causality). See `README.md` §1.

## Purpose of this document

Define how each transaction shard is signed, authenticated, and cryptographically bound to its transaction and its signing node. A signature is the atom of confirmed work: it names *which node* confirmed *which shard*, and it is the recorded cause both of the shard's validity (I5) and of that node's claim to payment for the work (I3). Every signature is appended before the shard is acknowledged (I8).

---

## 1. Core objectives

1. Guarantee the **cryptographic integrity** of each shard — a signature that does not verify is not confirmed work.
2. **Bind** each signature to its shard *and* its signing node, so the confirmation names its author (I8) and the author's payment claim is unambiguous (I3).
3. Prevent **tampering or substitution** of shards within a transaction.
4. Define the **multi-node signing quorum** that makes a shard's confirmation independent of any single node.

---

## 2. Why a signature is a payment claim — derived

*Because* I3 pays a node for *executed, PoT-confirmed work*, and *because* the shard signature is the recorded proof that a specific node executed and confirmed a specific fragment, **therefore** the signature is exactly the record on which the node's share of commission is later computed (see `node_payment_allocation.md`). Payment does not need a separate ledger of "who did what"; the append-only signature set *is* that ledger (I8). A node with no recorded signatures for a batch earned nothing in it — not by penalty, but because payment follows confirmed work and there is none to point to (I3).

---

## 3. Shard signature structure

Each shard is signed using ECDSA over secp256k1 (or a configured PQ-safe scheme):

```json
{
  "process_id": "P-00392",
  "shard_id": "shd-A",
  "shard_hash": "0x48d7...",
  "signed_by": "node_003",
  "signature": "0xabc1...",
  "timestamp": "2026-06-23T18:17:00Z",
  "signature_type": "ecdsa_secp256k1"
}
```

`signed_by` is the node's on-chain identity (its registered public key; see `node_registration_and_auth.md`), so the signature simultaneously proves the work and names the earner (I3).

---

## 4. Signature lifecycle

```mermaid
sequenceDiagram
    participant T as Transaction Router
    participant N1 as Node 1
    participant N2 as Node 2
    participant G as Gateway
    participant E as All-Seeing Eye

    T->>N1: Send Shard A
    T->>N2: Send Shard B
    N1->>N1: Sign Shard A over its hash
    N2->>N2: Sign Shard B over its hash
    N1-->>G: Submit Signature A (appended before ack - I8)
    N2-->>G: Submit Signature B (appended before ack - I8)
    G->>G: Verify quorum + hash match (I5)
    E-->>G: Observes; may VETO an invalid step (I7)
    G->>T: Return signed proof bundle
```

---

## 5. Multi-signature verification

- A minimum of **n ≥ 3** independent node signatures is required for shard quorum (the exact threshold is set by `shard_quorum_protocol.md`).
- The gateway aggregates the signatures into a **shard proof bundle**.
- The shard hash and its proof bundle are **embedded into the final transaction record** and appended to NodeChain (I8), so the confirmation and its authors are permanently reproducible (I5).

---

## 6. Signature hashing formula

```
shard_hash = SHA-256(shard_content ‖ shard_id ‖ node_nonce)
signature  = sign_private_key(shard_hash)
```

Each signature is unique per validator node and per shard instance. *Because* the hash is a deterministic function of recorded inputs (I5), any auditor can recompute `shard_hash` and re-verify the signature from the chain — the confirmation cannot be forged after the fact.

---

## 7. Invalid signatures

If a node submits a signature that does not verify, or that signs a mismatched hash:

- the shard is **rejected and reassigned** to a fallback node (see `shard_quorum_protocol.md`);
- the event is **appended to the audit record** (I8), lowering the node's reputation deterministically (I5; `node_registration_and_auth.md` §4);
- the node earns **nothing for that shard** — not as a fine, but because there is no confirmed work to pay for (I3);
- the Eye may **veto** the offending step if it would violate an invariant (I7).

There is no held stake to slash here; the consequence is loss of reputation and of payment for work not confirmed (I3) — see `node_registration_and_auth.md` §2.

---

## 8. Repository location

```
02_nodechain_engine/
└── shard_signature_model.md
```
