# AST Token Protocol

**Code:** `src/aroscoin` + `src/adapters`  
**Canon:** §VI  

---

## Mission of the token

An AST token is a **digital carrier of rights** to a real asset (and, for ARO, process/payment unit roles). Its job is to reflect accurately the current state of rights and economic value of the asset in the network space.

AST defines its **own full protocol** — not “ERC-first.”

---

## Four layers

### 1. Canonical Layer

- Token state **always** lives in **NodeChain + PoT**.  
- Sole source of truth for balances, supply changes, and rights events.  
- Every critical operation recorded as execution records with process binding.

### 2. Abstract Interface Layer

- AST’s own abstract token interface (not bound to Ethereum).  
- Operations: mint, burn, transfer (permissioned), revaluation linkage, query.  
- Implemented in TypeScript core (`src/aroscoin`) as the first-class interface.

### 3. Representation Adapters

- Plugins for compatibility with **ERC-20**, **ERC-3643**, **ERC-1400**, and future standards.  
- Optional mirrors for external ecosystems.  
- **Never** authoritative if they diverge from NodeChain.  
- Double-mint guards apply on both TS and Solidity paths where mirrored.

### 4. Cross-Chain Layer

- Abstract transport for bridge protocols (current and future).  
- Bridges move **representations**; they do not create free supply outside PoT.  
- Pre-Release: external circulation remains blocked by release rules.

---

## Token properties (canon)

| Property | Meaning |
|----------|---------|
| Future-proof | Not dependent on a single ERC standard |
| Mobile / compatible | Adapters for ecosystems without changing SoT |
| Canon-preserving | Critical ops always NodeChain + PoT |
| Value linkage | Supply changes follow confirmed institutional ΔValue (§9.10 via emission) |

---

## Mechanism of value change (protocol level)

| Confirmed event | Token action |
|-----------------|--------------|
| Asset value **increase** | New emission (mint), pro-rata holders (I9) |
| Asset value **decrease** | Burn |
| Rights transfer | Process-bound transfer after PoT |
| Primary tokenization | Mint at fixed institutional price |

Every supply change is bound to a **specific confirmed process** (PoT) and recorded in NodeChain (I2).

---

## ARO unit model

| Symbol | Definition |
|--------|------------|
| ARO | Accounting unit ticker |
| Decimals | **9** |
| arx | 10⁻⁹ ARO (minimum dust unit) |
| Money lib | `decimal.js` via `src/common/money` |

Floor rounding to arx for emission outputs. Split by amount + dust rules on transfers (P0 aroscoin).

---

## Identifiers

| Id | Role |
|----|------|
| `processId` | Primary process binding for mint/burn |
| `claimId` | Claim / holder allocation binding |
| Institutional rate ref | From institutional input (oracle = transport only) |

---

## What the protocol forbids

- Pre-mine and free emission are forbidden.- Speculative holding / farming / staking as yield product  
- System self-appraisal as mint basis  
- ERC contract as SoT  
- Circulation expansion before Release Phase without release module  
