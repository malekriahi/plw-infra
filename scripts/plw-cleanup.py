#!/usr/bin/env python3
"""PLW Namespace Cleanup Script
Removes completed/failed pods and jobs older than MAX_AGE_DAYS
"""
import subprocess
import json
from datetime import datetime, timezone, timedelta

MAX_AGE_DAYS = 2
PLW_NAMESPACES = ["plw-dev", "plw-staging", "plw-prod"]
TERMINAL_POD_PHASES = ["Succeeded", "Failed"]

def run(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.stdout.strip()

def get_age_days(creation_timestamp):
    created = datetime.fromisoformat(creation_timestamp.replace("Z", "+00:00"))
    age = datetime.now(timezone.utc) - created
    return age.days + age.seconds / 86400

def cleanup_completed_pods(namespace):
    print(f"\n[PLW] Cleaning namespace: {namespace}")
    raw = run(f"kubectl get pods -n {namespace} -o json")
    if not raw:
        print("  No pods found.")
        return
    data = json.loads(raw)
    for pod in data.get("items", []):
        name = pod["metadata"]["name"]
        phase = pod["status"].get("phase", "")
        created = pod["metadata"]["creationTimestamp"]
        age_days = get_age_days(created)
        if phase in TERMINAL_POD_PHASES and age_days >= MAX_AGE_DAYS:
            print(f"  Deleting {phase} pod (age {age_days:.1f}d): {name}")
            run(f"kubectl delete pod {name} -n {namespace}")

def cleanup_old_jobs(namespace):
    raw = run(f"kubectl get jobs -n {namespace} -o json")
    if not raw:
        return
    data = json.loads(raw)
    for job in data.get("items", []):
        name = job["metadata"]["name"]
        created = job["metadata"]["creationTimestamp"]
        age_days = get_age_days(created)
        succeeded = job["status"].get("succeeded", 0)
        failed = job["status"].get("failed", 0)
        is_terminal = succeeded > 0 or failed > 0
        if is_terminal and age_days >= MAX_AGE_DAYS:
            status = "succeeded" if succeeded else "failed"
            print(f"  Deleting {status} job (age {age_days:.1f}d): {name}")
            run(f"kubectl delete job {name} -n {namespace}")

def main():
    print(f"=== PLW Cleanup Script — {datetime.now().strftime('%Y-%m-%d %H:%M')} ===")
    print(f"(Removing terminal pods/jobs older than {MAX_AGE_DAYS} days)")
    for ns in PLW_NAMESPACES:
        cleanup_completed_pods(ns)
        cleanup_old_jobs(ns)
    print("\n=== PLW cleanup complete ===")

if __name__ == "__main__":
    main()
