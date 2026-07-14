# Principle: Avoid Policing

**Status:** Ratified working rule  
**Applies to:** architecture, documentation, process, language

---

## Intent

AST needs **clarity, invariants, and deterministic cause → effect** — not surveillance theater, punitive mechanics, or bureaucratic gates dressed as engineering.

“Avoid policing” means we do not design or document the system as if a force must patrol, punish, or extract compliance from participants.

---

## Architecture

| Do | Do not |
|----|--------|
| **All-Seeing Eye:** observe + veto; never initiate mint, burn, or payment | Patrol, prosecute, or “open cases” on participants |
| Enforce correctness via **invariants and deterministic rules** | Introduce enforcer components that start actions “for order” |
| Record causality (append-only ledger) so effects are auditable | Frame records as threat, discipline, or law-enforcement evidence |
| Fail closed or veto when an invariant would break | Slash, fine, or deposit-as-discipline unless already in canon |
| AI hierarchy: orchestrate, detect anomalies, decide process steps | Internal-security / “police department” roles |

If a control is required, it is a **rule of the system** (cannot mint without PoT, rate fixed at emission, one reserve per claim) — not a person or agent playing cop.

---

## Documentation

| Do | Do not |
|----|--------|
| Purpose, model, contract, acceptance | Long compliance-police checklists |
| Failure modes as **faults, rollbacks, veto paths** | “Punishment of the violator” framing |
| Vocabulary: observe, veto, invariant, record, cause → effect | monitor-as-threat, enforce, police, compel, audit-as-weapon |
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

**Prefer:** observe, veto, invariant, bound claim, confirmed work, deterministic, append-only  
**Avoid:** police, patrol, punish, enforce compliance, internal affairs, sanction, disciplinary deposit

---

## Relation to CANON

This principle is consistent with:

- All-Seeing Eye: veto, not initiation (CANON §2.4, §12)
- No speculative surface / no governance-by-holding patterns that turn holders into a force
- Canon as rules of reality for the system — not a police manual

When in doubt: **if a design only makes sense if someone is “watching and punishing,” redesign it as an invariant or drop it.**
