#!/usr/bin/env bash
set -euo pipefail

kubectl -n workloads rollout status deployment/echo --timeout=120s
[[ $(kubectl -n workloads get deployment echo -o jsonpath='{.status.readyReplicas}') == "2" ]]
kubectl -n workloads get configmap web-config >/dev/null
kubectl -n workloads get endpoints echo -o jsonpath='{.subsets[0].addresses[0].ip}' | grep -Eq '.+'
echo "Workloads validados."
