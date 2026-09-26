# Content pack — investment
Language: en
Page: investment
Audience: investors, strategic partners, development-finance institutions

## Block: hero
eyebrow: Participation
h1: Investment
lead: We are building neutral infrastructure for the point where regulated finance and digital assets meet — the seam where value still stalls, breaks or needs to be stitched by hand. **Investment is in the company. We do not sell tokens.**
cta_primary_label: Request the investor pack
cta_primary_href: /contact
cta_secondary_label: Read the technical deep dive
cta_secondary_href: /deep-dive

## Block: section
id: problem
title: The problem: value stalls at the border between systems
- Payments and assets increasingly live in closed systems — national payment rails, bank networks, tokenized-deposit platforms, public blockchains. Inside each one, value moves fast. Between them, it still moves through manual steps, correspondent chains and bespoke bilateral bridges.
* The Financial Stability Board reported in October 2025 that "it is unlikely that satisfactory improvements at the global level will be achieved in line with the 2027 Roadmap timetable" for cross-border payments. ([FSB, 9 Oct 2025](https://www.fsb.org/2025/10/fsb-calls-for-enhanced-policy-implementation-to-achieve-tangible-improvements-in-cross-border-payments/))
* CLS estimates that most of the same-day FX settlement market — at least USD 500 billion — settles bilaterally and without payment-versus-payment protection. ([CLS, March 2025](https://www.cls-group.com/insights/innovation/report-reimagining-same-day-fx-exploring-the-case-for-additional-settlement-cycles-shapingfx-series/))
* The first cross-border, cross-bank redemption of a tokenized US Treasury fund, in May 2026, needed four separate organisations to hand the transaction from one system to the next. ([PR Newswire, 6 May 2026](https://www.prnewswire.com/news-releases/ondo-kinexys-by-jp-morgan-mastercard-and-ripple-complete-first-cross-border-cross-bank-redemption-of-tokenized-us-treasuries-302764324.html))

## Block: section
id: solution
title: What we are building
lead: Two independent engines under one method: value is recognised only after work is confirmed, and every significant state is recorded.
* **Aros Studio Tokenomics (AST)** — the execution and record engine. It records already-confirmed institutional valuations as tokens of rights, confirms every process through Proof of Transaction, and keeps an append-only record on NodeChain.
* **Aros Financial Core (AFC)** — the process of executing one API contract between AST and licensed anchors, so that an authorised request can start in one system and complete in another without anyone taking custody.
- Instead of N×N bilateral integrations, each institution integrates once against one contract. Each keeps its own licence, systems and regulator.

## Block: cards
id: diff-1
tag: Why we are different
title: Neutral
body: Not tied to one consortium, currency, chain or central bank. Built to work at the external boundaries of other networks — not to replace them.

id: diff-2
tag: Why we are different
title: Non-custodial by design
body: Funds in transit stay with licensed anchors. AST holds only its own reserve. This keeps liability where the licence is.

id: diff-3
tag: Why we are different
title: Payment for confirmed work
body: Proof of Transaction pays infrastructure after work is confirmed — not for holding, staking or mining. No speculative surface to defend.

id: diff-4
tag: Why we are different
title: Audit-first
body: Deterministic execution and an append-only record make every process replayable — the property regulators and auditors ask for first.

## Block: section
id: model
title: Business model
* **Process commission** — a small commission on confirmed process volume, charged only when a process is confirmed. It is split between the infrastructure nodes that did the work and AST's own reserve.
* **Integration and API licensing** — institutional access to the API contract, integration support and sandbox environments.
* **Pilots and programmes** — scoped pilots and audit-first programmes for public-sector and development-finance clients.
- Revenue scales with confirmed volume, not with token prices. There is no treasury of tokens to sell and no pre-mine.

## Block: section
id: status
title: Where we are today
* **AST Core** — canon ratified (July 2026); core engine released as versions 1.0 to 1.2. Version 1.2 (July 2026) is a pilot-ready baseline with Proof of Transaction, the NodeChain journal, the orchestrator and institution authentication. External audit and multi-node production deployment are still ahead.
* **Institutional portal** — live: public process explorer, NodeChain journal, and an institution cabinet with a document-first wizard, signature attestation and QR-verifiable certificates. English, Russian and Georgian interfaces.
* **AFC** — API Contract specification v3.0.0 drafted (July 2026) and under review.
* **Intellectual property** — US provisional patent application filed in August 2025 (Modular Architecture for Hybrid Transactional Systems).
* **Next** — hosted deployment of AST and an end-to-end pilot with sign-off, followed by a first regulatory sandbox engagement.

## Block: section
id: risks
title: Risks we take seriously
- Serious investors ask about risk first, so we state it plainly.
* **Regulatory** — requirements differ by jurisdiction and are still evolving for digital assets. We design for the strictest reading and confirm each deployment with local counsel.
* **Adoption** — institutions move carefully. Our entry point is the lowest-risk use case: audit-first records before money movement.
* **Competition** — incumbent networks and central-bank projects are building orchestration layers of their own. AFC is designed to operate at their external boundaries, where neutral coordination is still missing.
* **Execution** — we publish our canon, invariants and automated guards so that progress can be checked, not just claimed.

## Block: section
id: participate
title: How to participate
* **Strategic and financial investors** — equity participation in the company. Terms are shared under NDA with the data room.
* **Pilot partners** — banks, licensed digital-asset firms and public institutions joining a scoped pilot.
* **Development-finance and grant partners** — programme financing and technical assistance for public-sector deployments.
callout: No token sale. ArosCoin is an internal process and payment unit: it is not offered to investors, has no market price and is not an investment product.

## Block: doors
id: door-pack
title: Request the investor pack
body: Company overview, architecture summary, roadmap and data-room access under NDA.
button_label: Contact us
button_href: /contact

id: door-paper
title: Read the white paper
body: First principles, formal model and the boundaries built into the system.
button_label: White paper
button_href: /whitepaper
