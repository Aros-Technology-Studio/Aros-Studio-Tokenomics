# Content pack — resources
Language: en
Page: resources

## Block: hero
eyebrow: Docs & writing
h1: Resources
lead: Everything we publish about AST and AFC, at three depths: this website for decision-makers, developer documentation for integration teams, and the white paper for architects, auditors and reviewers. Each level links to the next, so every claim can be traced to its source.

## Block: cards
id: r-afc
tag: Documentation
title: AFC documentation
body: Architecture, API contract, process states, security model and governance of Aros Financial Core.
button_label: Open
button_href: /resources/afc-docs

id: r-ast
tag: Documentation
title: AST documentation
body: Core Canon, Proof of Transaction criteria, NodeChain, token protocol and the institutional portal.
button_label: Open
button_href: /resources/ast-docs

id: r-wp
tag: Formal model
title: White paper
body: First principles, formulas, boundaries and the reasoning that connects them.
button_label: Open
button_href: /whitepaper

id: r-dd
tag: Engineering
title: Technical deep dive
body: Modules, process lifecycle, security and operational defaults of the AST core.
button_label: Open
button_href: /deep-dive

id: r-blog
tag: Writing
title: Blog
body: Notes on settlement, Proof of Transaction and the boundaries we build in on purpose.
button_label: Open
button_href: /resources/blog

id: r-sys
tag: Boundaries
title: System: can and cannot
body: The public boundary of AST in one page — what it does and what it refuses to do.
button_label: Open
button_href: /system

## Block: section
id: glossary
title: Key terms
* **AFC (Aros Financial Core)** — the process of executing the Aros API Contract between AST and licensed anchors. Not a platform, custodian or legal entity; it exists only while a process runs.
* **AST (Aros Studio Tokenomics)** — the execution and record engine: a separate legal entity that holds only its own funds and records tokenized rights.
* **API contract** — the machine-readable agreement that defines the parties, their roles, messages, process states, rollback and audit events.
* **Licensed anchor** — a regulated institution that performs the licensed money or digital-asset movement in a process, under its own licence.
* **Initiating institution** — the bank, treasury or other institution that authorises a request and completes KYC, AML and sanctions checks before it enters. It is not a party to the contract.
* **Proof of Transaction (PoT)** — the only gate through which value arises or changes: a verdict that a process met all required criteria.
* **NodeChain** — the append-only record of every significant state; the single source of truth.
* **ArosCoin (ARO)** — AST's internal process and payment unit. Not for sale, no market price, not a settlement asset.
* **Token of rights** — the token that represents rights to a real asset at its official, confirmed valuation, and changes only through confirmed processes.
* **All-Seeing Eye** — the independent monitoring and audit layer: it observes, records and notifies; it has no veto and cannot act.
* **Rollback** — the return of a deviating process to its last consistent state, itself recorded on NodeChain.
* **Process ID** — the public reference for a process; anyone can look up its redacted status on the explorer.

## Block: section
id: faq-1
title: Is there a token I can buy?
- No. Aros Studio does not sell tokens. ArosCoin is an internal unit that measures confirmed work and pays infrastructure; it has no market price. Tokens of rights represent specific real assets and are issued only to institutions through a confirmed process.

## Block: section
id: faq-2
title: Can I use AST or AFC as an individual?
- Not directly. Both are built for institutions. Individuals benefit through the banks, treasuries and licensed firms that integrate them. Anyone can look up a process on the public explorer.

## Block: section
id: faq-3
title: Is the code open?
- The AST repository — canon, layer specifications, automated guards and the institutional portal — is public on [GitHub](https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics). Detailed AFC integration material is shared with institutional partners.
