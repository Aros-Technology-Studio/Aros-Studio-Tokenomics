# I6 — Spring Boot vs NestJS (decision)

**Status:** **S1 recommended and adopted for engineering**  
**Date:** 2026-07-30  

## Decision

| Choice | Result |
|--------|--------|
| **S1 — Keep NestJS** (Core + portal edge) | **Selected** |
| S2 — Rewrite Core in Spring Boot | Rejected for v1 pilot / MVP finish |

## Why S1

1. Layers 01–10, orchestrator, PoT, journal, portal BFF already Nest + TypeScript.  
2. Rewrite cost does not buy SoT integrity (NodeChain is already the law).  
3. Ops focus should be Postgres mirror, domain, mTLS, monitoring — not framework churn.  
4. Agents.md / stack: TypeScript / NestJS core.

## When to revisit

- Hard enterprise mandate for JVM-only runtime with budgeted rewrite.  
- New greenfield service **outside** economic path (e.g. separate reporting) — still prefer Nest consistency unless owner requires JVM.

## Owner confirm (optional)

Reply **`I6 Nest confirmed`** or list amendment.  
Engineering treats Nest as default without waiting.

## Residual

Spring Boot samples or companion libraries are **out of scope** for Block I.
