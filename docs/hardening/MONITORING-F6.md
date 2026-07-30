# F6 — Monitoring / alerts

**Status:** Minimal scrape surface + example rules · full stack residual  
**Builds on:** I7 · `GET /metrics` · `GET /health`

## Metrics (Core)

| Metric | Meaning |
|--------|---------|
| `ast_up` | process serving |
| `ast_kill_switch` | 1 if engaged |
| `ast_journal_height` | tip height |
| `ast_chain_ok` | full verify ok |
| `ast_uptime_seconds` | uptime |

```bash
curl -s http://127.0.0.1:3000/metrics
curl -s http://127.0.0.1:3000/health
npm run monitor:smoke
# public:
npm run monitor:smoke -- --base https://core.example.com
```

## Example Prometheus rules

`deploy/alerts/prometheus-rules.example.yml`

| Alert | Signal |
|-------|--------|
| AstCoreDown | scrape down |
| AstKillSwitchEngaged | kill-switch = 1 |
| AstChainVerifyFailed | chain_ok = 0 |
| AstJournalStalled | height flat (tune for idle) |
| AstEdgeDown | optional edge job |

## JSON logs

`AST_LOG_JSON=1` → stdout JSON for Loki/ELK (I4).

## Acceptance

| Check | Status |
|-------|--------|
| `/metrics` + `/health` | ✅ |
| Example alert rules | ✅ |
| `monitor:smoke` | ✅ |
| Live Prometheus/Alertmanager/Pager | **Owner residual** |
