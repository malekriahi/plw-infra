# PLW Runbook 03 — Node Recovery

## When to use
When a worker node goes down or becomes NotReady.

## Diagnose
```bash
# Check node status
kubectl get nodes
kubectl describe node <node-name>

# Check node events
kubectl get events --field-selector involvedObject.name=<node-name>
```

## If node is unreachable (VMware powered off)
```bash
# 1. Power on the VM in VMware Workstation
# 2. Wait 2 minutes for the node to reconnect
# 3. Verify it rejoins the cluster:
kubectl get nodes -w
# ✓ Node shows Ready
```

## If node needs to be drained for maintenance
```bash
# Drain (evict pods safely)
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Do maintenance...

# Re-enable scheduling after maintenance
kubectl uncordon <node-name>
kubectl get nodes
# ✓ Node shows Ready, SchedulingEnabled
```

## If node never recovers
```bash
# Remove the bad node from cluster
kubectl delete node <node-name>

# Re-run Ansible to reinstall k3s agent on that VM
ansible-playbook -i inventory/hosts.ini playbooks/03-k3s.yml \
  --limit worker-01
```
