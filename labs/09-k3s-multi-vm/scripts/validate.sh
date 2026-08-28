#!/usr/bin/env bash
set -euo pipefail

kubectl wait --for=condition=Ready nodes --all --timeout=180s
node_count=$(kubectl get nodes -o name | wc -l | tr -d ' ')
[[ "$node_count" -ge 3 ]] || { echo "Esperados pelo menos 3 nós, encontrados $node_count"; exit 1; }
kubectl -n kube-system get deployment coredns >/dev/null
kubectl get nodes -o wide
echo "Cluster K3s multi-VM validado."
