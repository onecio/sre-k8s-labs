#!/usr/bin/env bash
set -euo pipefail

kubectl -n incident rollout status deployment/api --timeout=180s
ready=$(kubectl -n incident get deployment api -o jsonpath='{.status.readyReplicas}')
[[ "$ready" == "2" ]] || { echo "Réplicas prontas: ${ready:-0}/2"; exit 1; }
kubectl -n incident get endpoints api -o jsonpath='{.subsets[0].addresses[0].ip}' | grep -Eq '.+'
echo "Incidente mitigado e serviço recuperado."
