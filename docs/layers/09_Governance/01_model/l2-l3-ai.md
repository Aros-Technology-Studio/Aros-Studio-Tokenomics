# L2 / L3 governance agents

## L1
Automated: allowlist, documents, qualified signature flags.

## L2 — committee (role-based)
Multi-step grants (`openL2` / `grantL2`). Approver ids are real participants supplied by the caller. Not ARO-weighted.

## L3 — five policy agents
Real evaluators in `src/governance/l3-agents.ts`:

1. `intake_integrity`
2. `pot_consistency`
3. `economic_bounds`
4. `anomaly_watch`
5. `release_risk`

Each returns score, pass/fail, reasons. Optional remote agents: set `AST_L3_HTTP_<AGENT_ID>` to a POST URL (`HttpL3Agent` uses real `fetch`). Journal records L3 opinions. **No mint authority.**
