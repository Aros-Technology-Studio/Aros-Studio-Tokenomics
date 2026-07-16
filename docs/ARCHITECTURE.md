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
- **All-Seeing Eye** — observe, record violations, notify; **no veto, no rollback** (`CANON.md` §4.3)
- **AST Token Protocol** — canonical state in NodeChain + PoT; ERC standards are adapters only
- **Release Phase** — broader circulation only after reserveIndex and velocity thresholds

Legal posture (canon): sovereign process token-economy; selective custody of **own** funds only; not a third-party custodian; not a valuation body.

---

## 2. Component map (runtime)

```
                    ┌─────────────────────┐
                    │   All-Seeing Eye    │  observe / notify (no veto)
                    └──────────▲──────────┘
                               │ observes
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
   ┌────┴────┐          ┌──────┴──────┐         ┌─────┴─────┐
   │  PoT    │─────────▶│  Emission   │────────▶│  Tokens   │
   └────▲────┘          └─────────────┘         └─────▲─────┘
        │                                    AST Token Protocol
   ┌────┴────┐          ┌─────────────┐         ┌─────┴─────┐
   │ Nodes / │          │ Settlement  │         │  Reserve  │
   │NodeChain│          │ (post-factum│         │ (own only)│
   │ (SoT)   │          │  payment)   │         └───────────┘
   └────▲────┘          └─────────────┘
        │
   ┌────┴──────────┐     ┌────────────────┐
   │ Orchestrator  │────▶│ State recording│
   └───────────────┘     └────────────────┘

   invariants  ·  common  ·  release_daemon (Release Phase)
```

Detail lives in each `components/<name>/` pack.

---

## 3. One economic cycle (canonical shape)

1. Institution provides confirmed valuation and signed package (RWA path) and/or process work runs on the node graph.  
2. **PoT** confirms the fact of execution / confirmed valuation (`verified = 1`).  
3. **NodeChain** records the event (sole validity).  
4. **Emission / burn** of protocol tokens only as part of that confirmed process (AST Token Protocol).  
5. **Settlement** pays nodes **post-factum**; AST holds only its own reserve share.  
6. Value changes (revaluation) mint/burn pro-rata after confirmed processes — not free market mint.  
7. **All-Seeing Eye** observes and notifies; it does not veto, roll back, or initiate.  
8. Broader circulation only after **Release Phase** (`reserveIndex` ∧ `velocity`).

See `CANON.md` §§III–XI for formulas, prohibitions, and invariants I1–I9.

---

## 4. Layering

| Layer | Concern |
|-------|---------|
| Process / orchestration | Who runs what, in what order |
| Confirmation (PoT) | What is verified work |
| Token / reserve | Claims and backing |
| Oversight (Eye) | Observe / audit / alert (no veto) |
| Ledger (NodeChain) | Sole source of truth; append-only |
| Token protocol | Canonical layer + abstract interface + ERC adapters |

Core logic is TypeScript/NestJS; representation adapters may use Solidity/ERC for external compatibility only (`CANON.md` §VI).

---

## 5. What this document is not

- Not a compliance manual  
- Not a policing or enforcement playbook  
- Not a substitute for `CANON.md`

As packs are written, this file should gain: sequence diagrams for mint/burn, interface table between components, and explicit invariant checklist references (I1–I9) — still without expanding into process theater.
