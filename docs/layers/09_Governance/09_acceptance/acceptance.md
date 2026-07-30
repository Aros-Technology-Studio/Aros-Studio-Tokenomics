# Acceptance — 09_Governance (C1)

**Code:** `src/governance/`  
**Status:** v1 implemented — checklist maps to real modules (no fake Done).  
**Law:** Core Canon · no ARO-weighted voting · governance does not mint.

Evidence command:

```bash
npm test -- --testPathPattern=governance
# expect governance.service.spec + llm-adapters.spec green
```

---

## Documentation

- [x] Scope / purpose / boundaries / non-goals (`00_scope/`)  
- [x] L1 hierarchy model (`01_model/l1-and-hierarchy.md`)  
- [x] L2/L3 AI panel model (`01_model/l2-l3-ai.md`)  
- [x] API surface (`03_api/api.md`)  
- [x] This acceptance (C1 depth)

---

## L1 — automated gate

**Code:** `GovernanceService.evaluateL1`

| Check | Evidence |
|-------|----------|
| [x] Fail-closed on missing allowlist | reason `L1_INSTITUTION_NOT_ALLOWLISTED` |
| [x] Fail-closed on missing documents | `L1_DOCUMENTS_MISSING` |
| [x] Fail-closed on missing qualified signature flag | `L1_SIGNATURE_MISSING` |
| [x] Pass only when all three true | `pass: reasonCodes.length === 0` |
| [x] Used in pipeline / orchestrator | `TokenizationPipeline`, `OrchestratorService` |
| [x] Does not mint / append economic value | pure evaluate |

---

## L2 — multi-step committee (no token votes)

**Code:** `openL2` / `grantL2` / `isL2Complete` (+ aliases `openApproval` / `grant`)

| Check | Evidence |
|-------|----------|
| [x] Open subject with required grant count | `openL2(subjectId, required)` |
| [x] Grants accumulate unique approverIds | `Set` |
| [x] Complete when `count >= required` | unit test multi-grant |
| [x] Reject grant without open approval | throws `L2: no open approval` |
| [x] Reject empty approverId | throws `L2: approverId required` |
| [x] Orchestrator can require L2 | `requireL2` default true path |
| [x] No ARO stake / coin voting | no token balances in L2 |

---

## L3 — agent panel (policy + optional LLM)

**Code:** `l3-agents.ts`, `llm-adapters.ts`, `GovernanceService.evaluateL3`

| Check | Evidence |
|-------|----------|
| [x] Five default policy agents | `intake_integrity`, `pot_consistency`, `economic_bounds`, `anomaly_watch`, `release_risk` |
| [x] Panel aggregate pass/fail + opinions | `runAgentPanel` / `L3Result` |
| [x] Fail when pot not verified | unit test |
| [x] Fail / score on Eye critical signals | `anomaly_watch` |
| [x] High-value threshold from hardening config | `evaluateL3` + `highValueThreshold` |
| [x] Registry from env | `L3AgentRegistry.fromEnv()` |
| [x] Optional LLM adapters (#70) | `llm-adapters.ts`, `AST_L3_USE_LLM` |
| [x] LLM fail-closed on bad response | adapters reject invalid / HTTP error |
| [x] Mock provider for CI | `MockLlmProvider` |
| [x] Default CI stays policy backend | tests assert `backend === 'policy'` unless LLM forced |
| [x] Orchestrator hard-fail L3 on high value / flag | `requireL3` path |

---

## NodeChain governance records

| Check | Evidence |
|-------|----------|
| [x] `recordGovernanceEvent` / `recordParamChange` append `param_change` | `writerRole: governance` |
| [x] No free mint via governance | payload only; no TokenService calls |

---

## Explicit non-goals (still true)

- ARO-weighted or coin voting  
- Eye veto / executive halt from governance  
- Portal mint  
- Replacing PoT as value gate  

---

## Residual (honest, not blocking v1 acceptance)

- [ ] Production multi-vendor LLM keys / secret store (ops)  
- [ ] Durable L2 grant state beyond process memory (journal-backed L2 if product requires multi-restart committee)  
- [ ] Separate HTTP REST controller for governance (today: in-process service + pipeline)  

---

## Sign-off

| Item | Result |
|------|--------|
| Unit tests | `npm test -- --testPathPattern=governance` |
| Layer code map | `GovernanceService` · `l3-agents` · `llm-adapters` |
| C1 depth vs thin checklist | **Done** (this file) |
