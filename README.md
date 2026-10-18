# PLW Infrastructure Project

Cloud-native DevOps platform built on VMware Workstation.
Deploys **Planisware HR** (a MEAN-stack HR application — Timecard, Days Off,
WFH, Interviews, Appraisals) across a self-healing Kubernetes cluster
with full CI/CD automation and production monitoring.

## Architecture

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                  Host Machine (Windows)                  │
│                                                          │
│  ┌──────────────┐  ┌───────────┐  ┌───────────────────┐ │
│  │ control-plane│  │ worker-01 │  │    worker-02      │ │
│  │  k3s master  │  │ k3s agent │  │    k3s agent      │ │
│  │  4GB RAM     │  │  3GB RAM  │  │     3GB RAM       │ │
│  └──────────────┘  └───────────┘  └───────────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐│
│  │         infra VM  (4GB RAM)                          ││
│  │   GitLab CE  +  Container Registry  +  CI Runner     ││
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
\`\`\`

## Tech Stack

| Layer          | Technology                            |
|----------------|---------------------------------------|
| Application    | Angular + Express.js + MongoDB (MEAN) |
| IaC            | Terraform (VMware provider)           |
| Configuration  | Ansible playbooks                     |
| Containers     | Docker + GitLab Registry              |
| Orchestration  | k3s (lightweight Kubernetes)          |
| Packaging      | Helm charts                           |
| CI/CD          | GitLab CI (.gitlab-ci.yml)            |
| Monitoring     | Prometheus + Grafana                  |
| Load Balancer  | MetalLB                               |
| Automation     | Python + Bash scripts                 |

## Environments

| Namespace     | Replicas | Purpose              |
|---------------|----------|----------------------|
| plw-dev       | 1        | Development testing  |
| plw-staging   | 2        | Pre-production       |
| plw-prod      | 3        | Production           |

## Quick Start

### 1. Provision infrastructure
\`\`\`bash
cd infra/terraform && terraform apply -parallelism=1
cd ../ansible
ansible-playbook -i inventory/hosts.ini playbooks/01-base.yml
ansible-playbook -i inventory/hosts.ini playbooks/02-docker.yml
ansible-playbook -i inventory/hosts.ini playbooks/03-k3s.yml
ansible-playbook -i inventory/hosts.ini playbooks/04-gitlab.yml
\`\`\`

### 2. Deploy application
\`\`\`bash
helm install plw-prod k8s/charts/planisware-hr/ \
  -n plw-prod -f k8s/charts/planisware-hr/values-prod.yaml
\`\`\`

### 3. Access services
- GitLab:  http://192.168.32.11
- App:     http://192.168.32.204
- Grafana: http://192.168.32.202

## Project Structure

\`\`\`
plw-infra/
├── infra/
│   ├── terraform/      # VM provisioning (IaC)
│   └── ansible/        # VM configuration
│       ├── inventory/
│       └── playbooks/
├── app/                # Planisware HR + Dockerfile
├── k8s/
│   ├── base/           # Raw Kubernetes manifests
│   └── charts/         # Helm charts
│       └── planisware-hr/
├── scripts/            # Automation scripts
│   ├── plw-health-check.sh
│   └── plw-cleanup.py
├── docs/
│   └── runbooks/       # Operational procedures
└── .gitlab-ci.yml      # CI/CD pipeline
\`\`\`

## CI/CD Pipeline

\`\`\`
git push → test → build → push image → deploy-dev → [manual] → deploy-prod
                                                         ↓
                                                    rollback-prod (manual)
\`\`\`

## Monitoring

- Prometheus scrapes cluster metrics every 15 seconds
- Grafana PLW Overview dashboard: pod count, CPU, memory, restarts
- Alert rules: PLWPodCrashLooping, PLWNodeNotReady, PLWHighCPU, PLWPodNotRunning

## Runbooks

- [Scale-out procedure](docs/runbooks/01-scale-out.md)
- [Deployment rollback](docs/runbooks/02-rollback.md)
- [Node recovery](docs/runbooks/03-node-recovery.md)
