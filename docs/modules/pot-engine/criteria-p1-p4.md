# PoT Criteria P1–P4

**Code:** `src/pot` (`CriteriaResult`, evaluation)  
**Canon:** §4.2 (formal definitions live in Core Canon)  
**Decisions:** P4 PoT Criteria  

---

## Rule: all four always

All four criteria apply to **every** process type in v1. There is **no** per–asset-class subset that skips a criterion.

- Criteria are versioned with the **canon semver**.  
- Failure of **any** criterion → immediately `verified = 0` with **mandatory reason codes**.  
- Positive verdict requires **all** of P1–P4 true in `criteriaResult`.

---

## Criterion table

| ID | Criterion (canon text) |
|----|------------------------|
| **P1** | The process is initiated in an allowed architectural context (valid institutional certificate + allowlist). |
| **P2** | The full sequence of execution stages has been completed. |
| **P3** | All significant states are recorded in NodeChain. |
| **P4** | The process is completed under the rules of the specific process type (deterministic result). |

---

## Evaluation notes

### P1 — Allowed context

- Institutional certificate (КЭП / X.509 class as per nodes pack) is valid and not suspended.  
- Institution / process type is on the allowlist for the environment.  
- Reject unknown or revoked identities before quorum counting.

### P2 — Full stage sequence

- Process type defines a fixed stage list (orchestrator pipeline + process-specific docs).  
- Partial completion cannot yield `verified = 1`.  
- Missing stage evidence → P2 false + reason code.

### P3 — Significant states on NodeChain

- Significant intermediate states required by process type appear as NodeChain records (or are being closed under rules that demand them).  
- PoT does not invent ledger history; it checks presence / linkage of required records and snapshot chain integrity.

### P4 — Process-type completion rules

- Deterministic completion: same inputs would yield the same terminal state.  
- Process-type-specific predicates (e.g. primary tokenization package complete, revaluation package complete).  
- Non-deterministic gaps → fail closed.

---

## CriteriaResult shape

```
CriteriaResult {
  P1: boolean
  P2: boolean
  P3: boolean
  P4: boolean
  reasonCodes?: Partial<Record<'P1'|'P2'|'P3'|'P4', string>>
}
```

For `verified = 1`, all of P1–P4 must be `true`. Reason codes are **required** when any criterion fails.

---

## Interaction with quorum

Criteria evaluation and quorum confirmation work together:

1. Evidence and `criteriaResult` are prepared / validated.  
2. Assigned validators submit qualified signatures.  
3. Quorum threshold must be met **and** criteria must all pass.  
4. If criteria fail, verdict is `verified = 0` even if signatures exist.  
5. If quorum fails before timeout, status becomes `expired` (not a silent partial success).

---

## Forbidden shortcuts

| Shortcut | Status |
|----------|--------|
| Skip P3 because “we trust the institution” | **Forbidden** |
| Auto-pass P1 for sandbox without allowlist config | Environment-specific config only; still evaluate |
| Override verified via Eye | **Forbidden** |
| Admin force-verify for mint | **Forbidden** (no free mint) |
