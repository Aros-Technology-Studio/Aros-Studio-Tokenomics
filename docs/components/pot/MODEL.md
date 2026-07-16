# MODEL — `pot`

**Status:** ready  
**Canon refs:** `CANON.md` §4.2, §IX.1

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| Process | Unit of confirmed work / institutional confirmation | `processId` (unique) |
| ExecutionSnapshot | Hash-chained execution evidence | `hash`, `prevHash` |
| ValidatorSet | Assigned validators for process | `validatorId[]` |
| CriteriaResult | Outcomes of conditions P1–P4 | structured pass/fail per criterion |
| Verdict | PoT outcome | `verified ∈ {0,1}` |
| PoTRecord | NodeChain-recorded confirmation | ledger entry + `ledgerHeight` |

---

## States and lifecycle

```
pending → verified (1)     [final, immutable]
pending → expired          [timeout; fail closed; new processId required]
```

`verified = 0` is the non-success binary state (rejected / not verified). Orchestration may retain `pending` and `expired` as service statuses.

Quorum: configurable M-of-N; **default M = ceil(2/3 × N)** of assigned validators.

---

## Invariants

| ID | Invariant | Effect if violated |
|----|-----------|--------------------|
| I1 | No value without verified=1 | fail closed |
| local | processId unique | error + Eye record |
| local | verified final | reject revoke |
| local | emission only after NodeChain PoT append | fail closed |

---

## Formulas / constants

```
PoT_volume = Σ(tx.amount × tx.verified)
```

`tx.verified = 1` only under positive PoT verdict (`CANON.md` §9.1).

Default quorum ratio: **2/3** of assigned validators (configurable).

Criteria **P1–P4**: must all pass in `criteriaResult` (detailed criterion specs may live with processing layer; absence of all-pass ⇒ no verified=1).
