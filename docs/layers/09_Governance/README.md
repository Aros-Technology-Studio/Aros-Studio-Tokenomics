# 09_Governance

**Status:** v1 implemented + acceptance depth (C1)  
**Code:** `src/governance`  
**Issue:** LAYER 09 governance AI hierarchy, no voting  

**Role:**  
- **L1** automated policy (docs, signature, allowlist)  
- **L2** multi-step committee approvals  
- **L3** five-agent panel (policy default; optional LLM)  
- **param_change** records on NodeChain  

No ARO-weighted votes. Does not mint.

## Tree

```text
09_Governance/
├── README.md
├── 00_scope/
├── 01_model/          l1-and-hierarchy · l2-l3-ai
├── 03_api/            in-process API
└── 09_acceptance/     acceptance.md (C1 checklist)
```

## Verify

```bash
npm test -- --testPathPattern=governance
```
