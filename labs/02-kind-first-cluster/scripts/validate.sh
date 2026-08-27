#!/usr/bin/env bash
set -euo pipefail

kubectl cluster-info >/dev/null
kubectl wait --for=condition=Ready nodes --all --timeout=120s
kubectl -n kubelab rollout status deployment/web --timeout=120s
kubectl -n kubelab run probe --image=curlimages/curl:8.10.1 --restart=Never --rm -i --command -- curl -fsS http://web
echo "Cluster local validado."
