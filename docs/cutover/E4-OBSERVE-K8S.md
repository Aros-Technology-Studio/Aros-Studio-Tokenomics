# E4 — Observability + Kubernetes field cutover

**Goal:** Post-deploy health/metrics smoke; optional K8s apply path.  
**Builds on:** I5 · I7 · `deploy/k8s/*` · `deploy/alerts/*`

---

## Health smoke (any host)

```bash
# Local compose / home-up
npm run cutover:health

# Public host
npm run cutover:health -- --base https://ast.example.com
# or separate services:
npm run cutover:health -- --core http://127.0.0.1:3000 --edge http://127.0.0.1:3100
```

Expect:

| Probe | Pass criteria |
|-------|----------------|
| Core `/health` | `ok: true` |
| Core `/metrics` | contains `ast_up 1` |
| Edge `/v1/health` | `status: ok` (or `ok`) |

---

## Prometheus rules

Example: `deploy/alerts/prometheus-rules.example.yml`  
Wire into your Prometheus / Grafana stack (owner).

---

## Kubernetes (optional)

```bash
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/configmap.yaml
# secrets — never commit:
# kubectl -n ast create secret generic ast-secrets --from-env-file=.env.production
kubectl apply -f deploy/k8s/core-deployment.yaml
kubectl apply -f deploy/k8s/portal-edge-deployment.yaml
kubectl apply -f deploy/k8s/portal-ui-deployment.yaml
kubectl apply -f deploy/k8s/services.yaml
```

Then Ingress/TLS (owner) and:

```bash
npm run cutover:health -- --core https://core.ast.example.com --edge https://api.ast.example.com
```

---

## Checklist

| # | Step | Done |
|---|------|------|
| 1 | `cutover:health` PASS on target | |
| 2 | Metrics scraped or health check monitored | |
| 3 | Alert routes tested (optional) | |
| 4 | If K8s: PVC for journal, secrets, probes green | |
| 5 | Kill-switch procedure known | |

---

## Acceptance

| Check | Evidence |
|-------|----------|
| `scripts/cutover-health.sh` | repo |
| K8s skeleton | `deploy/k8s` |
| Live cluster / Alertmanager | **Owner** |
