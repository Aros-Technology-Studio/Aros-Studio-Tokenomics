# AST — Aros Technology Studio

## Canon and technical specification

---

## 1. Definition

**AST (Aros Technology Studio)** is a self-sufficient decentralized crypto-economic platform that provides **asset tokenization for institutional participants**.

**The tokenization process is built on:**

- a NodeChain system with the Proof-of-Transaction (PoT) principle
- ArosCoin emission through that principle
- All-Seeing Eye oversight
- process orchestration via a hierarchy of AI agents

**Legal status:** AST is a separate legal entity, licensed as a VASP under NBG supervision. It has the right to:

- act as asset custodian
- hold and manage reserves
- emit tokens
- hold funds

---

## 2. Architecture

### 2.1 NodeChain

**Not a blockchain — a process graph.**

- Instead of blocks, nodes process transactions
- Nodes register via API (`/node/register`, `/node/auth`)
- Consensus is AST’s own PoT mechanism
- The ledger is AST’s own, not on a third-party chain
- **Own network, not Ethereum**

### 2.2 PoT (Proof-of-Transaction)

**Consensus by confirmation of work:**

- Nodes confirm that transactions have been executed
- ArosCoin is born for confirmation
- Emission formula: `T_E = α·TV + β·U + γ`
  - `TV` = transaction volume
  - `U` = utilization
  - `α, β, γ` = constants

### 2.3 ArosCoin

**Token of the AST economy:**

- **Emission:** born on PoT confirmation, 1:1 to reserve
- **Burn:** burned when a claim is closed (return path)
- **Binding:** every ArosCoin is bound to a specific reserve of a specific transaction
- **Rate:** lives in the contract — fixed at emission time
- **Not a freestanding backed asset — an addressed receipt:** ArosCoin does not live outside a transaction; it exists only as a claim on a specific reserve

**Contract:** `ArosCoinReserveManager.sol` (Solidity)

- Mints ArosCoin against reserve
- Burns on reverse conversion
- Maintains unique identifiers against double emission
- Holds rate logic

### 2.4 All-Seeing Eye

**System validator:**

- Veto right, but no initiation
- Checks transactions against invariants
- Sees the whole system, but does not control it directly
- Final control instance

### 2.5 AI agent hierarchy

**Process management:**

- Multiple AIs do not coordinate well peer-to-peer → a **hierarchical system** is used
- Anomaly detector
- Meta-learning
- Decision orchestrator
- Python layer: `12_nodechain_ai_agents/`

---

## 3. Canonical components

AST code is organized by **canonical entities**, not by the old 14 modules.

### `src/` structure (live code):

```
src/
├── all-seeing-eye       # Validator, veto right
├── aroscoin             # Token logic
├── commission           # Commission model
├── emission             # Emission by PoT formula
├── nodechain            # Node graph
├── nodes                # Node management
├── orchestrator         # Process orchestration
├── pot                  # Proof-of-Transaction
├── release              # Release logic
├── reserve              # Reserves under ArosCoin
├── state-recording      # State recording
├── invariants           # System invariants
└── common               # Shared utilities
```

**Each subsystem:** TypeScript/NestJS, with tests (`.spec.ts`).

---

## 4. Technology stack

### 4.1 Languages

- **TypeScript/NestJS** — core (NodeChain, PoT, emission, orchestrator)
- **Solidity** — `ArosCoinReserveManager.sol` (reserve, mint/burn)
- **Python** — AI agents (`12_nodechain_ai_agents/`)

**Why not all Solidity?**  
AST is its own network, not on Ethereum. Solidity is needed only for the reserve contract (Bridge Layer); the rest is server-side TypeScript.

### 4.2 Infrastructure

- **Docker** — containerization
- **Kubernetes** — production orchestration
- **CI/CD:** GitHub Actions
  - `ci.yml` — main pipeline
  - `auto-fix.yml` — automated fixes
  - `ai-review.yml` — AI code review
  - `nightly-audit.yml` — nightly audits
  - `agent-dispatcher.yml` — agent dispatch

### 4.3 Frontend

- **React** — control panel (`frontend/`)
  - Governance
  - Ledger feed
  - Node list

---

## 5. Reference implementation

**`reference/ast-core/`** — 19 files of “clean sample”:

- Reference versions of `allSeeingEye`, `aroscoin`, `commission`
- Cross-check code for the main implementation in `src/`

---

## 6. ArosCoin mechanics (detail)

### 6.1 Birth (Mint)

1. External signal for 1:1 emission
2. Reserve is placed with an Anchor (external party)
3. AST emits ArosCoin via `ArosCoinReserveManager.sol`
4. **Rate is fixed in the contract** at emission time
5. ArosCoin carries a signature and a binding to a specific reserve

### 6.2 Life

- ArosCoin is held by the recipient (Anchor / participant)
- Serves as a **claim on a specific reserve**
- May be split (partial return paths)
- **Not traded, not accumulated outside transactions**

### 6.3 Death (Burn)

1. Request for return path (full or partial)
2. Contract reads the fixed rate
3. ArosCoin is burned
4. Reserve is released

**Formula:** `born-as-claim → held-as-receipt → burned-on-settlement`

---

## 7. Rate mechanics

**The rate lives in the contract** — this is settled.

### Scenario:

- **In:** 100K units → emit 100K ArosCoin at rate K₁
- **Out:** request 10K units → rate K₂ (may have changed)
- **Contract** applies fixed K₁ or updated K₂ (depends on config: static vs oracle)
- **Risk:** borne by initiator or participant (configured in the contract)

**Three reverse-path variants were discarded** (by decision).

---

## 8. Separation of responsibility

### AST is responsible for:

- Emission and burn of ArosCoin
- Consensus (PoT)
- Validation (All-Seeing Eye)
- Ledger maintenance
- Holding reserves (custodian right)
- Rate logic (in the contract)

---

## 9. Licensing and regulation

**AST is subject to licensing** — VASP / NBG.

**Strategy:** since licensing is required anyway — take **all rights** of a licensed entity:

- Custodianship
- Reserves
- Emission
- Full token economy

**Do not evade — use.**

---

## 10. Organizational firewall

**AST is separated from external processes:**

- GitHub: separate organization `Aros-Technology-Studio`
- Legal entity: separate structure
- AST custodianship **does not transfer** to external processes

**The firewall runs to the infrastructure level** — visible even in URLs.

---

## 11. AST repository

### Target structure (`Aros-Studio-Tokenomics`):

```
Aros-Studio-Tokenomics/
├── /docs/                      # Architecture, specifications, whitepaper, diagrams
├── /nodechain/                 # Core immutable ledger, sharding, encryption, BFT, chaining
├── /pot-engine/                # Proof of Transaction implementation (core logic, validators)
├── /aroscoin/                  # Token logic, emission rules, utilities, smart contracts
├── /governance/                # AI Governance Layer + The All-Seeing Eye
├── /portal/                    # Institutional portal (frontend + backend)
├── /smart-contracts/           # Core contracts (CosmWasm / Rust / Solidity)
├── /tests/                     # Unit, integration, e2e tests
├── /scripts/                   # CI/CD, deployment, migration, utilities
├── README.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── LICENSE
├── .gitignore
├── CONTRIBUTING.md
└── CODE_OF_CONDUCT.md
```

### Principles of the target structure:

- **Canonical components** — each folder maps to a key AST entity
- **Layer separation** — nodechain, PoT, token, governance, contracts
- **Standard documentation** — README, ARCHITECTURE, ROADMAP at root
- **Clean hierarchy** — without architectural debt of the old repository

---

## 12. Key invariants

1. **ArosCoin born = ArosCoin burned** (eventual equality)
2. **Every ArosCoin is bound to one reserve**
3. **All-Seeing Eye has veto, not initiation**
4. **Rate is fixed in the contract**
5. **AST is the custodian; external processes are not**
6. **NodeChain is a network of nodes, not blocks**
7. **PoT is for confirmation of work, not for ownership**

---

## 13. Problems settled in the canon

### Adopted:

- Code by canonical entities (`src/`)
- Rate in the contract
- AST as a licensed token economy
- Own network (NodeChain)

---

## 14. Open questions (closed)

All three questions are **closed** by the product owner:

1. **What is “1 token”?** → The rate lives in the contract
2. **Who bears FX / rate risk?** → Configurable; the contract governs it
3. **Return path full or partial?** → Partial (ArosCoin can be split)

---

## 15. Roadmap (high level)

### Phase 1: Order

- Map of `src/` ↔ specifications
- Archive obsolete modules 01–14
- Sync documentation with code

### Phase 2: Component development

Parallel work on:

- `nodechain` — node graph
- `pot` — consensus
- `emission` — emission formula
- `aroscoin` — token logic
- `reserve` — reserves
- `all-seeing-eye` — validator
- `orchestrator` — orchestration
- AI agents (Python)

### Phase 3: Integration

- API contracts between components
- Rollback mechanisms
- E2E tests

### Phase 4: Deploy

- Test network
- Sandbox (NBG)
- Production

---

## 16. Sources of truth

1. **This document** — AST canon
2. `docs/AST_Developer_Deep_Dive.md` — technical truth
3. `src/` — code as truth (not specs)
4. Dialogue with Ketevan — architectural decisions

---

## End of canon

**Version:** 1.0 (no AFC)  
**Date:** 12 July 2026  
**Status:** Ratified  
**Language:** English (repository language)
