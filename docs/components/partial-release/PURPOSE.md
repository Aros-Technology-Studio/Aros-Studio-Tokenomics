# PURPOSE — `partial-release`

**Status:** ready  
**Canon refs:** `CANON.md` §VI–VII; aroscoin / reserve packs  
**Code path:** `src/partial-release/`  
**Clarifications:** P4.15 canonical v1

---

## Why this exists

Separate module (split from Release Phase) for **partial** release of an asset/token position via a **full orchestrator process** (new processId), atomic burn + reserve child records, claim split through burn+remint.

---

## Responsibility

- Owns: partial-release request path (holder via Portal + institutional approval), process kickoff, payload schema, coordination of burn/reserve child records, pre-phase internal-only enforcement, lighter governance than full phase change, pro-rata holder impact.
- Does **not** own: Release Phase activation (`release` / `release_daemon`).

---

## Build rules

| Must | Must not |
|------|----------|
| Folder name `partial-release` | Merge into phase module |
| Requester: holder (Portal) + institutional approval | Anonymous external partial |
| Same min dust as ArosCoin (1 arx) | Separate dust policy without reason |
| Every partial = full process + new processId | Side-door partial without orchestrator |
| Atomic saga: burn + reserve child records | Non-atomic leak |
| Before Release Phase: **internal only** | External partial pre-phase |
| Pro-rata impact on holders | Silent non-pro-rata |
| Lighter governance than phase change | Zero governance on large partials without config |
| NodeChain: ExecutionSnapshot + `partialRelease` payload | Off-chain only |
| Claim path via burn + remint | In-place reassignment |

---

## Related

| Component | Role |
|-----------|------|
| `orchestrator` | process entry |
| `aroscoin` | burn/remint/split |
| `reserve` | child records |
| `release` | phase gates (external) |
| `portal` | holder request UI |
