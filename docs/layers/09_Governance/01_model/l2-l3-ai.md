# L2 / L3 AI hierarchy

## L1
Automated: allowlist, documents, qualified signature flags.

## L2 — committee (role-based)
Multi-step grants (`openL2` / `grantL2`).  
Not ARO-weighted. Default pipeline: 2 of committee.

## L3 — five-agent panel
Agents (deterministic stand-in for AI services):

1. `intake_integrity`  
2. `pot_consistency`  
3. `economic_bounds`  
4. `anomaly_watch`  
5. `release_risk`  

Each returns score 0..1 + pass/fail + reasons.  
Aggregate score; hard-fail on any agent fail or high-value weak score.  
Opinions journaled via `param_change` / governance events.  
**No mint authority** — gate only.
