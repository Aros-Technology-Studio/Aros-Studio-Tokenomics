# Representation Adapters

**Code:** `src/adapters` (e.g. ERC-20 representation adapter)  
**Canon:** §VI.2 Representation Adapters  
**Rule:** Adapters are **not** the source of truth.

---

## Purpose

Adapters project AST token state into external standard shapes so institutions and integrations can interoperate with familiar interfaces **without** moving SoT off NodeChain + PoT.

---

## Supported targets (v1 intent)

| Standard | Role |
|----------|------|
| ERC-20 | Fungible representation surface |
| ERC-3643 | Permissioned / compliance-oriented representation |
| ERC-1400 | Security token representation family |
| Future standards | Same adapter pattern |

Adapters are **plugins**. Core mint/burn logic remains in `src/aroscoin`.

---

## SoT boundary (non-negotiable)

| Truth | Mirror |
|-------|--------|
| NodeChain balances / supply events | On-chain ERC balances |
| PoT verified process | On-chain events without process proof |
| Emission plan + claim map | Contract `mint` logs alone |

If adapter state diverges from NodeChain:

1. **NodeChain wins.**  
2. Repair mirror toward canonical state.  
3. Never “fix” AST supply from chain-only events.  
4. Never accept free mint from a privileged EOA on the adapter.

---

## Double-mint guard across layers

When a process mints in TS core **and** a representation mint is issued:

- Both layers must share process/claim idempotency keys.  
- Second representation mint for the same economic event → reject.  
- Adapter failure after NodeChain success → operational repair of mirror; **do not** reverse canonical mint without a new confirmed process.

---

## Ordering with adapters

```
Canonical mint/burn + NodeChain success
  → client ack (AST)
  → adapter.sync / mirror mint (best-effort under double-mint rules)
```

Adapters must not become the wait condition that invents a second SoT. Economic finality is NodeChain.

---

## Cross-chain note

Cross-Chain Layer transports **representations**. Bridging does not authorize new emission. Bridged units still map to claims recorded under AST processes. Pre-Release external listing/trading remains blocked by release module.

---

## What adapters must not do

| Forbidden | Why |
|-----------|-----|
| Unbacked mint on-chain | Free mint / supply desync |
| Custody third-party funds as AST | Selective custody (I6) |
| Skip PoT because “tx is on Ethereum” | ERC is not PoT |
| Admin upgrade that rewrites supply without process | Canon violation |
| Eye-triggered burn on chain | Eye has no economic power |

---

## Implementation map

| Piece | Location |
|-------|----------|
| Core token service | `src/aroscoin` |
| ERC-20 adapter example | `src/adapters/erc20-representation.adapter.ts` |
| Tests | `*.spec.ts` next to adapters |

---

## Documentation duty

Any new adapter PR must state explicitly: **“Representation only; NodeChain + PoT remain SoT.”** Packs and module docs take precedence over marketing language that implies “deployed as ERC.”
