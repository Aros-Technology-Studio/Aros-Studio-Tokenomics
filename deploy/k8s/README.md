# Kubernetes skeleton (I5)

**Not a production cluster.** Apply only after secrets and image registry are set.

```bash
# Example
kubectl apply -f deploy/k8s/namespace.yaml
kubectl apply -f deploy/k8s/configmap.yaml
# create secrets separately — never commit
# kubectl create secret generic ast-secrets -n ast --from-literal=...
kubectl apply -f deploy/k8s/core-deployment.yaml
kubectl apply -f deploy/k8s/portal-edge-deployment.yaml
kubectl apply -f deploy/k8s/portal-ui-deployment.yaml
kubectl apply -f deploy/k8s/services.yaml
```

Owner residual: Ingress, TLS certs, HPA, network policies, managed Postgres/Redis.
