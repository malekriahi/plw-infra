# PLW Runbook 01 — Scale-Out Procedure

## When to use
When Planisware-HR is under heavy load and HPA is not scaling fast enough.

## Option A — Manual replica scale
```bash
kubectl scale deployment plw-prod-planisware-hr --replicas=5 -n plw-prod
kubectl rollout status deployment/plw-prod-planisware-hr -n plw-prod
kubectl get pods -n plw-prod
```

## Option B — Helm upgrade (permanent change)
```bash
helm upgrade plw-prod k8s/charts/planisware-hr/ \
  -n plw-prod \
  -f k8s/charts/planisware-hr/values.yaml \
  -f k8s/charts/planisware-hr/values-prod.yaml \
  --set replicaCount=5
```

## Scale back down
```bash
kubectl scale deployment plw-prod-planisware-hr --replicas=3 -n plw-prod
```
