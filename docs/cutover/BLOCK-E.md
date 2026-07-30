# Host cutover packages (ops)

**Note:** Completion **Block E** is **Solidity / representation** (`docs/contracts/SOLIDITY-BLOCK-E.md`).  
This folder is **host cutover ops** (domain, secrets, data plane, health) — not on-chain.

**Status:** Engineering package done · actual cutover is **owner action**  
**Law:** Journal remains SoT. Demo institutions off. Portal never mints.

| ID | Slice | Package |
|----|--------|---------|
| C1 | Public hostname / DNS / TLS | [`E1-DOMAIN.md`](E1-DOMAIN.md) (filename historical) |
| C2 | Production secrets & preflight | [`E2-SECRETS.md`](E2-SECRETS.md) |
| C3 | Managed data plane (PG / Redis / events) | [`E3-DATA-PLANE.md`](E3-DATA-PLANE.md) |
| C4 | Observe + K8s field apply | [`E4-OBSERVE-K8S.md`](E4-OBSERVE-K8S.md) |

## Commands

```bash
# Validate .env.production before compose up
npm run cutover:preflight

# After stack is up — health + metrics smoke
npm run cutover:health
# or: npm run cutover:health -- --base https://your.domain
```

## Owner residual (cannot be Done in CI)

- Register/point DNS  
- Put real tokens in vault / `.env.production` (gitignored)  
- Run compose or `kubectl apply` on real hosts  
- Engage auditor / issue semver tag when ready  

Optional chat after live checks: **`E cutover done`**.
