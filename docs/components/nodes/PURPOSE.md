# PURPOSE — `nodes`

**Status:** ready  
**Canon refs:** `CANON.md` §4.2 (validators), §9.5, §9.8  
**Code path:** `src/nodes/`  
**Clarifications:** P1.6 canonical v1

---

## Why this exists

Manages node identity, registration, authentication, roles, health, and eligibility for PoT quorum and work — without punitive slashing economics.

---

## Responsibility

- Owns: institutional cert + key pair identity, manual approval + allowlist registration, mTLS + signed challenges (JWT internal-only), fixed v1 roles, heartbeat/uptime, geo/jurisdiction constraints, suspend via reputation + quorum exclusion, task assignment API, multi-node per institution.
- Contributes to: validator set for pot M-of-N; node weights for settlement.
- Does **not** own: commission distribution math, PoT verdict finality, slashing deposits.

---

## Boundary (must not)

- Must not open registration without approval.  
- Must not use JWT as primary external node auth.  
- Must not implement stake-slashing as suspend mechanism.  
- Must not invent roles outside the fixed v1 set without canon process.

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Identity = institutional cert (КЭП/X.509) + key pair | Cert-only or key-only as sole ID |
| Manual approval + allowlist | Fully open registration |
| mTLS + signed challenges primary | JWT as node edge auth |
| JWT only internal services | — |
| Fixed roles: executor, confirmer/validator, observer | Ad-hoc role explosion in v1 |
| Suspend = reputation down + quorum exclude + grace | Slash / confiscate stake |
| Heartbeats required; default min uptime 95% | No health model |
| Geo/jurisdiction configurable | Ignore compliance hooks |
| Node payment in ARO post-factum (via commission) | Speculative yield |
| API: register, auth, heartbeat, task assignment | Unbounded public admin |
| Multi-node per institution under one cert | Force one node only |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| `pot` | assigned validators / quorum |
| `commission` | post-factum ARO payment to nodes |
| `nodechain` | append authorization identity |
| `orchestrator` | task assignment consumer |
