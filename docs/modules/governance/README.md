# Governance module

**Code:** `src/governance/`  
**Canon:** multi-step approval for large ops / Release Phase; **no token-holder voting as value origin**  
**Eye:** never substitutes governance with veto

## Model (v1)

| Layer | Role | v1 |
|-------|------|-----|
| **L1** | Automated policy checks (docs completeness, basic risk flags) | **Real** — `GovernanceService` + orchestrator hooks |
| **L2** | Escalation / multi-approver steps | Optional multi-step `open` / `grant` / `requireComplete` |
| **L3** | Human / institutional policy gate | Optional by process policy |

No on-chain vote-weighted DeFi governance. No staking for governance power.

## API (service)

- `open(subjectId, requiredSteps)`  
- `grant(subjectId, approverId)` → NodeChain `governance_grant`  
- `isComplete` / `requireComplete`  
- `evaluateL1(input)` → pass/fail + reason codes (docs + basic risk)

## Related

- Release activation still needs metrics + governance readiness  
- `docs/modules/release/`  
