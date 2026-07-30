# 02_identity_and_nodes

**Status:** documented

**Network node** identity, roles, admission, suspension. No stake-to-participate.  
Not PoT verdict logic.  
Not the chain **Nodes list** (journal heights) — see [`../08_api/nodes-vs-registry.md`](../08_api/nodes-vs-registry.md).

| Concern | HTTP | Code |
|---------|------|------|
| Network participants | `GET /v1/core/nodes` | `src/nodes`, `CoreNodesController` |
| Chain Nodes list | `GET /v1/core/nodechain/nodes` | `src/nodechain`, `CoreNodechainController` |

## Docs in this folder

- `node-roles.md`
- `registration-and-auth.md`
- `admission-and-standing.md`
- `suspension.md`
- `node-infrastructure.md`
