# PURPOSE — `oracle-gateway`

**Status:** ready (support module)  
**P4.16:** real; module name `oracle_gateway`  
**Code path:** `src/oracle-gateway/`

Orchestrator pipeline step 3 (if needed). Trust model: **multi-oracle + signature verification**. Transport for institutional data only — **not** AST self-appraisal. On failure: **fail-closed** (process expired).
