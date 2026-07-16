# Principle: Avoid Policing

**Status:** Aligned with `CANON.md` v1.0 Final  
**Applies to:** architecture, documentation, process, language

---

## Intent

AST needs **clarity, deterministic rules, and NodeChain + PoT as validity** — not surveillance theater, punitive mechanics, or bureaucratic gates dressed as engineering.

“Avoid policing” means we do not design or document the system as if a force must patrol, punish, or extract compliance from participants.

---

## Architecture (canon-aligned)

| Do | Do not |
|----|--------|
| **All-Seeing Eye:** observe, record violations, notify (`CANON.md` §4.3) | Veto, rollback, patrol, prosecute, or “open cases” |
| Enforce correctness via **invariants, PoT, and NodeChain recording** | Enforcer components that initiate mint/burn/payment “for order” |
| Record causality (append-only NodeChain) so effects are valid only after the cause | Frame records as threat, discipline, or law-enforcement evidence |
| Fail closed when an invariant or missing NodeChain/PoT would break validity | Slash, fine, or deposit-as-discipline unless ratified in canon |
| Payment only post-factum for confirmed work | Staking, farming, passive income without execution |

If a control is required, it is a **rule of the system** (no value without `verified = 1`, no validity without NodeChain, selective custody only) — not a person or agent playing cop.

---

## Documentation

| Do | Do not |
|----|--------|
| Purpose, model, contract, acceptance | Long compliance-police checklists |
| Failure modes as **faults, blocks, missing record** | “Punishment of the violator” framing |
| Vocabulary: observe, notify, invariant, record, cause → effect, post-factum payment | police, patrol, punish, Eye veto/rollback as power |
| Minimal pack (4 files) | Nested governance-of-docs and approval ladders |

---

## Process

| Do | Do not |
|----|--------|
| Product-owner review on substance and canon | Gate every small step with stop-points |
| Ship useful docs, then code when ready | Multi-phase “sign-off theater” before thinking is allowed |
| Fix what is wrong; keep what is clear | Add process layers to look controlled |

---

## Language guide (short)

**Prefer:** observe, notify, invariant, NodeChain record, PoT verdict, post-factum payment, selective custody  
**Avoid:** police, patrol, punish, Eye veto, Eye rollback, enforce compliance, disciplinary deposit

---

## Relation to CANON

Consistent with:

- All-Seeing Eye without veto/rollback (`CANON.md` §4.3, §X)
- Hard prohibitions (`CANON.md` §X)
- Invariants I1–I9 (`CANON.md` §XI)

When in doubt: **if a design only makes sense if someone is “watching and punishing,” redesign it as a structural rule (PoT / NodeChain / fail closed) or drop it.**
