# Component Clarifications (owner questionnaire)

**Status:** P0 + P1 + P2–P3 answers **canonical for v1**  
**Canon:** `/CANON.md` (AST Core Canon v1.0 Final)  
**Language:** English in repo  

Changes require formal canon amendment.

---

# Pack status

| Priority | Components | Status |
|----------|------------|--------|
| P0 | invariants, pot, reserve, aroscoin | ready |
| P1 | nodechain, nodes, emission, commission, all-seeing-eye | ready |
| P2–P3 | orchestrator, state-recording, release, common | ready |

Full answered text for P0/P1 lives in git history and component packs. Below: **P2–P3 canonical answers**.

---

# P2–P3 — CANONICAL ANSWERS (v1)

## 10. `orchestrator`

1. processId?  
   `A:` Unique id for the full lifecycle of one tokenization / revaluation. Created by **Orchestrator** at start: **UUIDv7 + institutional prefix**.

2. Fixed pipeline v1 order?  
   `A:`  
   1. StartProcess (create processId)  
   2. Document + Signature Validation  
   3. Oracle Gateway (if needed)  
   4. PoT Evaluation  
   5. NodeChain Record  
   6. Emission / Burn (if ΔValue ≠ 0)  
   7. Settlement (commission)  
   8. State Update + Notification  
   9. EndProcess  

3. Mid-pipeline failure?  
   `A:` **Compensating transactions** (saga-style) driven by Orchestrator. On failure, compensate prior successful steps.  
   **Note:** This is pipeline compensation — **not** All-Seeing Eye veto/rollback (`CANON.md` §4.3).

4. AI hierarchy v1?  
   `A:` **Real services** (L1 mandatory; L2/L3 optional).

5. Human institutional approval?  
   `A:` **Optional** only for high-value / high-risk processes (asset policy).

6. Idempotency?  
   `A:` **Yes.** Mandatory `idempotencyKey` at process start.

7. Max concurrent processes per institution?  
   `A:` Configurable (default **10**).

8. Sole economic entrypoint?  
   `A:` **Yes.** Only entry for all economic cycles.

9. Timeouts?  
   `A:` Overall process timeout **30 minutes**. Per-step timeouts configurable.

10. Observability split?  
    `A:` Logs = technical detail. **NodeChain** = all business events and states.

---

## 11. `state-recording`

1. State record schema essentials?  
   `A:` `processId`, `sequenceId`, `timestamp`, `stateType`, `payloadHash`, `prevStateHash`, `validatorId`, `status`.

2. Store vs NodeChain?  
   `A:` **Same** NodeChain ledger. Separate tables only for indexing.

3. Write-ahead before side-effect ack?  
   `A:` **Mandatory** (write-ahead).

4. Retention / immutability?  
   `A:` Full immutability. Retention **forever**.

5. PII / secrets redaction?  
   `A:` **Redaction forbidden.** Sensitive data **encrypted before write**.

6. Institution query API?  
   `A:` Own `processId` / `claimId` only.

7. Correlation ids?  
   `A:` **processId mandatory.** Others as needed.

8. Difference from NodeChain (one sentence)?  
   `A:` State-recording is the **process state snapshots** living **inside** the NodeChain ledger.

9. Fail to record?  
   `A:` **Yes — fail closed** (block business action).

10. Replay tool v1?  
    `A:` **Yes** — built-in replay for determinism checks.

---

## 12. `release`

1. Who requests release / phase actions?  
   `A:` **System only** (on thresholds) + **governance approval**.

2. Link to release_daemon?  
   `A:` Daemon monitors thresholds and **initiates** phase transition.

3. threshold / target defaults?  
   `A:` **Config only** in v1 (no hard-coded numeric defaults in canon packs).

4. Blocked before Release Phase?  
   `A:` Free transfer to external chains, CEX listing, public trading.

5. Allowed after Release Phase?  
   `A:` External transfers, bridge, listing — still under compliance rules.

6. Partial asset release vs phase activation?  
   `A:` **Split modules** (separate).

7. Atomicity with burn/reserve?  
   `A:` **Full atomicity** (all or nothing).

8. Multi-step approval for large releases?  
   `A:` **Yes**, configurable multi-step governance approval.

9. NodeChain on phase change / release ops?  
   `A:` Full event with `prevStateHash` + verifier signatures.

10. Reverse / deactivate Release Phase?  
    `A:` **Yes**, via governance, with mandatory NodeChain record.

---

## 13. `common`

1. What belongs in v1?  
   `A:` Money/Decimal; IDs (processId, claimId, snapshotId); Errors & Reason Codes; crypto primitives (hash, signature verify); Types & Interfaces.

2. Forbidden in common?  
   `A:` Any domain rules, business logic, policies — **technical utilities only**.

3. Shared error catalog?  
   `A:` **Yes**, centralized.

4. Decimal/money library?  
   `A:` `decimal.js` or `big.js` (TypeScript stack → prefer one; pack records both allowed).

5. Logging/tracing helpers?  
   `A:` **Yes.**

6. Shared config loading?  
   `A:` **Yes.**

7. Export surface?  
   `A:` **Barrel exports only.**

8. Test utils?  
   `A:` Separate **`testing/`** package (not inside common).

9. Domain event types?  
   `A:` **No** — only base interfaces.

10. Breaking changes?  
    `A:` Semver + backward compatibility (deprecate; do not remove in v1).
