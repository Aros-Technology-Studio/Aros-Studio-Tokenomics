# Validity rules

## Core law

> A significant action or event **without** a corresponding NodeChain record is **invalid** for AST.

NodeChain does not decide business success alone; it decides whether the **record of fact** exists.

## Rules enforced here

| ID | Rule |
|----|------|
| V1 | Accepted records are immutable |
| V2 | Hash chain unbroken from genesis to tip |
| V3 | Unknown or unauthorized writer → reject append |
| V4 | Schema-invalid payload → reject |
| V5 | Process-scoped types require `processId` |
| V6 | Idempotent client keys do not double-append |
| V7 | Read-only mode rejects appends |
| V8 | Index mirror is never authoritative over primary |

## Rules enforced by **other** layers using NodeChain

| Rule | Layer |
|------|--------|
| No emission without PoT verdict **and** journaled cause | PoT + emission |
| P3: significant states recorded | PoT reads NodeChain |
| Payment only after confirmed work facts exist | Settlement |

## What NodeChain does not validate

- Whether institutional valuation is correct  
- Whether P1–P4 pass  
- Whether 70/30 split is applied  

Those produce **payloads**; NodeChain stores them if writers are authorized.
