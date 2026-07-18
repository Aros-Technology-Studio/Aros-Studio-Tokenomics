# Timeouts

| Timer | Default | Effect |
|-------|---------|--------|
| PoT confirmation window | **15 minutes** (Core Canon §XII) | After `process_open.timestampUtc` + 15m, evaluation yields `verified=0`, `POT_TIMEOUT` |

## Rules

- Clock: **UTC only**  
- On timeout: journal verdict 0; client must open a **new processId** for retry  
- Orchestrator step timeouts (5m) are outside PoT criteria but may abort upstream stages before PoT runs  
