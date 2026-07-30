# I7 — Observability alerts

## Engineering

| Piece | Location |
|-------|----------|
| Metrics | `GET /metrics` (Prometheus text) on Core |
| Health | `GET /health` (JSON, enriched) |
| Example rules | `deploy/alerts/prometheus-rules.example.yml` |

Metrics:

- `ast_up`
- `ast_kill_switch`
- `ast_journal_height`
- `ast_chain_ok`
- `ast_uptime_seconds`

## Residual

Prometheus operator, Alertmanager receivers, Grafana dashboards, SLO burn rates.
