# AST Architecture (scaffold)

**Status:** Scaffold — structure ratified; content filled as component packs land  
**Canon:** `/CANON.md`  
**Principle:** [principles/ANTI_POLICE.md](./principles/ANTI_POLICE.md)

---

## 1. What AST is

AST (Aros Technology Studio) is a self-sufficient crypto-economic platform for **institutional asset tokenization**, built on:

- **NodeChain** — process graph (not a public L1 block chain for the core ledger)
- **PoT (Proof-of-Transaction)** — confirmation of work; cause of emission
- **ArosCoin** — addressed claim on a specific reserve (mint / hold / burn)
- **All-Seeing Eye** — observe + veto; never initiates economic actions
- **Orchestration** — hierarchical process management (including AI agents where canon allows)

Legal posture (canon): separate entity, VASP under NBG supervision — rights used as licensed capability, not as a policing mandate.

---

## 2. Component map (runtime)

```
                    ┌─────────────────────┐
                    │   All-Seeing Eye    │  observe + veto only
                    └──────────▲──────────┘
                               │ may veto
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────┴────┐          ┌──────┴──────┐         ┌─────┴─────┐
   │  PoT    │─────────▶│  Emission   │────────▶│ ArosCoin  │
   └────▲────┘          └─────────────┘         └─────▲─────┘
        │                                             │ bound 1:1
   ┌────┴────┐          ┌─────────────┐         ┌─────┴─────┐
   │ Nodes / │          │ Commission  │         │  Reserve  │
   │NodeChain│          └─────────────┘         └───────────┘
   └────▲────┘
        │
   ┌────┴──────────┐     ┌────────────────┐
   │ Orchestrator  │────▶│ State recording│
   └───────────────┘     └────────────────┘

   invariants  ·  common  ·  release (return path)
```

Detail lives in each `components/<name>/` pack.

---

## 3. One economic cycle (canonical shape)

1. Work / process runs in the node graph.  
2. **PoT** confirms transaction execution.  
3. **Emission** applies the PoT formula; **ArosCoin** is minted as a claim.  
4. **Reserve** is bound 1:1 to that claim; rate fixed at emission (contract).  
5. Claim is held as receipt — not freestanding speculation.  
6. On settlement / return path: burn ArosCoin, release reserve (full or partial per canon).  
7. **All-Seeing Eye** may veto a step that breaks invariants; it does not start the cycle.

Formula reference: `T_E = α·TV + β·U + γ` (CANON §2.2).  
Lifecycle: `born-as-claim → held-as-receipt → burned-on-settlement` (CANON §6).

---

## 4. Layering

| Layer | Concern |
|-------|---------|
| Process / orchestration | Who runs what, in what order |
| Confirmation (PoT) | What is verified work |
| Token / reserve | Claims and backing |
| Oversight (Eye) | Veto on invariant breach |
| Ledger (NodeChain) | Append-only causality |

Solidity (`ArosCoinReserveManager.sol`) is for reserve mint/burn binding where required; core network logic is TypeScript/NestJS (CANON §4).

---

## 5. What this document is not

- Not a compliance manual  
- Not a policing or enforcement playbook  
- Not a substitute for `CANON.md`

As packs are written, this file should gain: sequence diagrams for mint/burn, interface table between components, and explicit invariant checklist references — still without expanding into process theater.
