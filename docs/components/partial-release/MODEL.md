# MODEL — `partial-release`

**Status:** ready  

---

## Entities

| Entity | Meaning | Identity |
|--------|---------|----------|
| PartialReleaseRequest | Holder+institution approved intent | requestId |
| PartialReleaseProcess | Full economic process | processId (new) |
| PartialReleasePayload | NodeChain payload | under ExecutionSnapshot |
| ChildReserveRecord | Immutable reserve history | childId |
| ProRataPlan | Holder impact | processId |

---

## Lifecycle

```
Portal request (holder) + institutional approval
  → Orchestrator StartProcess (new processId)
  → … pipeline including PoT …
  → atomic burn + reserve child records + remint/split
  → NodeChain ExecutionSnapshot + partialRelease payload
```

Pre–Release Phase: internal circulation only.  
Post–Release Phase: external still subject to compliance + phase gates.

---

## Defaults

- Dust: same as ARO min unit `10^-9`  
- Governance: lighter than full phase change (configurable multi-step may still apply)  
