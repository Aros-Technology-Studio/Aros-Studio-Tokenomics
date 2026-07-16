# PoT — Quorum

**Code:** `src/pot` (`quorum.ts` and related)  
**Decisions:** P0 pot — M-of-N default 2/3  

---

## Model

PoT confirmation uses **M-of-N** quorum among the **assigned validator set** for the process.

| Symbol | Meaning |
|--------|---------|
| `N` | Size of assigned validator set for this process |
| `M` | Minimum confirmations required |
| Default | **2/3** — M = ceil(2N/3) (implementation must match ratified default) |

Validators submit **qualified signatures**. Orchestrator does not cast votes.

---

## Counting rules

1. Only validators in `assignedValidatorIds` count.  
2. Each institutional certificate counts as **1 vote** even if multiple nodes share the institution (canon §XII).  
3. Signatures must bind to processId + snapshot hash material (implementation-defined signed challenge).  
4. Duplicate submissions from the same cert do not increase the count.  
5. QuorumActual and quorumRequired are recorded on the verdict for audit.

---

## Interaction with criteria

Quorum alone is **not** sufficient:

```
verified = 1  ⇔  (all P1–P4 true) ∧ (quorumActual ≥ quorumRequired) ∧ (not expired) ∧ (not double-confirm)
```

If criteria fail, result is `verified = 0` regardless of signature count.

---

## Timeout interaction

| Situation | Outcome |
|-----------|---------|
| M reached, criteria pass, within 15m | `verified = 1` → NodeChain |
| Criteria fail at any time | `verified = 0` + reason codes |
| M not reached by 15m | `expired` |
| Extra confirms after terminal | `POT_DOUBLE_CONFIRM` path |

---

## Assignment

- Assigned set comes from **nodes / config** for the process type and institution.  
- Suspended nodes: reputation + quorum exclude + 24h grace (nodes pack) — they must not remain effective voters.  
- Heartbeats / min uptime (default 95%) inform eligibility but pot does not invent reputation scores (owned by `node-reputation`).

---

## What quorum is not

| Not | Why |
|-----|-----|
| Nakamoto hash race | PoT is institutional process validation |
| Stake-weighted DeFi voting | Canon forbids staking/farming as value origin |
| Eye majority | Eye has no vote |
| Orchestrator multi-sig override | Orchestrator coordinates only |
| BFT consensus for whole chain | BFT later; PoT+quorum enough for v1 value gate |

---

## Output fields (verdict)

| Field | Notes |
|-------|-------|
| `quorumRequired` | M |
| `quorumActual` | Confirming unique votes counted |
| `validatorIds` | Who confirmed |
| `ledgerHeight` | After NodeChain append on success path |

---

## Fail closed

Insufficient quorum at deadline does **not** yield partial mint, provisional tokens, or deferred `verified = 1` without a new process. Retry = new processId and new assignment window.
