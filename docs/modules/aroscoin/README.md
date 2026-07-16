# Module: ArosCoin / AST Token Accounting

**Code:** `src/aroscoin`  
**Adapters:** `src/adapters` (representation only)  
**Canon:** §VI AST Token Protocol; §III.5; I2, I7, I8  
**Decisions:** P0 aroscoin  
**Pack:** `docs/components/aroscoin/`

---

## Purpose

ArosCoin (ARO) and asset tokens are digital carriers of rights and process value **inside** AST. Canonical token state lives in **NodeChain + PoT**, not in any ERC contract.

This module executes mint, burn, and permissioned internal transfer **only** under confirmed processes. It never free-mints and never treats external chain balances as source of truth.

---

## Responsibility

| Owns | Does not own |
|------|----------------|
| ARO supply operations (mint/burn/transfer internal) | Institutional appraisal |
| Binding mint/burn to `processId` + `claimId` | PoT criteria evaluation |
| 9-decimal unit rules via common money | Fee schedule policy |
| Double-mint guards (TS + adapter) | Eye economic powers |
| Representation adapter hooks | ERC-as-SoT |

---

## Design summary

1. **AST Token Protocol** — Canonical Layer, Abstract Interface, Representation Adapters, Cross-Chain Layer.  
2. **9 decimals** — 1 ARO = 10⁹ arx; dust floor 1e-9 ARO.  
3. **Mint only** after PoT `verified = 1` + emission plan + NodeChain prerequisites.  
4. **Burn** on confirmed value decrease (and release/reassignment paths that require burn+remint).  
5. **processId + claimId** bind every supply change.  
6. **Adapters** (ERC-20 / 3643 / 1400) are **not** SoT.  
7. Client ack **only after** NodeChain append success.

---

## Documents in this folder

| File | Content |
|------|---------|
| [token-protocol.md](./token-protocol.md) | Four layers of AST Token Protocol |
| [mint-burn.md](./mint-burn.md) | Gates, ordering, double-mint, reassignment |
| [representation-adapters.md](./representation-adapters.md) | ERC adapters non-SoT rules |
| [api.md](./api.md) | Service surface and errors |

---

## Circulation regime

Until **Release Phase**, ARO circulation is limited to **internal roles** (process unit + payment unit). External free market transfer, CEX listing, and public trading are architecturally blocked (release module).

---

## Forbidden

- Admin / privileged mint forever  
- Free mint without PoT + emission  
- Treating Solidity balance as canonical  
- Third-party custody of client funds via this module is forbidden.- Eye-initiated mint/burn/pay  
