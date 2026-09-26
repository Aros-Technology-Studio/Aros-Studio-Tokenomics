# Content pack — afc-docs
Language: en
Page: afc-docs
Audience: integration engineers, enterprise architects, compliance and security teams (Tier 2 summary)

## Block: hero
eyebrow: Resources · AFC
h1: AFC documentation
lead: A map of the Aros Financial Core documentation for integration, architecture, compliance and security teams. The full API contract, schemas and integration guides are shared with institutional partners; this page summarises what they contain.
cta_primary_label: Request integration docs
cta_primary_href: mailto:info@arosstudio.com?subject=AFC%20integration%20documentation
cta_secondary_label: AFC overview
cta_secondary_href: /technologic/afc

## Block: section
id: status
title: Document status
callout: The Aros API Contract specification v3.0.0 (July 2026) is a draft under review. Numbers on this page are design targets, not measured production results. The published developer reference will follow ratification.

## Block: section
id: parties
title: 1 · Parties and roles
lead: The contract is concluded between independent parties. Each keeps full architectural and legal independence.
* **AST** — the execution and record engine: executes the process, records every state on NodeChain, and never touches a party's fiat operations directly.
* **Licensed anchor, fiat side** — a bank, payment institution, e-money issuer or other regulated financial intermediary that performs the fiat movement under its own licence.
* **Licensed anchor, digital-asset side** — a registered virtual-asset service provider, exchange or qualified digital-asset custodian that performs the digital-asset movement and on-chain routing under its own licence.
* **API gateway** — the only legally significant interface between parties: authenticates, enforces contract rules, validates message structure and signatures, and logs every operation. It makes no management decisions and holds no assets.
* **Initiating institution (not a party)** — completes KYC, AML and sanctions screening before entry, submits an authorised request, and receives the final status. It gains no rights or duties under the contract.
callout: Anchors perform only their licensed conversion and delivery role inside a process. They do not perform compliance on behalf of the initiator, keep accounts inside AFC, or take part in governance.

## Block: section
id: interface
title: 2 · API surface
- Every call is authenticated with an institutional certificate over mutual TLS. The core resources are:
* **POST /transaction** — submit an authorised request for contract execution.
* **GET /transaction/{id}** — query the current state of a process instance.
* **POST /validate** — pre-validate a request without executing it.
* **GET /health** — system health status.
- Duplicate transaction identifiers are rejected, so a request cannot be executed twice.

## Block: section
id: states
title: 3 · Process lifecycle
- A process instance is created when the gateway accepts a request and moves through a defined sequence of states. It always ends in exactly one terminal state:
* **SETTLED** — the process completed and the recipient received value.
* **ROLLED_BACK** — a deviation was detected and the process was returned to its last consistent state.
* **FAILED** — an unrecoverable error ended the process; the reason is recorded.
- AFC does not exist outside execution: when the instance reaches its terminal state, it closes.

## Block: section
id: exposure
title: 4 · Zero-exposure model
lead: Each participant sees only the data its contractual role requires.
* **Initiating institution** — authorisation context, submission confirmation, final status.
* **Fiat-side anchor** — the fiat-side instruction and settlement requirements; not AST internals or the digital-asset side.
* **Digital-asset-side anchor** — the delivery requirements on its side; not AST internals or the fiat side.
* **AST** — the execution trigger and process-bound values; not anchor internals or compliance data.
* **NodeChain** — execution states and audit events; private transaction content is fragmented and encrypted.
* **Governance and validation** — structural and risk signals; not full transaction content or participant data.

## Block: section
id: governance
title: 5 · Governance and validation
* **Three tiers of AI supervision** — continuous monitoring (1-minute sync), tactical operations and risk (hourly), strategic policy (daily). AI actions are logged, replayable and bounded.
* **Escalation path** — monitoring → tactical → strategic → constitutional validation → human control.
* **Constitutional validation layer** — checks architectural conformity, role assignment, route admissibility, state coherence and readiness to finalise for every process. It can approve a route, request a correction, pause a process or order a rollback. It cannot initiate transactions, change contract terms, reassign roles or read participants' internal data.
* **Correction protocol** — at most three correction iterations; unresolved conflicts go to manual control.
* **Amendments** — changing the contract requires consensus of the parties, a conformity check and a new version with backward compatibility or a migration plan.

## Block: section
id: recovery
title: 6 · Rollback and recovery
- A rollback is triggered by a breach of an architectural invariant, a monitoring anomaly, a validation rejection, a timeout, a node-consensus failure or an external-system error. It is executed only after escalation and validation, and it is recorded like any other state.

## Block: section
id: targets
title: 7 · Design targets (draft)
* Request latency — p50 under 2 s, p99 under 5 s.
* Execution completion — p50 under 30 s, p99 under 90 s.
* API availability — 99.95%.
* Rollback — under 10 s target, 60 s maximum.
* Fault tolerance — Byzantine fault tolerance with n ≥ 3f + 1 nodes.

## Block: section
id: security
title: 8 · Security model
* Zero-trust: every call is signed and verified; no component trusts another by default.
* Mutual TLS with certificate-based institution identity; no public write endpoints.
* Keys held in hardware security modules; role-based access control.
* Append-only, cryptographically chained audit record; clock synchronisation with signed timestamps for cross-checking.

## Block: section
id: related
title: Related reading
- [AFC overview](/technologic/afc) · [AST documentation](/resources/ast-docs) · [White paper](/whitepaper) · [Technical deep dive](/deep-dive)
