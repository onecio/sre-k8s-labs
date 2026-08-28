#!/usr/bin/env bash
set -euo pipefail

kubectl -n stateful rollout status statefulset/database --timeout=180s
kubectl -n stateful exec database-0 -- test -s /data/prova.txt
kubectl -n stateful get pvc data-database-0 -o jsonpath='{.status.phase}' | grep -qx Bound
echo "Persistência validada."
