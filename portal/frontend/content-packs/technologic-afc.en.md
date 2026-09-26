# Content pack — technologic-afc
Language: en
Page: technologic-afc
Audience: C-level, regulators, public officials, partners (Tier 1 — website)

## Block: hero
eyebrow: TECHNOlogic · AFC
h1: Aros Financial Core
lead: A process coordination protocol between regulated fiat infrastructure and cryptographic execution. **Non-custodial. No merged liability. Auditable at every step.**
cta_primary_label: Request a briefing
cta_primary_href: /contact
cta_secondary_label: AFC documentation
cta_secondary_href: /resources/afc-docs

## Block: section
id: what
title: What AFC is
lead: AFC is not a platform, a bank or a payment system. It is the process of executing one contract — the Aros API Contract — between independent parties that each keep their own licence, systems and responsibilities.
- An institution that has already completed its own checks sends an authorised request. AFC coordinates the steps that follow between AST (the execution and record engine) and licensed anchors (regulated institutions that move money and digital assets under their own licences). When the process ends, the AFC instance ends with it.
- Nothing about your legal framework, your core banking system or your regulator changes. AFC connects systems that today cannot reach each other directly, quickly and safely — without asking either side to become the other.
callout: The contract is permanent. Each AFC process instance exists only while one transaction is being executed, and closes in exactly one terminal state: settled, rolled back, or failed.

## Block: section
id: why
title: Why it matters
- Money and value now live in two kinds of infrastructure — regulated fiat systems and cryptographic networks. Existing bridges between them usually solve the problem by taking custody, hiding the process, or blurring who is responsible.
* **Interoperability without merging** — fiat and digital-asset systems work together without losing their nature or their regulatory perimeter.
* **Coordination without custody** — AFC orchestrates the process but never holds participants' funds or balances.
* **Transparency without exposure** — every step is recorded and auditable, while each participant's internal systems stay private.

## Block: cards
id: pillar-1
tag: Pillar 1 · Process
title: Process layer
body: Orchestrates the transaction between institutions under the Aros API Contract. Holds no assets and keeps no balances.

id: pillar-2
tag: Pillar 2 · Execution
title: Execution engine (AST)
body: Deterministic execution and record engine built on Proof of Transaction. Same inputs, same result — every time.

id: pillar-3
tag: Pillar 3 · Anchors
title: Licensed anchors
body: Regulated entry and exit points: banks, payment or e-money institutions on the fiat side; licensed virtual-asset service providers on the digital-asset side.

id: pillar-4
tag: Pillar 4 · Governance
title: Governance and oversight
body: Tiered AI supervision with escalation to human control, plus an independent validation layer that checks every process against the contract's constitutional rules.

id: pillar-5
tag: Pillar 5 · Record
title: NodeChain
body: Append-only record of every significant state. An auditable chronology of each process — who, what, when and why.

## Block: section
id: how
title: How a process runs
* **1 · Initiation** — the institution completes KYC, AML, sanctions screening and internal authorisation, then submits the request to the API gateway.
* **2 · Admission** — the gateway checks identity, certificate, contract version and message structure. Unauthorised or malformed requests never enter.
* **3 · Validation** — AI supervision and the constitutional validation layer check the route, the roles and the process state before anything executes.
* **4 · Execution** — AST executes and records each step on NodeChain; the relevant licensed anchor performs the regulated money or asset movement under its own licence.
* **5 · Settlement** — the recipient receives value in the form it is meant to receive it; each party sees only what its role requires.
* **6 · Finalisation** — the process closes in one terminal state. If anything deviates, it is returned to its last consistent state and the reason is recorded.

## Block: section
id: trust
title: Trust and security
* **Non-custodial by design** — AFC never owns or holds participants' funds. Funds in transit sit with the licensed anchor, never with Aros Studio.
* **Role isolation** — every participant performs exactly one role in a process; no party can act as another.
* **Zero-exposure interoperability** — participants expose interface logic only; no one reads another party's internal systems.
* **Zero-trust transport** — mutual TLS between services, certificate-based institution identity, no public write endpoints.
* **Deterministic recovery** — a deviating process is rolled back to a safe checkpoint, and the rollback is itself recorded.

## Block: section
id: compliance
title: Compliance and accountability
lead: AFC does not replace the regulatory work of institutions. Each participant remains accountable within its own jurisdiction.
* **Initiating institutions** perform KYC, AML, sanctions screening and authorisation **before** a request enters AFC. Unverified flows cannot enter — that is the condition of activation.
* **Licensed anchors** carry the licensed functions (holding and moving money or digital assets) under their own licences and supervisors.
* **AST** executes and records the process; it holds only its own funds.
* **AFC** validates the structure and architectural conformity of each request and keeps the audit trail.
callout: Sanctions, currency-control and AML rules apply independently of any contract. AFC is built to respect them, not to route around them. Licensing requirements differ by jurisdiction and are confirmed with local counsel for every deployment.

## Block: section
id: developers
title: For developers and integration teams
- The API contract, message schemas, process states, security model and performance targets are described in the [AFC documentation](/resources/afc-docs). The formal model — axioms, boundaries and formulas — is in the [white paper](/whitepaper).

## Block: doors
id: door-brief
title: Bring AFC to your institution
body: Briefings for central banks, regulators, ministries, banks and licensed digital-asset firms.
button_label: Request a briefing
button_href: /contact

id: door-ast
title: See the execution engine
body: How AST turns confirmed work into a verifiable record.
button_label: Aros Studio Tokenomics
button_href: /technologic/ast
