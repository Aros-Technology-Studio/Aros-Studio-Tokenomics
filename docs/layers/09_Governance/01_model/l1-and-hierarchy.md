# Hierarchy (v1)

| Level | Role | Implementation |
|-------|------|----------------|
| **L1** | Automated gate: allowlist, documents, КЭП flag | `evaluateL1` |
| **L2** | Multi-step human/role approval (open / grant) | `openL2` / `grantL2` |
| **L3** | Agent panel (policy evaluators; optional LLM adapters) | `evaluateL3` · `l3-agents` · `llm-adapters` |

## Rules

1. **No** ARO-weighted voting or coin stake as governance power.  
2. Governance **does not mint** and is not PoT.  
3. L1 is fail-closed (any reason code → fail).  
4. L2 is committee-style multi-approver, not token polling.  
5. L3 is advisory/hard-fail policy panel — not free-form executive AI over NodeChain.  

## Code map

| Concern | Path |
|---------|------|
| Service | `src/governance/governance.service.ts` |
| L3 agents | `src/governance/l3-agents.ts` |
| LLM adapters | `src/governance/llm-adapters.ts` (#70) |
| Consumers | `src/orchestrator`, `src/intake/tokenization.pipeline` |
