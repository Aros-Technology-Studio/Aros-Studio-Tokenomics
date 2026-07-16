---
name: invariant-canon-guardian
description: >
  Guard AST Core Canon and invariants I1–I9. Run protective gates, scan diffs
  and docs for canon violations (Eye veto, PoT/NodeChain bypass, free mint,
  third-party custody, ERC-as-SoT), refuse non-canon inventions, and report
  PASS/FAIL with fix list. Use when asked "canon check", "invariant guardian",
  "check canon", "guard invariants", "/invariant-canon-guardian", or before
  merging AST changes that touch tokenomics, PoT, NodeChain, Eye, or emission.
metadata:
  short-description: "AST Core Canon + I1–I9 guardian"
---

# /invariant-canon-guardian — AST Core Canon Guardian

Enforce **Aros Studio Tokenomics** law. You are a **guardian**, not a feature factory.

## Source of truth (strict order)

1. `docs/AST-CORE-CANON.md` — sole full Core Canon  
2. `docs/P0-P4-TECHNICAL-DECISIONS.md`  
3. `docs/BUILD_SCHEDULE.md`  
4. `docs/components/<name>/` packs  
5. Code last — must conform; never override canon  

Root `CANON.md` is a **pointer** only. Also read `.grok/rules.md` and `AGENTS.md`.

## When to run

- User invokes `/invariant-canon-guardian` or asks for a canon/invariant check  
- Before merge of changes touching: pot, nodechain, aroscoin, emission, reserve, commission, eye, orchestrator, portal economic paths  
- After migrating docs from another repo  
- When the agent is unsure whether a design is allowed  

## Steps

### 1. Automated gates

From repo root:

```bash
npm run check:canon
```

If the change set is under `migration/`:

```bash
npm run check:migration
```

Record exit status. **Any FAIL → overall FAIL** until fixed or explicitly waived by the product owner (waivers require written reason).

### 2. Diff scan (uncommitted + vs main)

```bash
git status -sb
git diff
git diff main...HEAD 2>/dev/null || git diff origin/main...HEAD 2>/dev/null || true
```

Search the diff and touched files for **hard violations** (live features, not ban-list documentation):

| Class | Reject if introduced as product behavior |
|-------|------------------------------------------|
| Eye executive | veto, rollback, Eye-initiated mint/burn/pay |
| Bypass | skip PoT, bypass NodeChain, admin/god mint |
| Free mint | mint without process/PoT, free emission as feature |
| Speculative surface | staking-for-yield, passive income without work |
| Custody | holding client/third-party funds |
| Token SoT | ERC-20/3643 as canonical protocol (adapters only OK) |
| Self-appraisal | AST calculates official asset price |
| Dual law | second “canon” that contradicts Core Canon |

Negations and ban lists in `docs/AST-CORE-CANON.md` / guards are OK.

### 3. Invariant checklist (I1–I9)

For each changed economic path, verify against Core Canon §XI:

| ID | Must hold |
|----|-----------|
| I1 | Value only when `verified = 1` (PoT) |
| I2 | Emission/burn bound to confirmed process |
| I3 | Significant events on NodeChain |
| I4 | Deterministic from recorded inputs |
| I5 | No speculative holding as product |
| I6 | AST holds only own funds |
| I7 | Token reflects confirmed asset value |
| I8 | Pre–Release Phase: no free external circulation |
| I9 | New emission pro-rata to holders when applicable |

Also PoT Criteria **P1–P4** (all required; fail any → `verified = 0`).

### 4. Write-ahead & fail-closed

Confirm:

- PoT success implies **NodeChain record before** treating mint/settle as allowed  
- Failures **fail closed** (no silent continue)  
- All-Seeing Eye does **not** stop writes by veto — executing module fails closed  

### 5. Report format (always)

```markdown
## Invariant Canon Guardian Report

**Overall:** PASS | FAIL
**Gates:** check:canon … | check:migration … (if run)

### Violations
- [file:line] description → canon section

### Invariants touched
- I1 … ok/risk
…

### Required fixes
1. …

### Questions for product owner
(only if canon is silent or dual reading)
```

### 6. Behavior after FAIL

1. List concrete fixes mapped to canon sections  
2. Do **not** invent replacement tokenomics  
3. If the only path forward needs a product decision → ask the owner in **Russian**  
4. Optionally apply safe fixes (remove illegal paths, restore fail-closed) when the user asked to guard **and** fix  

### 7. Behavior after PASS

State what was checked and that the change set is canon-compatible **as far as automated + diff review can tell**. Note residual risks (e.g. incomplete crypto KЭП).

## Hard prohibitions (never recommend)

- Eye veto / rollback  
- Admin mint forever  
- PoT or NodeChain bypass  
- AST as valuation oracle for assets  
- Speculative yield mechanics as core design  
- Shipping legacy docs that fail migration gate  

## Language

- Chat with product owner: **Russian**  
- Any repo files you write: **English**  

## Related commands

```bash
npm run check:canon
npm run check:migration
npm test
npm run cli -- tokenize --inst DEMO --valuation 100 --holder h1
```
