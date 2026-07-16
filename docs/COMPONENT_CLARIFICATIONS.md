# Component Clarifications (owner questionnaire)

**Status:** Open — answers pending  
**Purpose:** Capture exact product intent per component before PURPOSE/MODEL/CONTRACT/ACCEPTANCE packs and code.  
**Language:** English in repo; product owner may answer in Russian in chat — answers are translated here.  
**Principle:** [ANTI_POLICE.md](./principles/ANTI_POLICE.md)

How to use:

1. Answer **P0 first** (blocks everything else).  
2. Then P1 → P2 → P3.  
3. Short answers are fine (“yes / no / X means Y”).  
4. After answers land, each component gets a **build rule card** (what must be true / must not be true) and then the 4-file pack.

Answer key format under each question:

```
A: …
```

---

# P0

## 1. `invariants`

1. Is the list in older short-canon §12 the **complete** set of system invariants for v1, or do you want more named invariants (list them)?  
   `A:` **Superseded.** Source of truth is root **`CANON.md` — AST Core Canon v1.0 Final (16 July 2026)**.  
   Invariants are **I1–I9** (`CANON.md` §XI). Hard prohibitions in §X.  
   Eye has **no veto / no rollback** (§4.3). Selective custody of **own** funds only (§4.4).  
   Prior questionnaire notes and external drafts are historical only.
2. Should invariants live as **pure functions / predicates** (no I/O), or also as runtime guards wired into every write path?  
   `A:`
3. Who is allowed to **evaluate** an invariant: only All-Seeing Eye, any component before side effects, or both?  
   `A:`
4. On violation: **fail closed** only, or fail closed **and** Eye notification (Eye has no veto per Core Canon)?  
   `A:`
5. Are invariants **versioned** (IDs + semver), or a single frozen set until a canon amendment?  
   `A:`
6. Must every invariant map to an **automated test** in CI, or only a documented checklist for v1?  
   `A:`
7. Can a process continue if a **non-critical** check fails, or is every listed invariant critical?  
   `A:`
8. Should “ArosCoin born = burned (eventual)” be checked **online** (hard gate) or **offline reconciliation**?  
   `A:`
9. Do invariants cover **legal/licensing** statements (selective custody of own funds only) as machine-checkable rules, or only technical economics?  
   `A:`
10. Preferred module API shape: `assertInvariant(id, ctx)` / `checkAll(ctx)` / event `InvariantBroken` — which?  
    `A:`

---

## 2. `pot` (Proof-of-Transaction)

1. What is the **minimum evidence** that a transaction “has been executed” (payload fields, signatures, node set)?  
   `A:`
2. How many nodes must confirm: **1**, **M-of-N**, **all assigned**, or other?  
   `A:`
3. Is PoT verdict binary (`verified` / `not`) or multi-state (`pending`, `verified`, `rejected`, `expired`)?  
   `A:`
4. Can PoT be **revoked** after `verified`, or is it final?  
   `A:`
5. Timeout: what happens if confirmation never completes?  
   `A:`
6. Is PoT **only** about work confirmation, or also about ordering / uniqueness of process IDs?  
   `A:`
7. Who **submits** confirmation: the executing node, a quorum, the orchestrator?  
   `A:`
8. Must PoT record be **append-only in NodeChain** before emission may run?  
   `A:`
9. Relationship to emission: does `pot` **emit amounts**, or only signal “ok to emit” to `emission`?  
   `A:`
10. Double confirmation of the same process: ignore, error, or Eye-relevant?  
    `A:`

---

## 3. `reserve`

1. What **asset types** can sit in reserve for v1 (fiat, crypto, multi)?  
   `A:`
2. Where does reserve **physically/logically** sit: AST books only, external Anchor, both with reconciliation?  
   `A:`
3. Is “1:1” exact in **units of reserve asset**, in **ArosCoin arx**, or both with a fixed rate snapshot?  
   `A:`
4. Can one reserve bag back **multiple** ArosCoin claims, or strictly one claim ↔ one reserve record?  
   `A:`
5. Who **locks** reserve before mint: orchestrator call, reserve service, contract only?  
   `A:`
6. Partial release: is reserve **split** into child records or one record with remaining balance?  
   `A:`
7. If reserve is missing/insufficient at mint time: hard fail, queue, or other?  
   `A:`
8. Does reserve expose **public API** to institutions, or only internal services?  
   `A:`
9. Solidity `ArosCoinReserveManager`: is TS `reserve` the **source of business truth** and Solidity a mirror, or reverse?  
   `A:`
10. Index / capitalization of reserve (if any for v1): required, deferred, or out of scope?  
    `A:`

---

## 4. `aroscoin`

1. Symbol / decimals for v1: confirm `ARO` / `9` or different?  
   `A:`
2. Is ArosCoin a **ledger entry only** (no transferable wallet UX), or transferable **inside** AST only?  
   `A:`
3. Split rules on partial return: by amount, by %, min dust?  
   `A:`
4. Identity of a unit: `claimId`, process id, contract id — canonical primary key?  
   `A:`
5. Double-mint protection: where is uniqueness enforced (TS, Solidity, both)?  
   `A:`
6. Can a claim be **reassigned** to another participant without burn, or only burn/remint?  
   `A:`
7. Holding period / expiry of a claim: none, optional, required?  
   `A:`
8. Rate on mint: always snapshot from config, oracle, or manual institutional input?  
   `A:`
9. Who may call mint in software terms: only `emission` after PoT, or also admin path (forbidden)?  
   `A:`
10. Must every mint/burn emit a **NodeChain-recorded event** before ack to client?  
    `A:`

---

# P1

## 5. `nodechain`

1. Data model: pure **DAG of process nodes**, linear log, or hybrid?  
   `A:`
2. Storage for v1: Postgres (TypeORM already in stack), other, both?  
   `A:`
3. Are “blocks” ever used as metaphor in APIs, or forbidden wording?  
   `A:`
4. Sharding / multi-tenant partitions for v1: yes or no?  
   `A:`
5. Encryption of ledger payloads at rest: required for v1?  
   `A:`
6. Who may **append** entries: only internal services with roles, or also registered nodes?  
   `A:`
7. Read API: full history for institutions, or only own processes?  
   `A:`
8. Finality: when is an entry **immutable** (immediate append-only vs soft then seal)?  
   `A:`
9. Cross-link to PoT/ArosCoin: foreign keys / content hashes — preferred?  
   `A:`
10. BFT or other consensus **inside** NodeChain code for v1, or deferred (PoT is enough)?  
    `A:`

---

## 6. `nodes`

1. Node identity: key pair, institutional cert, both?  
   `A:`
2. Registration: open, allowlist, manual approval?  
   `A:`
3. Auth: JWT, mTLS, signed challenges, other?  
   `A:`
4. Node roles/capabilities (executor, confirmer, observer): fixed set?  
   `A:`
5. Can a node be **suspended** without “slashing” economics? How?  
   `A:`
6. Minimum uptime / heartbeats required for v1?  
   `A:`
7. Geographic / jurisdiction constraints for v1?  
   `A:`
8. Payment to nodes (if any): in ArosCoin, off-book, or later phase?  
   `A:`
9. API surface: only `/node/register` + `/node/auth`, or more?  
   `A:`
10. Multi-node per institution: allowed?  
    `A:`

---

## 7. `emission`

1. Exact meanings of `TV` and `U` (units, window, who measures)?  
   `A:`
2. Values or sources of `α`, `β`, `γ` for v1 (fixed constants vs config)?  
   `A:`
3. Emission output unit: whole ARO, arx integers, or reserve-native units?  
   `A:`
4. Rounding rules?  
   `A:`
5. Is emission **deterministic** from recorded inputs only (must be replayable)?  
   `A:`
6. Caps or max emission per process / day: none or yes?  
   `A:`
7. Does emission **call** aroscoin.mint, or only return an amount DTO?  
   `A:`
8. Zero or negative formula result: reject process or emit zero?  
   `A:`
9. Who may change α,β,γ: config deploy, governance, never without canon change?  
   `A:`
10. Link process-part vs node-earned part (if any split): in emission or commission?  
    `A:`

---

## 8. `commission`

1. Is there a **single** commission rate for v1 (e.g. 0.5%) or multiple schedules?  
   `A:`
2. Base of commission: TV, emission amount, reserve amount?  
   `A:`
3. Split recipients (e.g. nodes vs system reserve): exact ratios if any?  
   `A:`
4. When is commission taken: on PoT, on mint, on release?  
   `A:`
5. Currency of commission: ArosCoin, reserve asset, off-ledger invoice?  
   `A:`
6. Is commission **burned**, redistributed, or accrued to AST?  
   `A:`
7. Institutional fee waivers / tiers for v1?  
   `A:`
8. Must commission path be visible in NodeChain?  
   `A:`
9. Preferred payment vocabulary in APIs (post-factum payment for confirmed work — avoid banned terms).  
   `A:`
10. v1 minimal: “record rate only” vs “full distribution engine”?  
    `A:`

---

## 9. `all-seeing-eye`

Per Core Canon §4.3 / §X: Eye **observes, records violations, notifies** — **no veto, no rollback**.

1. Scope of visibility: every module event, or only paths tagged “critical”?  
   `A:`
2. Sync or async **notification** (alert stream vs batch audit)?  
   `A:`
3. Who consumes Eye alerts for v1: ops human, orchestrator, both?  
   `A:`
4. Alert payload: reason codes required?  
   `A:`
5. When Eye records a breach, who owns **fail-closed** in the executing module (not Eye)?  
   `A:`
6. Is Eye a Nest module, separate process, or both?  
   `A:`
7. Audit log of observations/alerts: where stored (NodeChain only / separate)?  
   `A:`
8. Can Eye be **disabled** in dev/test only, never in prod?  
   `A:`
9. Explicit ban list: Eye must never call mint/burn/pay/veto/rollback — confirm extras.  
   `A:`
10. Relationship to AI hierarchy: parallel observation plane only?  
    `A:`

---

# P2

## 10. `orchestrator`

1. What is a **process** ID and who creates it?  
   `A:`
2. Fixed pipeline steps for v1 (list order)?  
   `A:`
3. Compensation/saga on mid-pipeline failure?  
   `A:`
4. AI hierarchy in v1: stub interfaces only, or real Python services?  
   `A:`
5. Human institutional approval steps in the pipeline?  
   `A:`
6. Idempotency keys for process start?  
   `A:`
7. Max concurrent processes per institution?  
   `A:`
8. Orchestrator as sole entrypoint for economic cycle — yes/no?  
   `A:`
9. Timeouts per step defaults?  
   `A:`
10. Observability: what must be logged vs written to state-recording?  
    `A:`

---

## 11. `state-recording`

1. What is a **state record** (schema essentials)?  
   `A:`
2. Same store as NodeChain or separate table/service?  
   `A:`
3. Write-ahead: must record exist **before** side effect ack?  
   `A:`
4. Retention / immutability policy for v1?  
   `A:`
5. PII / secrets redaction rules?  
   `A:`
6. Query API for institutions?  
   `A:`
7. Correlation ids: processId, potId, claimId — required set?  
   `A:`
8. Difference from NodeChain ledger in one sentence (your words)?  
   `A:`
9. Failure to record: block the business action?  
   `A:`
10. Replay tool for determinism checks in v1?  
    `A:`

---

## 12. `release`

1. Who may request release: claim holder only, institution admin, system?  
   `A:`
2. Partial min amount / dust rules?  
   `A:`
3. Rate on reverse path: always emission-time K₁, or configurable K₂?  
   `A:`
4. Who bears FX risk when K differs (if ever)?  
   `A:`
5. Atomic burn+release: single transaction boundary?  
   `A:`
6. Multi-step approval for large releases?  
   `A:`
7. Release before full process completion — allowed?  
   `A:`
8. Evidence required to release (docs, signatures)?  
   `A:`
9. After full burn: claim tombstone forever?  
   `A:`
10. Events that must hit NodeChain on release?  
    `A:`

---

# P3

## 13. `common`

1. What belongs in `common` for v1 (list: money types, ids, errors, crypto helpers…)?  
   `A:`
2. Forbidden in `common`: business rules of which domains?  
   `A:`
3. Shared error code catalog: yes/no?  
   `A:`
4. Decimal/money library preference?  
   `A:`
5. Logging/tracing helpers centralized here?  
   `A:`
6. Config loading shared module?  
   `A:`
7. Public export surface: deep imports ok or barrel only?  
   `A:`
8. Test utilities in `common` or separate `testing`?  
   `A:`
9. Any shared **domain events** bus types here?  
   `A:`
10. Versioning of shared types with breaking changes policy?  
    `A:`

---

## After answers

For each component, produce:

1. **Build rule card** (must / must not / depends on) — English, in pack or `docs/components/<name>/`  
2. Four-file pack: PURPOSE, MODEL, CONTRACT, ACCEPTANCE  
3. Only then implementation under `src/<name>/`

Do not invent economics to fill silence; leave `A:` empty until the owner answers.
