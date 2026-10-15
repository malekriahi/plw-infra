# PLW Runbook 02 — Deployment Rollback

## When to use
When a new PLW deployment is causing errors or high restart rates.

## Steps

### Check rollout history
```bash
kubectl rollout history deployment/plw-prod-planisware-hr -n plw-prod
# Shows all revisions — note the REVISION numbers
```

### Rollback to previous version (one step back)
```bash
kubectl rollout undo deployment/plw-prod-planisware-hr -n plw-prod
kubectl rollout status deployment/plw-prod-planisware-hr -n plw-prod
```

### Rollback to a specific revision
```bash
kubectl rollout undo deployment/plw-prod-planisware-hr \
  --to-revision=2 -n plw-prod
```

### Verify app is healthy after rollback
```bash
kubectl get pods -n plw-prod
curl http://<app-external-ip>/api/health
# Expected: {"status": "ok", "app": "Planisware HR", "timestamp": "..."}
```

### Using GitLab CI (preferred)
In GitLab UI → pipeline → click ▶ on rollback-prod job
