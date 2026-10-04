#!/bin/bash
# PLW Cluster Health Check Script
DATE=$(date '+%Y-%m-%d %H:%M:%S')
LOG="/var/log/plw-health.log"
SSH_KEY="$HOME/.ssh/plw_health"

declare -A NODES=(
  ["control-plane"]="local"
  ["worker-01"]="192.168.32.12"
  ["worker-02"]="192.168.32.13"
)

echo "=== PLW Health Check — $DATE ===" | sudo tee -a $LOG

echo "" | sudo tee -a $LOG
echo "--- Node Status ---" | sudo tee -a $LOG
kubectl get nodes --no-headers | sudo tee -a $LOG

echo "" | sudo tee -a $LOG
echo "--- PLW Pod Status ---" | sudo tee -a $LOG
kubectl get pods -A | grep plw | sudo tee -a $LOG

echo "" | sudo tee -a $LOG
echo "--- Pod Restart Count ---" | sudo tee -a $LOG
kubectl get pods -A -o wide | grep plw | \
  awk '{print $1, $2, "restarts:", $5}' | sudo tee -a $LOG

echo "" | sudo tee -a $LOG
echo "--- Disk Usage (all nodes) ---" | sudo tee -a $LOG
for node in "${!NODES[@]}"; do
  ip="${NODES[$node]}"
  echo "[$node]" | sudo tee -a $LOG
  if [ "$ip" == "local" ]; then
    df -h / | tail -1 | sudo tee -a $LOG
  else
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no devops@"$ip" "df -h / | tail -1" | sudo tee -a $LOG
  fi
done

echo "" | sudo tee -a $LOG
echo "--- NotReady Nodes (alert if any) ---" | sudo tee -a $LOG
NOT_READY=$(kubectl get nodes --no-headers | grep -v "Ready" | grep -v "control-plane")
if [ -z "$NOT_READY" ]; then
  echo "All nodes are Ready ✓" | sudo tee -a $LOG
else
  echo "WARNING: Some nodes are NOT Ready!" | sudo tee -a $LOG
  echo "$NOT_READY" | sudo tee -a $LOG
fi

echo "=== End of PLW health check ===" | sudo tee -a $LOG
