# F5 — Final engineering rollup (A–I + F)

**Date:** 2026-07-30  
**Meaning:** Repo engineering blocks are closed with evidence.  
**Not:** “Regulated production certified” or “auditor signed.”

---

## Blocks closed (engineering)

| Block | Scope |
|-------|--------|
| **A** | Repo hygiene / CI / companions / vocabulary |
| **B** | NodeChain residuals (crypto, scope, stream, mirror) |
| **C** | Acceptance depth + operator smoke |
| **D** | Portal pilot finish D1–D12 |
| **I** | Infra package I1–I7 |
| **E** | Live production cutover packages (E1–E4) |
| **F** | Final go-live / audit prep / CI noise / field release |

Track: [`COMPLETION-TRACK.md`](COMPLETION-TRACK.md) · Cutover: [`cutover/BLOCK-E.md`](cutover/BLOCK-E.md)

---

## Owner residual (still open)

| Item | Where |
|------|--------|
| Live DNS / tunnel cutover | D8 · F1 |
| National IdP / JWKS | D6 |
| Managed Postgres/Redis/Kafka | I1–I3 |
| `kubectl apply` + secrets | I5 |
| External auditor engagement | F2 |
| Semver tag + GHCR publish | F4 |
| Optional sign-offs in chat | B1 / D3 / F1 / I6 |

---

## Quick verification

```bash
npm run check:canon
npm run check:release
npm run home:up
npm run demo:pdf-e2e
curl -s http://127.0.0.1:3000/metrics | head
```

## Product stance (unchanged)

- AST is an institutional **tool**  
- Portal is edge only — **never mints**  
- NodeChain journal is **SoT**  
