# PLW Runbook 01 — Scale-Out Procedure

## When to use
When PLW app is under heavy load and HPA is not scaling fast enough,
or when you want to manually increase capacity.

## Steps

### Option A — Manual replica scale
```bash
# Scale plw-prod to 5 replicas manually
kubectl scale deployment plw-prod-planisware-hr --replicas=5 -n plw-prod

# Verify pods are Running
kubectl get pods -n plw-prod

# Watch rollout complete
kubectl rollout status deployment/plw-prod-planisware-hr -n plw-prod
```

### Option B — Update Helm values for permanent change
```bash
# Edit values-prod.yaml — change replicaCount to 5
cd ~/plw-infra/k8s/charts/planisware-hr
nano values-prod.yaml

# Apply with Helm upgrade
helm upgrade plw-prod planisware-hr/ \
  -n plw-prod \
  -f values.yaml \
  -f values-prod.yaml

# Verify
kubectl get pods -n plw-prod
```

## Rollback scale
```bash
kubectl scale deployment plw-prod-planisware-hr --replicas=3 -n plw-prod
```
