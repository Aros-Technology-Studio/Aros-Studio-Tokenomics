title: Payment for confirmed work: what Proof of Transaction is — and is not
date: 2026-09-26
summary: Proof of Work pays for computation. Proof of Stake pays for holding. Proof of Transaction pays only for work that has been confirmed — and that changes everything about the token.
author: Aros Studio
order: 2
tags: AST, Proof of Transaction
---
Every distributed system has to answer a simple question: **why does anyone do the work?** The answer shapes everything built on top.

In proof-of-work networks, participants are paid for computation. In proof-of-stake networks, they are paid in proportion to what they hold. Both designs create a token whose value depends on a market — and a system that has to defend that market price.

AST answers the question differently.

## The rule

In Aros Studio Tokenomics, **value arises only as the consequence of a confirmed process**. A process is confirmed by a Proof of Transaction verdict, and the verdict is positive only when all four criteria hold:

- **P1** — the process started in an allowed context: a valid institutional certificate on the allowlist;
- **P2** — the full sequence of execution stages was completed;
- **P3** — every significant state was recorded on NodeChain;
- **P4** — the process completed under the rules of its type, with a deterministic result.

If any criterion fails, the verdict is negative, a reason code is recorded, and nothing is issued, changed or paid.

## Paid after, never before

The infrastructure that performs the work is paid **after** the work is confirmed — never in advance, never for simply being present, and never for holding tokens. The payment is a share of a small commission on the confirmed process, weighted by each node's contribution.

This is the shift at the heart of AST: from payment for participation to **payment for executed work**. It sounds like a detail. It removes an entire class of problems.

## What disappears

Because value only follows confirmed work, a whole list of familiar mechanisms simply has no object in AST:

- no pre-mine and no free issuance;
- no staking, farming or yield for holding;
- no governance by token weight;
- no market price to defend.

ArosCoin, the unit AST uses internally, measures confirmed work and pays for it. It is not offered for sale, it is not a stablecoin, and it is not used as a settlement asset between currencies.

## Why institutions care

For a regulator or an auditor, the consequence is practical. Every movement can be traced back to a recorded cause. Every result can be reproduced from the same inputs. And no one in the system — not the operator, not a node, not the monitoring layer — can create value by decree.

> A token that can only come from confirmed work is a token that can be audited.

That is why we built the system this way, and why we publish the canon that enforces it.
