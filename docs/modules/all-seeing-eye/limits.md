# All-Seeing Eye — limits and hard bans

**Module:** `all-seeing-eye`  
**Canon:** §4.3, §X (hard prohibitions), §XII  
**Principle:** `docs/principles/ANTI_POLICE.md`

---

## Hard bans (executive)

The Eye **must never**:

| Action | Why |
|--------|-----|
| **Veto** a process step | Canon §4.3 / §X |
| **Rollback** ledger or economic state | Canon §4.3 / §X |
| **Mint** ArosCoin or asset tokens | Not an economic actor |
| **Burn** | Not an economic actor |
| **Pay** nodes or commissions | Settlement is commission module post-factum |
| **Initiate** Orchestrator processes as policy police | Parallel observation only |
| Replace **fail-closed** owned by executing modules | Write path remains module-owned |
| Act as **AI command hierarchy root** | AI L1–L3 are separate; Eye observes |

Static analysis / CI should fail the build if Eye packages export or call mint/burn/pay/veto/rollback APIs.

---

## Production enablement

| Environment | Eye disable allowed? |
|-------------|----------------------|
| `local`, `test`, `sandbox` | Yes (dev convenience) |
| `prod` | **No** — config reject / throw |

Implementation reference:

```text
setEnabled(false, 'prod') → Error('Eye cannot be disabled in prod')
```

There is **no** production kill-switch that turns the Eye off while economic modules continue unobserved as a designed mode.

---

## Fail-closed ownership

```text
Write path fail-closed  →  pot | nodechain | emission | orchestrator | …
Observation path       →  Eye
```

If Eye is unavailable:

1. Ops are alerted by infrastructure monitoring of the Eye process  
2. Modules **continue** to enforce invariants and fail-closed  
3. Economic initiation is **not** delegated to Eye  

---

## Mirror and lag limits

| Limit | Value |
|-------|--------|
| Analytic mirror max lag | **30 seconds** (Canon §XII) |
| Mirror as SoT | **Forbidden** |
| Mirror contradicts NodeChain | NodeChain wins |

Exceeding lag is an ops/SLO issue → notify (`E_MIRROR_LAG` class), not a license to invent truth in the mirror.

---

## Ban list vs punishment engine

Monitoring may maintain a **ban list for observation** (e.g. noisy sources, redaction of sensitive fields in mirror). It must **not** become:

- Slashing  
- Automatic node execution  
- Economic fine without process  

Node suspend is reputation + quorum + **24h grace, no slashing** (nodes pack); Eye only observes.

---

## Separation from Orchestrator compensation

| Mechanism | Owner |
|-----------|--------|
| Saga compensation (pre-`verified=1`) | Orchestrator |
| Settlement retry after mint | Commission / Orchestrator policy |
| Phase reverse | Governance + release + NodeChain |
| Eye alert | Eye |

Eye must not implement or trigger saga reverse as if it were rollback authority.

---

## Acceptance limits checklist

- [x] Observe / record / notify only  
- [x] No veto, rollback, mint, burn, pay, initiate  
- [x] Separate process deployment requirement  
- [x] Reason codes required on alerts  
- [x] Mirror lag ≤ 30s  
- [x] Prod cannot disable Eye  
- [x] Fail-closed remains in executing modules  

---

## Summary one-liner

**The Eye sees everything and commands nothing.**  
