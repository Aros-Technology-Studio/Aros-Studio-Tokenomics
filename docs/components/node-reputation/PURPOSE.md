# PURPOSE — `node-reputation`

**Status:** ready  
**Canon refs:** `docs/AST-CORE-CANON.md` §9.8, §XII; nodes pack (suspend)  
**Code path:** `src/node-reputation/`  
**Clarifications:** P1 nodes; P4.16 support modules (real in v1)

---

## Why this exists

Tracks node participation quality and derives **reputation / commission weight**. Supports **suspend without slashing** (quorum exclusion + grace) so the network can de-weight unreliable nodes without seizing funds.

---

## Responsibility

- Owns: participation counters (success/fail), reputation score formula, commission weight, suspend-with-grace and restore-after-grace signals to `nodes`.
- Contributes to: quorum eligibility (via `nodes` status), commission distribution weights.
- Does **not** own: certificate issuance, mTLS, validator key management, fund seizure, Eye enforcement, PoT verdicts.

---

## Boundary (must not)

- Must not slash or seize ARO / reserve.  
- Must not self-issue node certificates.  
- Must not replace PoT quorum math (only feeds eligibility/weight).  
- Must not act as a police / punishment layer beyond suspend + grace + weight.

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Formula: `nodeReputation = (Σ successful / Σ total) × uptimeFactor` | Invent alternate scoring as sole SoT without canon update |
| Suspend = reputation path + quorum exclude + **24h** grace (default) | Slashing / fund seizure |
| Restore after grace when eligible | Permanent ban without governance path |
| Weight ≥ 0 for commission use | Negative weights that invent debt |
| Heartbeat/uptime input from nodes ops | Fake uptime without evidence |
| Fail-closed on missing nodeId for mutating ops | Silent no-op on unknown node for suspend |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| `nodes` | identity, status active/suspended, heartbeats |
| `commission` | consumes weights for node share |
| `pot` | quorum set may exclude suspended |
| `all-seeing-eye` | observes suspend/restore events |
| `invariants` | no custody/slash invention |
