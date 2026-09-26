# Content pack — deep-dive
Language: en
Page: deep-dive
Audience: engineers, integration architects, technical due-diligence teams

## Block: hero
eyebrow: Technical deep dive
h1: Architecture at a glance
lead: How the AST core is built: a NestJS core with an append-only journal as the source of truth, Proof of Transaction as the only economic gate, and a Next.js portal that admits institutions but never mints.
cta_primary_label: Layer specifications
cta_primary_href: https://github.com/Aros-Technology-Studio/Aros-Studio-Tokenomics/tree/main/docs/layers
cta_secondary_label: White paper
cta_secondary_href: /whitepaper

## Block: section
id: stack
title: Stack
* **Core** — TypeScript / NestJS services; the append-only journal (RocksDB) is the source of truth.
* **Portal** — Next.js user interface with a separate edge service (BFF) and OpenAPI contract; admission only, never issuance.
* **Money arithmetic** — decimal library, never floating point; all clocks in UTC.
* **Optional infrastructure** — Postgres index mirror, Redis session assist, event export and JSON logs may be added, but none of them can become a source of truth.
* **On-chain representation** — optional adapters may attest the journal tip for explorers; ERC standards are representation adapters, never the source of truth.

## Block: cards
id: m-pot
tag: Module
title: proof_of_transaction_engine
body: Validates the fact of execution against criteria P1–P4 and returns a verdict with reason codes.

id: m-nc
tag: Module
title: nodechain_engine
body: Assembles execution snapshots, validates and appends them to the journal with cryptographic chaining.

id: m-tok
tag: Module
title: tokenomics_service
body: Issuance, burn and accounting of ArosCoin and tokens of rights — only after a positive verdict.

id: m-set
tag: Module
title: settlement_controller
body: Commission pool and payment to nodes after confirmation.

id: m-rel
tag: Module
title: release_daemon · velocity_tracker
body: Track the reserve index and velocity; Release Phase activates only when both thresholds hold.

id: m-rep
tag: Module
title: node_reputation_service · resource_monitor
body: Node reputation and weight; resource intensity and energy cost of operations.

## Block: section
id: lifecycle
title: Process lifecycle
* **Intake** — an allowlisted institution submits a document package through the portal edge; signature and package hash are verified.
* **Orchestration** — the orchestrator assigns a process ID and drives the stages with per-step and whole-process timeouts.
* **Verdict** — quorum validators evaluate P1–P4; one institutional certificate counts as one vote, however many nodes it runs.
* **Record** — every significant state is appended to NodeChain before its effect is acknowledged.
* **Economics** — issuance or burn, commission and node payment happen only after verified = 1.
* **Public view** — anyone can read the redacted status of a process ID on the explorer.

## Block: section
id: defaults
title: Operational defaults (v1)
* PoT confirmation timeout — 15 minutes; orchestrator step timeout — 5 minutes; process timeout — 30 minutes.
* A positive verdict is final: it is not compensated or reversed. If issuance succeeded and settlement failed, settlement is retried — the issuance is not burned back.
* Oracle failure fails closed: the process expires rather than proceeding on missing data.
* A kill switch places the engine in read-only mode.
* Environments — local, test, sandbox and production.

## Block: section
id: security
title: Security
* Institution authentication at the edge by shared secret (pilot), mutual TLS map, or OIDC bearer tokens.
* Detached X.509 verification of document-package hashes against configured trust anchors.
* Idempotency keys generated with a cryptographically secure random source.
* Human confirmation remains mandatory for any document-assist step; AST never appraises.
callout: Release 1.2.0 is a pilot-ready baseline. It is not a regulated production certification, has not completed an external audit, and is not a multi-node mainnet — those steps are ahead.
