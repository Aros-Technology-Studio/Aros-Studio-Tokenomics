# Content pack — institutions
Language: en
Page: institutions
Audience: central banks, regulators, ministries and treasuries, banks, licensed digital-asset firms, asset-holding institutions

## Block: hero
eyebrow: For institutions
h1: Institutions
lead: AST and AFC are built for institutions, not for retail users. We do not replace your systems, your licence or your regulator. We connect what you already run to a process that is **verifiable, non-custodial and recorded at every step**.
cta_primary_label: Request a briefing
cta_primary_href: /contact
cta_secondary_label: What the system can and cannot do
cta_secondary_href: /system

## Block: cards
id: seg-cb
tag: Central banks · Regulators
title: Oversight without new plumbing
body: A read-only, append-only record of every significant state, with role isolation and no custody inside the protocol. Supervision stays with you; nothing requires a change in law.

id: seg-mof
tag: Ministries · Treasuries
title: Earmarked money you can trace
body: Grants, subsidies and procurement payments recorded step by step — from allocation to final use — with automated control of earmarked spending and a complete audit trail.

id: seg-banks
tag: Banks · Payment institutions
title: Reach without re-architecture
body: Keep your core banking and compliance. Send already-authorised requests through one API contract and reach counterparties that today need custom bilateral bridges.

id: seg-vasp
tag: Licensed digital-asset firms
title: A regulated route to fiat
body: Act as a licensed anchor on the digital-asset side, under your own licence, with clear boundaries: conversion only, no custody inside the protocol.

id: seg-assets
tag: Asset-holding institutions
title: A living registry of rights
body: Tokenize an asset at its official, already-confirmed valuation — real estate, infrastructure, bonds, natural resources — and keep the token in step with every later event.

id: seg-dfi
tag: Development finance · Donors
title: Audit-first programmes
body: Programme disbursements with a verifiable record of every movement, suitable for international grant and investment reporting.

## Block: section
id: unchanged
title: What stays exactly as it is
* **Your legal framework.** AFC works inside existing law; it does not require legislative change to operate.
* **Your compliance.** KYC, AML and sanctions screening stay with you and happen before any request enters the process.
* **Your systems.** No one reads your internal systems. You expose only the interface the contract requires.
* **Your licence and your supervisor.** Licensed functions stay with licensed institutions.
callout: What you gain is a shared, verifiable process between systems that cannot talk to each other directly today — without handing custody or control to anyone.

## Block: section
id: public
title: Public-sector use cases
lead: We start where risk is lowest and value is easiest to verify, and widen scope only after each stage is proven.
* **Audit-first control layer** — a national record of public-finance movements that observes and verifies, before it ever moves money. The safest entry point.
* **Treasury reconciliation** — inter-agency settlement records reconciled continuously instead of in manual cycles.
* **Grants and subsidies** — earmarked payments traceable to final use, with protection against double spending.
* **Public procurement** — contract phases linked to payment milestones, with escrow-style conditions and a recorded history.
* **Asset registries** — state property, infrastructure or resource rights recorded as tokens of rights at official valuations.
* **Cross-border corridors** — institution-to-institution settlement through licensed anchors in each jurisdiction, as a later-stage pilot.
* **Digital treasury sandbox** — a time-boxed regulatory pilot (for example, 90 days) with agreed success criteria before any production decision.

## Block: section
id: engagement
title: How an engagement works
* **1 · Briefing** — a technical and legal walkthrough with your team; we map where your systems meet the process.
* **2 · Scope** — one use case, one jurisdiction, clear success criteria and a written responsibility map for every party.
* **3 · Sandbox** — integration against the API contract in a sandbox environment, under the oversight of your supervisor where required.
* **4 · Controlled pilot** — limited volumes, full audit, weekly review, and a stop point if criteria are not met.
* **5 · Decision** — production only after a documented pilot review.

## Block: section
id: faq-scope
title: Is AFC a payment system or a custodian?
- No. AFC is the process of executing a contract between independent parties. It does not hold funds, keep balances or open accounts. Funds in transit stay with licensed anchors under their own licences.

## Block: section
id: faq-license
title: Which licences are involved?
- Licensed functions — holding and moving money or digital assets — are performed by licensed anchors (banks, payment or e-money institutions; licensed virtual-asset service providers). AST is a separate legal entity subject to the licensing that applies to it. The exact regime depends on the jurisdiction and is confirmed with local counsel for each deployment; we do not claim that no licence is needed anywhere.

## Block: section
id: faq-sanctions
title: How are sanctions and currency controls handled?
- The initiating institution screens every request before it enters. The contract does not override sanctions, currency-control or AML law — these apply independently, and the process is designed to comply with them, never to route around them.

## Block: section
id: faq-data
title: Where does our data live?
- Data and keys follow the jurisdiction in which they arise, under local data-protection law (for example GDPR, KVKK or CCPA). Each participant sees only the data its role requires; cross-border processing is a separate, explicit review point.

## Block: section
id: faq-failure
title: What happens if something fails mid-process?
- Every process instance ends in exactly one terminal state — settled, rolled back or failed. A deviation returns the process to its last consistent state, and both the deviation and the recovery are recorded.

## Block: doors
id: door-brief
title: Request an institutional briefing
body: Tell us your institution, jurisdiction and the problem you want to solve. We reply with a proposed agenda.
button_label: Contact us
button_href: /contact

id: door-login
title: Already allowlisted?
body: Sign in to the institution cabinet to submit document packages and track your processes.
button_label: Institution sign-in
button_href: /login
