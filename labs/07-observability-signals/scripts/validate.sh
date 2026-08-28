#!/usr/bin/env bash
set -euo pipefail

kubectl -n monitoring rollout status deployment/monitoring-grafana --timeout=300s
kubectl -n monitoring get prometheusrule kubelab-slo >/dev/null
kubectl -n monitoring get pods -l app.kubernetes.io/name=prometheus -o jsonpath='{.items[0].status.phase}' | grep -qx Running
echo "Stack de observabilidade validada."
