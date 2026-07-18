# Boundaries — 01_NodeChain

## Inbound (who writes)

| Writer | What they may append | Condition |
|--------|----------------------|-----------|
| Orchestrator / process runtime | process lifecycle records | authenticated internal role |
| PoT engine | evidence refs, verdict records | after PoT logic completes; payload is opaque to NodeChain |
| Token / emission / settlement | economic result records | only after their gates; NodeChain does not re-check economics |
| Node / identity services | registration, suspend, restore | allowlisted writers |
| Governance services | parameter change records | role-based; recorded before effect elsewhere |

All writers use the **append API** (see `08_api`). No silent side files as SoT.

## Outbound (who reads)

| Reader | Access |
|--------|--------|
| PoT | read process history to assert P3 (states recorded) |
| Emission / token | read causes before mint/burn ack |
| Settlement | read confirmed process and weight-related facts |
| All-Seeing Eye | subscribe to event stream / query for observation |
| Institution (if exposed) | **own processes only** |
| Ops / audit | controlled full or scoped read |

## Hard boundary rules

1. **No bypass:** significant ops that skip append are invalid.  
2. **No invent state on recovery:** only replay recorded causes.  
3. **Index mirrors are not SoT:** Postgres/search may lag; journal wins.  
4. **Fail-closed on write errors:** prefer reject over partial ack.  
5. **All-Seeing Eye does not append in an executive role:** observation is read-side; executive halt if any is owned by executing modules / governance as product law defines — not as “ledger veto API” inside NodeChain.

## Interface sketch

```text
[Other layers] --append(record)--> [01_NodeChain] --durable height--> ack
[Other layers] <--query-- [01_NodeChain]
[All-Seeing Eye / ops]    <--events-- [01_NodeChain]
```

## Dependency direction

```text
PoT, Token, Settlement, Orchestrator  →  depend on NodeChain
NodeChain  →  does not depend on token formulas or All-Seeing Eye hierarchy
```
