# NodeChain — Invariants

**Code:** `src/nodechain` (+ `src/invariants` write-path asserts)  
**Canon:** §XI I3, I4; §III.3  

---

## Canon invariants (module-critical)

### I3 — Significant event on NodeChain

Every significant event involving a tokenized asset or economic side-effect must be recorded on NodeChain. Without a record, the event is **invalid**.

| Enforcement | Behavior |
|-------------|----------|
| Callers fail closed if append fails | No client ack, no silent side-effect |
| Product flows order NodeChain before emission/ack | P0–P1 decisions |

### I4 — Determinism

Same inputs → one result. Content hashes and height ordering make replay and audit deterministic.

| Enforcement | Behavior |
|-------------|----------|
| Content hash + prevHash chain | Tamper-evident linear history |
| Non-deterministic payload gaps | Reject append / fail closed upstream |

---

## Local ledger invariants

| Rule | Effect if violated |
|------|--------------------|
| No rewrite of past entries | Reject mutation; append-only forever |
| No soft finality | Immediate immutability on successful append |
| Postgres ≠ SoT | If primary unavailable, fail closed; never treat mirror as truth |
| Content hash required where record type demands it | Reject incomplete linkage |
| Writer role authorized | Unauthorized append → reject |
| Institution read scope | Own processes only; full history denied |
| Single shard (v1) | No multi-shard topology |
| Sensitive at rest | Sensitive payloads encrypted; plain storage is a defect |

---

## Ordering and uniqueness

- **ledgerHeight** is the global order key for significant events.  
- **processId** uniqueness for open PoT / process lifecycle is enforced with orchestrator + pot; NodeChain supports uniqueness and navigation.  
- Double economic confirmations are handled by pot (`POT_DOUBLE_CONFIRM`); NodeChain does not “overwrite” a prior verdict.

---

## Fail-closed matrix

| Condition | Behavior |
|-----------|----------|
| Unauthorized append | Reject (`NODECHAIN_APPEND_UNAUTHORIZED`) |
| Mutate past entry | Reject |
| Institution full-history request | Deny (Eye/audit only) |
| Primary store unavailable | Fail closed (no silent Postgres-as-truth) |
| Missing content hash when required | Reject |
| Kill switch / read-only mode | Reject appends that change economic state |

---

## What NodeChain does **not** enforce alone

| Concern | Owner |
|---------|-------|
| PoT verified = 1 before mint | pot + emission + aroscoin |
| Pro-rata I9 distribution | emission |
| Selective custody must not hold client funds | reserve / invariants I6 |
| Eye veto of bad entries | **Forbidden** — Eye observes only |

NodeChain provides the immutable substrate; economic modules assert business preconditions **before** calling append, and treat append failure as hard stop.

---

## Testing expectations

- Append → read by height returns identical content.  
- Rewrite API does not exist or always rejects.  
- Mirror lag does not change SoT reads.  
- Sensitive flag encrypts payload; decrypt only for authorized readers.  
- Institution scoped query never leaks foreign processIds.  
