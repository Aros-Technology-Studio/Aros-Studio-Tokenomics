# 08_AllSeeingEye

**Status:** v1 implemented + acceptance depth (C2)  
**Code:** `src/all-seeing-eye` · durable bus `src/event-stream`  
**Issue:** LAYER 08 All-Seeing Eye  

**Role:** Supra-layer **observe + notify** across pipeline.  

**Hard bounds:**  
**No veto, no rollback, no mint, no executive append as All-Seeing Eye.**

Hierarchical AI agents (product vision) may consume the same observe/notify bus; v1 code is the notification core + durable stream resume.

## Tree

```text
08_AllSeeingEye/
├── README.md
├── 00_scope/
├── 01_model/observe-notify.md
├── 03_api/api.md
└── 09_acceptance/acceptance.md   # C2 checklist
```

## Verify

```bash
npm test -- --testPathPattern='all-seeing-eye|durable-event'
npm run check:canon   # includes no-all-seeing-eye-executive-guard
```

## Related

- NodeChain events-out: `docs/layers/01_NodeChain/08_api/events-out.md`  
- Completion B4 durable stream  
