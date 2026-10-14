# Content pack — technologic-ast
Language: en
Page: technologic-ast
Audience: institutions, regulators, auditors, partners (Tier 1 — website)

## Block: hero
eyebrow: TECHNOlogic · AST
h1: Aros Studio Tokenomics
lead: Infrastructure that records an **already-confirmed** institutional valuation as a token of rights — and keeps that token in step with the real asset for its whole life. Value arises only through confirmed work. NodeChain remembers every move.
cta_primary_label: Institution sign-in
cta_primary_href: /login
cta_secondary_label: Look up a process
cta_secondary_href: /explore

## Block: section
id: mission
title: Mission
lead: AST does not create value and does not appraise assets. It records, accurately and verifiably, a valuation and rights that already exist — and makes them programmable.
- An institution brings an official valuation and a signed document package. AST checks the evidence, confirms the process through Proof of Transaction, and records the resulting token on NodeChain at the institution's own price. From then on, every significant event in the asset's life — a revaluation, a transfer of rights, a development milestone — passes through the same confirmed path.

## Block: cards
id: p1
tag: Principle
title: Value only through confirmed work
body: No positive Proof of Transaction verdict, no value. There is no pre-mine and no free issuance.

id: p2
tag: Principle
title: Nothing is valid off the record
body: Any significant action without a NodeChain record is invalid. NodeChain is the single source of truth.

id: p3
tag: Principle
title: Payment after the fact
body: Infrastructure is paid only after its work is confirmed. What is earned is retained.

id: p4
tag: Principle
title: Deterministic
body: The same inputs always produce the same result — on every node, every time — so any process can be replayed for audit.

## Block: section
id: tokenization
title: How primary tokenization works
* **1 · Document package** — the institution submits its official valuation with a qualified digital signature.
* **2 · Evidence check** — the portal edge verifies signature and document integrity. It admits; it never mints.
* **3 · Proof of Transaction** — validators confirm that the process meets all four criteria (P1–P4 below).
* **4 · Record** — NodeChain records the creation of the token of rights.
* **5 · Issue at the official price** — tokens are issued strictly at the valuation the institution provided.
callout: After tokenization the traditional registry is marked as tokenized, and every significant event must pass through AST so that the token keeps reflecting the confirmed state of the asset.

## Block: section
id: pot
title: Proof of Transaction — the only gate
lead: PoT validates the fact of execution. It is not mining and not staking: no hash power, no stake, no vote by holding.
* **P1** — the process was initiated in an allowed context: a valid institutional certificate on the allowlist.
* **P2** — the full sequence of execution stages was completed.
* **P3** — every significant state was recorded on NodeChain.
* **P4** — the process completed under the rules of its process type, with a deterministic result.
- All four must pass for a positive verdict. If any one fails, the verdict is negative, with a mandatory reason code — and nothing is issued, changed or paid.

## Block: section
id: lifecycle
title: A token that lives with the asset
* A confirmed **increase** in the asset's value leads to new issuance, distributed pro rata to current holders.
* A confirmed **decrease** leads to a burn, applied pro rata.
* A **transfer of rights** is valid only through a confirmed process recorded on NodeChain.
* The token is **permanent** for the life of the asset; it always reflects the current confirmed value.

## Block: section
id: aroscoin
title: ArosCoin (ARO)
- ArosCoin is AST's internal process and payment unit: it measures confirmed work and pays the infrastructure that performed it. It is **not offered for sale**, has **no market price**, is **not a stablecoin**, and is **not used as a settlement asset** between currencies. There is no staking, farming or yield for holding it.

## Block: section
id: eye
title: The All-Seeing Eye
- An independent monitoring and audit layer that observes the system, records violations and notifies. It has no veto and no rollback rights and cannot initiate any operation — it is a witness, so that its record can be trusted.

## Block: section
id: refuses
title: What AST refuses to do
* Appraise assets or invent market prices.
* Hold third-party funds — AST holds only its own reserve and commissions.
* Act as a bank, exchange or custodian of client funds.
* Offer staking, farming or passive yield for holding.
* Let anyone bypass Proof of Transaction or NodeChain for a significant operation.
- The full public boundary is on [System: can & cannot](/system). The binding text is the [AST Core Canon](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/blob/main/docs/AST-CORE-CANON.md).

## Block: doors
id: door-login
title: For allowlisted institutions
body: Document-first wizard, signature attestation, certificates with QR verification.
button_label: Institution sign-in
button_href: /login

id: door-docs
title: Read the documentation
body: Canon, layer specifications, token protocol and portal documentation.
button_label: AST documentation
button_href: /resources/ast-docs
