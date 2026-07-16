# Module: PoT Engine (Proof of Transaction)

**Code:** `src/pot`  
**Canon:** §4.2, §III.1, invariant I1  
**Decisions:** P0 pot; P4 P1–P4 criteria  
**Pack:** `docs/components/pot/`

---

## Purpose

PoT is the **only gate** for origin and change of value. Without a positive verdict (`verified = 1`), value does not arise, does not change, and is not recognized as valid.

PoT validates the **fact of institutional process execution**, not hash-power or stake consensus. It performs **no amount math** and never mints tokens.

---

## Responsibility

| Owns | Does not own |
|------|----------------|
| Evidence intake (processId, snapshot, signatures) | Mint/burn amounts |
| Criteria evaluation P1–P4 (all always) | Institutional asset appraisal |
| Quorum M-of-N (default 2/3) | Fee schedules |
| Binary `verified` 0\|1 and expiry | BFT consensus layer |
| Double-confirm rejection | Client wallet UX |
| NodeChain record before emission signal | Eye veto (forbidden) |

---

## Design summary

1. **All four criteria P1–P4** apply to every process type in v1.  
2. **Quorum validators submit**; Orchestrator **coordinates only**.  
3. **Default quorum** M-of-N with M = ceil(2N/3) (2/3 default).  
4. **Timeout 15 minutes** → `expired` → retry needs **new processId**.  
5. **NodeChain append before** any emission/ok-to-emit consumption.  
6. **Double confirm** same processId → **error** + Eye-visible record.  
7. **No amount math** in this module.

---

## Documents in this folder

| File | Content |
|------|---------|
| [criteria-p1-p4.md](./criteria-p1-p4.md) | Formal criterion meanings and fail codes |
| [evaluation-process.md](./evaluation-process.md) | Lifecycle pending → verified/rejected/expired |
| [quorum.md](./quorum.md) | M-of-N, 1 vote per institutional cert |
| [api.md](./api.md) | Service surface, verdict DTO, errors |

---

## Pipeline position

```
Start → Docs → Oracle? → PoT → NodeChain → Emission → Settlement → State → End
```

Emission and settlement **must not** run economic side-effects unless PoT `verified = 1` and the verdict is on NodeChain.

---

## Forbidden

- Free mint or “soft verify” without criteria  
- Computing ARO amounts inside pot  
- Orchestrator casting validator votes  
- Eye reversing `verified = 1`  
- Treating ERC events as PoT success  
