# NodeChain assembly — operational package

**Layer:** `01_NodeChain`  
**Code:** `src/nodechain/`  
**HTTP:** `/v1/core/nodechain/*`  
**CLI:** `npm run cli -- journal …`

This document is the **run book** for assembling and operating the SoT journal.  
Law remains Core Canon + layer docs under this tree.

---

## What “assembled” means

| Piece | Location | Role |
|-------|----------|------|
| Journal service | `NodechainService` | Append-only chain, Ed25519, genesis, verify |
| Stores | memory / file / rocksdb | Durable primary (engine via env) |
| Keys | `KeyRegistry` + key-persistence | Sign / verify contentHash |
| Nest boot | `NodechainBootstrap` | `ensureGenesis` on core start (idempotent) |
| HTTP read API | `CoreNodechainController` | tip, status, verify, get, list-by-process |
| CLI | `scripts/ast-cli.ts` | genesis, first-record, status, tip, verify, dump |
| Replication | `JournalReplicator` | Catch-up (not multi-writer consensus) |

**Not in this package:** portal mint, free-form public append, PoT/token math.

---

## Environment

| Variable | Default | Meaning |
|----------|---------|---------|
| `AST_JOURNAL_ENGINE` | `file` (Nest module) / `memory` (factory default) | `memory` \| `file` \| `rocksdb` |
| `AST_JOURNAL_DIR` | `data/journal` | Path for file/rocksdb + key files |
| `AST_VERIFY_EVERY_N` | `5` | Full chain verify every N appends (`0` = off) |
| `AST_SKIP_GENESIS_BOOT` | unset | If `1`/`true`, Nest does not call `ensureGenesis` on boot |
| `KILL_SWITCH` | unset | Engaged via runtime kill-switch (read-only) |
| `PORT` | `3000` | Nest core listen port |

---

## CLI

```bash
# Empty journal → genesis at height 0
npm run journal:genesis -- --dir data/journal --engine file

# Optional first operational record (system_boot)
npm run journal:first -- --dir data/journal --engine file

# Status (tip + chain + readOnly)
npm run journal:status -- --dir data/journal --engine file

npm run journal:verify -- --dir data/journal --engine file
npm run cli -- journal tip --dir data/journal
npm run cli -- journal dump --dir data/journal
```

Exit code `2` on failed verify / broken status chain.

---

## HTTP (core Nest)

Base: `http://localhost:3000` (or `$PORT`).

| Method | Path | Notes |
|--------|------|--------|
| GET | `/v1/core/nodechain/status` | tip, hasGenesis, chain, engine, killSwitch |
| GET | `/v1/core/nodechain/tip` | `{ tip }` |
| GET | `/v1/core/nodechain/verify` | `409` if chain broken |
| GET | `/v1/core/nodechain/blocks?limit=` | latest blocks tip-first (explorer feed) |
| GET | `/v1/core/nodechain/records/height/:height` | single record (= block) |
| GET | `/v1/core/nodechain/records/id/:recordId` | single record |
| GET | `/v1/core/nodechain/processes/:processId?limit=` | process history (capped) |
| POST | `/v1/core/nodechain/genesis` | idempotent ensureGenesis |

**Model (blockchain analogy):** height = block number · envelopeHash = block hash · prevHash = parent · append-only.

Also: `GET /health` includes `tip` and `chainOk` when journal is wired.

**Append** is not exposed as open HTTP. Writers are core services (orchestrator, PoT, token, …) via `NodechainService.append`.

---

## Boot sequence

1. Nest loads `NodechainModule` → `createNodechainAsync` (engine + keys + store).  
2. `NodechainBootstrap.onModuleInit` → `ensureGenesis('system')` unless skipped.  
3. Core API serves read/verify routes.  
4. Pipeline appends only through typed services (process-scoped types require `processId`).

---

## Acceptance snapshot (implementation)

See `09_acceptance/acceptance-criteria.md` for the checklist.  
Minimum green for this assembly:

- [x] Genesis height 0, hash chain verify genesis→tip  
- [x] Idempotent `clientRecordId`  
- [x] Unknown / process-scoped types fail closed  
- [x] Kill-switch / read-only blocks append  
- [x] memory + file + rocksdb stores  
- [x] HTTP status/tip/verify/query  
- [x] CLI status/genesis/verify  

---

## Related docs

- Ledger model: `01_ledger/`  
- API contracts: `08_api/`  
- Test plan: `09_acceptance/test-plan.md`  
- Index mirror (non-SoT): `docs/db/`  
