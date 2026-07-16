# Security Policy — Aros Studio Tokenomics (AST)

## Reporting

Report suspected vulnerabilities privately to the product owner / security contact for Aros Technology Studio. Do not open public issues for active exploit details.

## Security model (summary)

| Principle | Rule |
|-----------|------|
| Fail-closed | Invalid or incomplete economic actions reject; no soft bypass |
| PoT + NodeChain | No significant token effect without `verified = 1` and ledger record |
| Selective custody | AST holds **only own** funds; not third-party custody |
| All-Seeing Eye | Observe / notify only — **no veto, rollback, mint, burn, pay** |
| Kill switch | Read-only / halt economic writes in ops emergencies |
| ERC adapters | Representation only — **not** source of truth |
| Secrets | Never commit keys, `.env` with secrets, or production credentials |

Canonical detail: `docs/AST-CORE-CANON.md`, `docs/architecture/security-model.md`.

## Supported versions

| Branch | Status |
|--------|--------|
| `main` | Active development (pre-production) |

## Checks

```bash
npm run check:canon
npm test
npm run build
```

Protective CI: `.github/workflows/*` (canon, philosophy, pot, eye, migration gates).

## Production notes (Phase 5)

- External security audit (human/org) is **required** before production claim.
- Encrypt NodeChain sensitive payloads at rest.
- mTLS / КЭП for institutional and node channels.
- Separate process deployment for All-Seeing Eye where ops allows.
