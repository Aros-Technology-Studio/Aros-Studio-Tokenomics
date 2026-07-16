# PURPOSE — `release`

**Status:** ready  
**Canon refs:** `CANON.md` §VII, §XI I8  
**Code path:** `src/release/` (+ `release_daemon` as related process)  
**Clarifications:** P2.12 canonical v1

---

## Why this exists

Manages **Release Phase** lifecycle (thresholds → activation / governance reverse) and coordinates **phase gates** on external circulation. **Partial asset release** is a **separate** module path (split), not folded into phase activation.

---

## Responsibility

- Owns: phase state machine; integration with `release_daemon` metrics (`reserveIndex`, `velocity`); config-only thresholds; block/allow external actions per phase; governance multi-step approval for large ops; atomic ops with burn/reserve when this module participates; NodeChain events with prevStateHash + verifier signatures.
- Contributes to: I8 pre-phase internal-only circulation.
- Does **not** own: computing reserveIndex (reserve/daemon inputs); free public trading engine; Eye veto.

---

## Boundary (must not)

- Must not allow institutions/holders to self-trigger phase (system + governance only).  
- Must not hard-code threshold numbers in v1 (config only).  
- Must not merge partial asset release into phase module (split).  
- Must not reverse phase without NodeChain + governance.  
- Must not skip atomicity with burn/reserve where applicable.

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| Phase trigger: system (daemon thresholds) + governance approval | Holder self-activate phase |
| Daemon monitors reserveIndex & velocity | Manual-only phase with no metrics |
| threshold/target **config-only** v1 | Magic numbers in code as sole source |
| Pre-phase block: external chain free transfer, CEX listing, public trading | Silent external leak |
| Post-phase allow: external transfer, bridge, listing (+ compliance) | Drop all compliance |
| Split partial asset release module | One mega-module for both |
| Full atomicity with burn/reserve | Partial externalize |
| Multi-step governance for large releases | Ungoverned large release |
| NodeChain event: prevStateHash + verifier signatures | Off-chain phase flip |
| Phase reverse via governance + NodeChain | Silent deactivate |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| `reserve` | reserveIndex input |
| `velocity_tracker` / daemon | velocity input |
| `aroscoin` | circulation regime |
| `nodechain` | phase records |
| `orchestrator` | may invoke release-related processes |
| partial-release module | **separate** (future pack/name) |
