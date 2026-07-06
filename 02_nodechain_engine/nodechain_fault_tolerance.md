# NodeChain Fault Tolerance

**Stands on:** I2 (born-and-burned), I5 (determinism), I7 (Eye veto), I8 (append-only causality). See `README.md` §1.

## Purpose

Define how the NodeChain survives partial failure — node loss, shard delay, network partition, corruption — **without ever acknowledging an effect whose cause is not recorded (I8) and without inventing state (I5).** Fault tolerance here is not "keep running at any cost"; it is "keep running *only* in states that are still reproducible from the append-only record." When those two goals conflict, the chain halts rather than guess.

---

## 1. Objectives

- Maintain transaction processing when individual nodes or shards become unavailable.
- Preserve **integrity and reproducibility** under degradation — a recovered state must be replayable from the recorded causes (I5, I8).
- Detect and isolate failing components quickly, recording the isolation before it takes effect (I8).
- Degrade gracefully; where continuing would break an invariant, halt (the Eye veto, I7).

---

## 2. Why recovery may never invent state — derived

*Because* I5 requires every state to be reproducible from the causes recorded in NodeChain, and *because* I8 requires each cause to be appended before its effect, **therefore** a recovery procedure may only *replay* recorded causes; it may never *synthesize* a confirmation, a payment, or an ordering that was not already caused on-chain. A recovery that guessed a missing confirmation would create an effect with no recorded cause — a state no other node could reproduce, which the model cannot represent. This is why every strategy below reduces to "replay the record" or "halt," never "improvise."

---

## 3. Key strategies

### 3.1 Redundant shard assignment

- Every transaction is assigned a **primary and one or more secondary shards**. If the primary fails or delays beyond threshold, processing fails over to the next shard in the redundancy pool.
- The failover's cause (which primary failed, at what recorded time) is appended before the secondary acts (I8), so the path taken is reproducible (I5).

### 3.2 Timeout-based node ejection

- Each node has a maximum response time per batch (e.g. `150ms`). Repeated violations trigger **soft suspension**, then **hard delisting** after `N` retries.
- The consequence acts on the node's standing and its payment for confirmed work (I3) — an ejected node simply stops earning, because it stops confirming work. There is **no held stake to slash** (`node_registration_and_auth.md` §2).

### 3.3 Quorum-deviation monitoring

- If a shard's quorum diverges beyond threshold (e.g. > 40% disagreement across rounds), the transaction is **re-sharded** to a different group, the divergence recorded first (I8).
- Unstable or dishonest nodes are **flagged to the All-Seeing Eye**, which observes and can **veto** an invariant-violating step (I7) — but the Eye never re-shards or confirms on its own; it only halts.

---

## 4. State recovery logic

- Nodes keep short-term local caches of validated states (default `30s`) purely for speed; the cache is never a source of truth — the append-only chain is (I8).
- On rejoin, a node reconciles by **replaying recorded causes** from its shard neighbours, arriving at the identical state (I5). It does not accept a peer's asserted state that is not backed by recorded causes.
- Periodic **Execution Snapshots** are persisted (e.g. to content-addressed storage such as IPFS) as reproducible checkpoints; a snapshot is valid because it is a pure function of the appended causes up to its point (I5, I8).
- **In-flight process parts (I2).** If a node fails after a process part was minted but before its cycle-closing burn, recovery completes the burn to satisfy I2 (net process supply Δ = 0 per completed cycle). Recovery never "keeps" an unburned process part — that would leave supply that I2 forbids.

---

## 5. Failure types and handling

| Failure type | Handling | Basis |
|---|---|---|
| Node timeout | Reassign workload to fallback; soft-suspend; cause appended | I8, I3 |
| Shard-leader failure | Leader election / fallback swap; cause appended before new leader acts | I5, I8 |
| Network partition | Isolated partition marked stale after timeout; it may read but not finalize (no un-reproducible finalization) | I5, I8 |
| Signature mismatch | Invalidate, re-shard, retry under quorum | I5 |
| Data corruption | Reject; re-fetch and verify against the recorded snapshot commitment | I5, I8 |
| Unburned in-flight process part | Complete the burn on recovery | I2 |

Note the partition rule: a partitioned minority may **not** finalize its own ordering, because two divergent finalizations could not both be reproduced — I5 forbids it. It halts finalization and waits to replay the majority record. This is the Eye-veto principle expressed at partition scale (I7): stop, do not guess.

---

## 6. Alerts and monitoring

- All fault events are appended to the audit stream (I8) and relayed to the monitoring bus and the role-based AI governance layer.
- Nodes report anomalous peers to the All-Seeing Eye for risk profiling. The Eye **observes and can veto** (I7); it does not itself eject, re-shard, or pay — those effects, if taken, are taken by the protocol on recorded causes.

---

## 7. Readiness checklist before deployment

- [ ] Redundant shard assignments tested
- [ ] Timeout and failover thresholds tuned within protocol bounds
- [ ] Execution-Snapshot / checkpoint mechanism validated (replay reproduces state — I5)
- [ ] In-flight-burn-on-recovery path tested (I2)
- [ ] Partition-minority "read-only, no finalize" behaviour verified (I5)
- [ ] Eye-veto wiring exercised (halt, never substitute — I7)
- [ ] Node behaviour reporting integrated
