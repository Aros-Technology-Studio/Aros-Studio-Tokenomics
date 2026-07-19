# Changelog

## 1.0.0 — 2026-07-19

First public release of Aros Studio Tokenomics (AST).

### Core
- NodeChain journal (memory / file / RocksDB) with Ed25519
- PoT P1–P4, M-of-N, attestations, challenges
- Encoding, Processing FSM, Token / Emission / Commission 70/30 / Reserve
- Orchestrator + Core API `/v1/core/*`
- Governance L1–L3 (policy + optional LLM adapters)
- All-Seeing Eye (observe/notify only)
- Release daemon, oracle gateway, partial-release
- Hardening: kill-switch, HSM KeyProvider, JournalReplicator, institution auth

### Institutional Portal (edge)
- Nest BFF: login/session, document package SHA-256, process list/create/status
- Next.js UI: login, dashboard, new primary tokenization, status
- Hand-off to Core Orchestrator — **no mint on edge**
- OpenAPI `portal/openapi/openapi.yaml`

### Ops
- Production Docker images (core, portal-edge, portal-ui)
- `docker compose` full stack
- GitHub Actions release → GHCR on `v*` tags
- Release runbook: `docs/RELEASE.md`

## Prior (pre-1.0)

### Environment
- NestJS/TS workspace, Docker + compose, Postgres index schema
- Solidity representation workspace (Foundry)
- Optional Rust companion crates
- Full AST guard workflows + `invariants.yml`
- Expanded `rules/AST_RULES.yaml` (I1–I9, 70/30, firewall)
