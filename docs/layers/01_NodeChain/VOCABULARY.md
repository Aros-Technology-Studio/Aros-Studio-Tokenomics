# NodeChain vocabulary (A8 + B5)

**Status:** Product law for this layer  
**Date:** 2026-07-30

## Prefer

| Term | Meaning |
|------|---------|
| **Node** (chain unit) | One append-only position in NodeChain: `height`, `envelopeHash`, `prevHash` |
| **Nodes list** / **ListNodes** | Tip-first feed: `GET /v1/core/nodechain/nodes` · public `GET /v1/public/nodechain/nodes` |
| **Height** | Monotonic index (0 = genesis) |
| **envelopeHash / prevHash** | Hash-chain link fields |
| **Journal record** | Storage/envelope implementation name (ok in code internals) |
| **Network node** | Participant in `GET /v1/core/nodes` (writer/validator) — **different** from chain node |
| **ListNetworkNodes** | `GET /v1/core/nodes` — registry, not explorer feed |

## Two HTTP trees (do not mix)

| Surface | Path prefix | Product meaning |
|---------|-------------|-----------------|
| Journal / chain | `/v1/core/nodechain/*` | SoT spine, ListNodes, tip, verify |
| Network registry | `/v1/core/nodes/*` | Participant identity + reputation |

Full table: [`08_api/nodes-vs-registry.md`](./08_api/nodes-vs-registry.md).

## Forbidden in product API / UI

| Avoid | Why |
|-------|-----|
| `/blocks`, `blocks[]`, `blockNumber`, `blockHash` | Blockchain costume; fails domain-invariants-guard on Core routes |
| “Latest blocks”, “Tip block”, “Journal as blockchain” as product framing | Misleads institutions |
| Using “nodes list” for the **registry** feed | Collapses chain unit vs participant |

## Allowed English (verb / other domains)

- “blocks appends”, “blocked until Release Phase”, “CGNAT blocks ports”  
- CSS `display: block`  
- Content-pack “Block: hero” (page section, not NodeChain)  

## UI

Portal `/nodechain` copy (EN/RU/KA) uses **node / Nodes list / tip node**.  
CSS classes: `nc-node-*` (not `nc-block-*`).  
Registry is not rendered as the public explorer table.

## Related

- `08_api/query-api.md` — ListNodes + AuthZ  
- `08_api/nodes-vs-registry.md` — dual API (B5)  
- `ASSEMBLY.md` — HTTP table  
- P0–P4: word “blocks” forbidden in product API  
