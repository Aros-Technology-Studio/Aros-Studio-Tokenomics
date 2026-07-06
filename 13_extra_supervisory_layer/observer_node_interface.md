# Observer Node Interface

**Stands on:** I7 (observe and VETO, never initiate), I8 (append-only causality), I5 (determinism), I6 (no speculative surface). See `README.md` §1.

## 1. Purpose

This document defines **Observer Nodes**: read-only participants that receive, verify, and redundantly store the Eye's meta-event record (observations, vetoes, integrity signals). They are the external check on the Eye itself — they make the Eye's conduct auditable — but they hold **no** power to act on the protocol.

The Eye holds the veto (I7). Observer nodes hold neither a veto nor any economic primitive: their whole function is *verification of a record*. This asymmetry is deliberate and derived — a single apex observer suffices to *stop* violations (I7), while a wide set of read-only verifiers suffices to keep that apex honest without adding any new discretionary actor (I1, I5).

---

## 2. Role of observer nodes

An observer node is a **read-only reader and verifier** of NodeChain's supervisory records.

Its functions:

- Receive signed meta-events (see `meta_event_logging_protocol.md`).
- Verify each meta-event's signature and its `seq`/`cause_ref` links against NodeChain.
- Store meta-events redundantly, so the Eye's record cannot be silently lost.
- Reconstruct and re-check the Eye's dispositions from recorded causes — confirming, independently, that every veto matched an invariant negation and that the Eye authored no economic cause.

Its non-functions, each derived:

- **Does not veto.** The veto is the Eye's alone (I7); an observer only *checks* that a veto was warranted.
- **Does not vote or set parameters.** Governance is role-based AI committees, not a franchise (see `README.md` §5); and a held balance grants no power (I6).
- **Does not mint, burn, or pay, and cannot be staked to earn.** AST has only payment for PoT-confirmed work (I3); running an observer node is not such work, so it neither requires a deposit nor produces a payment. There is **no object** here for staking-to-participate or earning-for-uptime — I6 leaves no deposit-to-participate mechanic, and I3 leaves no payment absent confirmed work.

---

## 3. Registration

An observer node joins by authorization, not by stake.

- The node presents a public key and a signed identity challenge (nonce), proving control of the key.
- Admission is a **role-based AI committee** decision (see `README.md` §5), appended to NodeChain before it takes effect (I8) and reproducible (I5).
- On admission the node receives a read-only credential and a unique node id; the `observer_join` meta-event is appended (I8).

No deposit, bond, or held balance is part of admission, because I6 leaves no deposit-to-participate object and I3 pays only for confirmed work. Authorization is by role, verifiable on NodeChain, and confers read access only.

---

## 4. Subscription model

An observer node subscribes to meta-event types it will verify and store. All are read-only.

| Meta-event type | Default access |
| --- | --- |
| `observation` | granted |
| `veto` | granted |
| `integrity_signal` | granted |
| `scope_note` | granted |
| `observer_join` / `observer_exit` | granted |

```
POST /eye/observer/subscribe
{ "node_id": "OBS-3495", "types": ["veto", "integrity_signal"] }
```

Subscription changes what a node *receives*; it can never change what a node can *do*, which is fixed at "verify and store" by I7.

---

## 5. Signature verification

Every meta-event delivered to an observer node carries:

- a content hash,
- the Eye's supervisory signature,
- its `seq` position and `cause_ref` link on NodeChain.

The node must:

- verify the signature and hash before storing,
- confirm `cause_ref` resolves to a real recorded cause and that the disposition matches an invariant negation (for a veto) — an independent replay of the Eye's reasoning (I5),
- discard any entry that fails verification and record the failure as its own observation for oversight.

Because the whole record is reproducible from NodeChain (I5, I8), an observer node can detect any tampering or any veto that did *not* correspond to an invariant negation — this is how the community of observers keeps the apex Eye honest without wielding a veto of their own.

---

## 6. Node behavior expectations

- Maintain availability, so redundancy is real.
- Never alter, reorder, or filter meta-events — doing so would break `seq` reproducibility (I5, I8) and is itself detectable.
- Use encrypted, mutually authenticated transport (service-to-service; there is no end-user surface).

A node that alters records or fails verification has its read credential revoked by role-based committee decision, appended before effect (I8). Revocation removes *read access* only — an observer never had any power to revoke beyond that.

---

## 7. Scalability by partition, not by stake

Load is handled by partitioning the read work, never by economic gating.

- Observer nodes may partition by meta-event type or `processId` range, each verifying a slice of the record; together they cover the whole.
- Adding capacity is adding read-only verifiers — which, because they hold no primitive (I7), can never destabilize the protocol no matter how many join.

There is **no object** here for stake-weighted sharding, on-chain economic penalties, or testnet-token deposits: participation is by role authorization (§3), not by holding or depositing value (I6).

---

## 8. Interface endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/eye/observer/status` | Current observer state |
| POST | `/eye/observer/subscribe` | Subscribe to meta-event types |
| GET | `/eye/observer/events` | Fetch meta-event records (read-only) |
| GET | `/eye/observer/verify` | Verify a meta-event's signature and links |

Every endpoint is read-only and requires a signed, role-authorized credential. None can append an economic cause — the interface exposes no such primitive, because the Eye and its observers have none (I7).

---

## 9. Exit and revocation

- A node may exit voluntarily; an `observer_exit` meta-event is appended (I8).
- A node may be revoked by role-based committee decision for altering or failing to verify records; the revocation is appended before effect (I8) and reproducible (I5).

Revoked and exited node ids are recorded on NodeChain, so the observer set at any time is reconstructable (I5).

---

## 10. Summary

Observer nodes are the **read-only verifiers of the Eye's record**. They keep the apex observer auditable by independently replaying its reasoning from recorded causes (I5, I8) — yet they hold no veto, no vote, and no economic primitive (I6, I7). They participate by role authorization, never by stake, and they can witness and verify — never act.
</content>
