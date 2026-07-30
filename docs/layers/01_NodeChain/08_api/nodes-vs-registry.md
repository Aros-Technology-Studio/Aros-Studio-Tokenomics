# ListNodes (chain) vs network node registry (B5)

**Status:** Canonical distinction  
**Date:** 2026-07-30  

Two different “nodes” surfaces exist under `/v1/core/*`. They **must not** be confused.

---

## Side-by-side

| | **Chain Nodes list** | **Network node registry** |
|--|----------------------|---------------------------|
| **What** | Append-only journal positions (SoT spine units) | Writers / validators / observers (participants) |
| **HTTP** | `GET /v1/core/nodechain/nodes?limit=` | `GET /v1/core/nodes` |
| **Public edge** | `GET /v1/public/nodechain/nodes` | Not public (ops / internal) |
| **Item fields** | `height`, `envelopeHash`, `prevHash`, `type`, `processId`, … | `nodeId`, `role`, standing, reputation |
| **Code** | `CoreNodechainController.listNodes` · `NodechainService.listRecent` | `CoreNodesController` · `NodeRegistryService` |
| **Canon name** | Chain **node** / Nodes list | **Network node** |
| **AuthZ (B3)** | Institution: system + own processes; ops: full; public: flag | Registry list (ops-oriented; not explorer feed) |

---

## Logical API names

| Logical | HTTP |
|---------|------|
| **ListNodes** | `GET /v1/core/nodechain/nodes` |
| **ListNetworkNodes** | `GET /v1/core/nodes` |
| **GetNetworkNode** | `GET /v1/core/nodes/:nodeId` |
| **RegisterNetworkNode** | `POST /v1/core/nodes/register` |

---

## Example responses (shape)

### Chain Nodes list

```json
{
  "tip": { "height": 12, "tipHash": "…" },
  "count": 2,
  "scope": "anonymous",
  "nodes": [
    {
      "height": 12,
      "envelopeHash": "…",
      "prevHash": "…",
      "type": "process_open",
      "processId": "AST-DEMO-20260730-…",
      "recordId": "…"
    }
  ]
}
```

### Network registry

```json
{
  "nodes": [
    { "nodeId": "v1", "role": "confirmer", "…": "…" }
  ],
  "reputations": [ … ]
}
```

---

## Portal UI

| UI route | Uses |
|----------|------|
| `/nodechain` | **Chain** Nodes list only (`/v1/public/nodechain/nodes`) |
| (no public registry UI) | Network registry stays Core ops |

---

## Forbidden collapse

- Do **not** rename `GET /v1/core/nodes` to mean journal heights.  
- Do **not** expose network registry as “Latest nodes” on the explorer home.  
- Do **not** reintroduce product-API `/blocks`.  

See also: `../VOCABULARY.md`, `query-api.md`.
