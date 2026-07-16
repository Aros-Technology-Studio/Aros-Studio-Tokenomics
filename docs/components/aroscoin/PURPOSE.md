# PURPOSE — `aroscoin`

**Status:** ready  
**Canon refs:** `CANON.md` §VI (AST Token Protocol), §IX.10, §XI I2 I7 I9  
**Code path:** `src/aroscoin/` (tokenomics surface for ARO)  
**Clarifications:** P0.4 canonical v1

---

## Why this exists

Implements **ArosCoin (ARO)** under the **AST Token Protocol**: digital carrier of rights/value movement inside AST, always gated by NodeChain + PoT, never by admin mint.

---

## Responsibility

- Owns: ARO symbol/decimals, permissioned transfer inside AST (via PoT), mint/burn execution after emission signal, processId+claimId identity, double-mint guards (TS + Solidity), burn+remint for reassignment, optional claim expiry policy hooks, NodeChain event before client ack.
- Contributes to: pro-rata supply changes when emission engine dictates (I9); representation adapters for external ERCs (not native protocol).
- Does **not** own: PoT verification, institutional valuation math, admin mint, free market circulation before Release Phase (I8 enforced with release).

---

## Boundary (must not)

- Must not mint without emission-after-PoT.  
- Must not provide admin/god mint path (forbidden forever).  
- Must not reassign claims without burn+remint (new process).  
- Must not ack client before NodeChain mint/burn record.  
- Must not treat ERC-20/3643/1400 as canonical layer (adapters only).  
- Must not enable speculative external circulation before Release Phase.

---

## Build rules (must / must not)

| Must | Must not |
|------|----------|
| SYMBOL=ARO, DECIMALS=9 | Other decimals without canon amendment |
| Transfer inside AST only, permissioned, via PoT | Unpermissioned external transfer pre-Release |
| Split by amount + configurable min dust | Silent reassignment |
| Primary key processId + claimId | Double mint |
| Double-mint guard in **both** TS and Solidity | Admin mint |
| Reassign = burn + remint new process only | In-place owner swap without process |
| Optional claim expiry per asset policy | Required global expiry if not in policy |
| Rate from **manual institutional input** (oracle transport only) | AST self-appraisal |
| NodeChain record before client ack | Ack-then-write |
| Emission-after-PoT only entry for mint | Bypass pot/nodechain |

---

## Related components

| Component | Relationship |
|-----------|----------------|
| `pot` | verified process gate |
| `emission` | amount + valuation-driven supply delta |
| `reserve` | locks / bag accounting |
| `nodechain` | primary event log before ack |
| `invariants` | I2, I7, I8, I9 asserts |
| `release` | Release Phase circulation expansion |
| adapters | ERC representation only |
