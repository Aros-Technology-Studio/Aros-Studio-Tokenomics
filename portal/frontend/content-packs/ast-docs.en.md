# Content pack — ast-docs
Language: en
Page: ast-docs
Audience: engineers, auditors, reviewers

## Block: hero
eyebrow: Resources · AST
h1: AST documentation
lead: The AST repository is public. The Core Canon is the single binding source; every layer specification, module and automated guard is checked against it.
cta_primary_label: Open the repository
cta_primary_href: https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics
cta_secondary_label: AST overview
cta_secondary_href: /technologic/ast

## Block: cards
id: d-canon
tag: Binding source
title: AST Core Canon
body: Mission, first principles, PoT criteria P1–P4, token protocol, Release Phase, formulas, hard prohibitions and invariants I1–I9.
button_label: Read the canon
button_href: https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/blob/main/docs/AST-CORE-CANON.md

id: d-decisions
tag: Decisions
title: Ratified technical decisions
body: The decisions taken before implementation, and why.
button_label: Read
button_href: https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/blob/main/docs/P0-P4-TECHNICAL-DECISIONS.md

id: d-layers
tag: Specifications
title: Layer specifications
body: Specifications per layer and module — written before code, visible in the tree.
button_label: Browse layers
button_href: https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/tree/main/docs/layers

id: d-release
tag: Release
title: Release 1.2.0
body: What the pilot-ready baseline includes — and, just as clearly, what it does not.
button_label: Release notes
button_href: https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/blob/main/docs/RELEASE-1.2.0.md

id: d-portal
tag: Portal
title: Institutional portal
body: Edge admission, signature verification, institution authentication and the public explorer.
button_label: Portal docs
button_href: https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/tree/main/docs/portal

id: d-security
tag: Security
title: Security policy
body: How to report a vulnerability responsibly.
button_label: SECURITY.md
button_href: https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/blob/main/SECURITY.md

## Block: section
id: guards
title: Canon enforced by code
- Every change to the repository runs automated guards that fail the build if the canon is broken — for example: no issuance path that bypasses Proof of Transaction or NodeChain, no executive powers for the All-Seeing Eye, no ERC standard treated as the source of truth, and no vocabulary that would turn payment for work into something else.
callout: The canon changes only through a formal amendment procedure, and every amendment is logged in the canon itself.

## Block: section
id: read-order
title: Suggested reading order
* **Decision-makers** — [AST overview](/technologic/ast), then [System: can and cannot](/system).
* **Auditors and reviewers** — the Core Canon, then the [white paper](/whitepaper).
* **Engineers** — the [technical deep dive](/deep-dive), then the layer specifications and ratified decisions.
