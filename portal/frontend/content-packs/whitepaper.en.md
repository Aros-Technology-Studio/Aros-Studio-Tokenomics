# Content pack — whitepaper
Language: en
Page: whitepaper
Audience: protocol architects, auditors, academic reviewers (Tier 3 summary)

## Block: hero
eyebrow: Formal model
h1: White paper
lead: The formal foundation of AST and AFC: the first principles everything else is derived from, the formulas, and the boundaries the system will not cross. This page is the public abstract; the full paper is available on request.
cta_primary_label: Request the full paper
cta_primary_href: mailto:info@arosstudio.com?subject=White%20paper
cta_secondary_label: Read the AST Core Canon
cta_secondary_href: https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/blob/main/docs/AST-CORE-CANON.md

## Block: section
id: abstract
title: Abstract
- Financial value increasingly moves across systems that were never designed to meet: regulated fiat infrastructure and cryptographic networks. Bridges between them tend to concentrate custody, obscure the process, or merge liabilities that regulation keeps apart.
- We describe two independent constructions. **AST** is a process token-economy in which value arises only as the consequence of a confirmed process — a positive Proof of Transaction verdict — and every significant state is appended to a causal record, NodeChain, before its effect is acknowledged. **AFC** is not a system but a process: the execution of a machine-readable contract between AST and licensed anchors, in which each party keeps its own licence, systems and liability, and sees only the data its role requires.
- The result is interoperability without merging, coordination without custody, and transparency without exposure — properties that follow from the axioms rather than from policy.

## Block: section
id: axioms
title: First principles
* Value arises only through a confirmed process (Proof of Transaction).
* Payment for executed work is made only after the work is confirmed.
* Any significant action without a NodeChain record is invalid.
* Execution is deterministic: the same inputs give the same result.
* Issuance is possible only as part of a confirmed process; pre-mine and free issuance are forbidden.
* What is earned is retained; speculative holding, farming and staking are forbidden.
* Responsibility follows control: whoever holds a licensed function carries its liability; the protocol holds none.

## Block: section
id: formulas
title: Core formulas
lead: Published in the AST Core Canon. Parameter values are governed configuration, not constants of nature.
* **Confirmed volume** — PoT_volume = Σ (tx.amount × tx.verified), where tx.verified = 1 only under a positive verdict.
* **Reserve index** — reserveIndex = log10(1 + totalProcessVolume): a slow, monotone measure of capitalisation earned through confirmed work.
* **Process commission** — fee = tx.amount × feeRate.
* **Node payment (after the fact)** — paymentToNode = (node_weight_in_tx × tx.fee) / Σ node_weights.
* **Circulation velocity** — velocity = processVolume_24h / circulatingSupply.
* **Supply change on revaluation** — new_supply = current_supply × (1 ± ΔValue / previous_value), distributed pro rata to current holders.
* **Node reputation** — nodeReputation = (successful participations / total participations) × uptimeFactor.
callout: The internal value estimate derived from the reserve index is informational only. It is not a market price and is never used for issuance — issuance follows the institution's official valuation.

## Block: section
id: boundaries
title: Boundaries
* No self-appraisal of assets; valuation always comes from the institution.
* No holding of third-party funds; AST holds only its own reserve and commissions.
* No bypass of Proof of Transaction or NodeChain for any significant operation.
* No executive power for the observer: the All-Seeing Eye watches, records and notifies — it has no veto or rollback rights.
* No speculative surface: no staking, farming, governance by holding, or pre-mine.
* No merged liability: licensed functions stay with licensed institutions; compliance happens before entry.

## Block: section
id: contents
title: Contents of the full paper
* I · The institutional nature of the process
* II · Axioms and first principles
* III · Architectural entities
* IV · Process lifecycle
* V · ArosCoin: a process and payment unit
* VI · Issuance and burn mechanics
* VII · Execution economics
* VIII · NodeChain and Proof of Transaction
* IX · Tokenization and the contract layer
* X · Release Phase
* XI · Legal boundaries and architectural prohibitions
* XII · Stability metrics
* XIII · Architectural evolution
