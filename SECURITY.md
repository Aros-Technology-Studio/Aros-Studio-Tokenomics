# Security

## Reporting

Report vulnerabilities privately to the Aros Technology Studio maintainers (org security contact).  
Do not open public issues for active exploits.

## Product security posture

- NodeChain is sole SoT; index DB is not authoritative  
- Mint only after PoT `verified=1`  
- Kill-switch → fail-closed read-only  
- All-Seeing Eye observes/notifies only (no veto in code)  
- Production keys: HSM provider (see issue #68) — v1 demo uses `.ast-keys.json`  

## Dependencies

Keep Node ≥ 20. Run `npm audit` in CI as process matures.
