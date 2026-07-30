# F2 — External audit prep package

**Status:** Package for auditor hand-off  
**Purpose:** What to give an external reviewer; what is in scope.

---

## In scope (AST product)

| Area | Evidence paths |
|------|----------------|
| Law | `docs/AST-CORE-CANON.md` · `docs/P0-P4-TECHNICAL-DECISIONS.md` |
| Layers | `docs/layers/01_NodeChain` … `10_AssetTokenization` |
| Economic path | PoT → mint only via Core orchestrator · portal edge no mint |
| Invariants | I1–I9 · `src/invariants` · guards CI |
| Journal SoT | `src/nodechain` · file/rocksdb · verify chain |
| Portal edge | `portal/` · document-first · X.509 detached · auth modes |
| Tests | `npm test` · `npm run test:portal` · `npm run smoke:operator` · guards |
| Release gate | `npm run check:release` |

---

## Explicit out of scope for “code audit of SoT”

- Marketing showcase copy quality  
- Managed cloud account configuration  
- National QTSP certification of eIDAS profiles  
- Third-party bank integrations not in repo  

---

## Suggested auditor checklist

1. Canon § hard prohibitions still match guards (forbidden foreign product names firewall, no free mint).  
2. Mint paths all require PoT `verified=1` / ok-to-emit.  
3. Portal cannot mint (search edge for mint — none).  
4. Journal immutability / hash chain verify.  
5. Kill-switch and fail-closed gates.  
6. Secrets not in git (`data/`, keys gitignored).  
7. Production demo accounts off by default.

---

## How to run evidence locally

```bash
npm run check:canon
npm test
npm run test:portal
npm run smoke:operator
npm run check:release
```

---

## Residual (owner)

- Contract with auditor firm  
- Scope letter / NDA  
- Production environment access (if black-box also)  
