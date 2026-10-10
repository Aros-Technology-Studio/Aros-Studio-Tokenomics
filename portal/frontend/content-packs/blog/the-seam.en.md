title: The seam: why value still stalls between financial systems
date: 2026-09-26
summary: Inside each financial network, money moves fast. Between networks it still moves by hand. That border — the seam — is where AFC works.
author: Aros Studio
order: 1
tags: AFC, Settlement
---
Every year the financial system gets faster on the inside. Instant payment schemes, 24/7 clearing, tokenized deposits, public blockchains that settle in seconds. And yet a payment that has to cross from one of these systems into another still behaves much as it did twenty years ago.

That border is what we call **the seam**: the point where value leaves one closed system and enters another. It is where reconciliation happens by hand, where correspondent chains add days, and where a new bilateral bridge has to be built for every new pair of counterparties.

## The evidence

The problem is not hypothetical, and it is not getting solved on its own.

- In October 2025 the Financial Stability Board concluded that "it is unlikely that satisfactory improvements at the global level will be achieved in line with the 2027 Roadmap timetable" for cross-border payments. ([FSB](https://www.fsb.org/2025/10/fsb-calls-for-enhanced-policy-implementation-to-achieve-tangible-improvements-in-cross-border-payments/))
- CLS estimates that most of the same-day FX settlement market — at least USD 500 billion — settles bilaterally and without payment-versus-payment protection. ([CLS](https://www.cls-group.com/insights/innovation/report-reimagining-same-day-fx-exploring-the-case-for-additional-settlement-cycles-shapingfx-series/))
- In May 2026, the first cross-border, cross-bank redemption of a tokenized US Treasury fund took four organisations, each handing the transaction to the next: the asset leg on a public ledger, the fund's redemption processing, a payment-network instruction, and a bank's correspondent settlement. ([PR Newswire](https://www.prnewswire.com/news-releases/ondo-kinexys-by-jp-morgan-mastercard-and-ripple-complete-first-cross-border-cross-bank-redemption-of-tokenized-us-treasuries-302764324.html))

That last example is a genuine milestone. It also shows the pattern: even the most advanced participants still stitch the seam together one partnership at a time.

## Why bridges have not fixed it

Most attempts to connect fiat systems and digital-asset systems take one of three shortcuts. They **take custody** of the value in transit. They **hide the process** inside a proprietary platform. Or they **merge liabilities**, so that no one can say with confidence who was responsible for which step.

Each shortcut works technically and fails institutionally. A regulator cannot supervise what it cannot see. A bank cannot hand client funds to an unlicensed intermediary. A treasury cannot sign off a process whose responsibility map is blurred.

## A different approach: a contract, not a platform

Aros Financial Core starts from the opposite direction. AFC is not a platform that institutions join; it is the **process of executing one contract** between independent parties:

- the **initiating institution**, which completes KYC, AML and sanctions checks before anything enters;
- **licensed anchors**, which move money or digital assets under their own licences;
- **AST**, which executes the process and records every significant state on an append-only record.

Each party keeps its licence, its systems and its regulator. Each sees only the data its role requires. Funds in transit stay with licensed institutions — never with us. When the process ends, in exactly one terminal state, the AFC instance ends with it.

> AFC does not ask anyone to become someone else. Banks stay banks. Supervisors keep supervising. The contract connects them.

## Where this matters most

AFC is not meant to replace the large networks that already work well inside their own perimeter. Its value is at their external boundaries: where a tokenized fund meets a bank that is not in its consortium, where an FX trade falls outside a settlement window, or where a public programme needs a verifiable record of every movement from allocation to final use.

That is the seam. It is where we build.
