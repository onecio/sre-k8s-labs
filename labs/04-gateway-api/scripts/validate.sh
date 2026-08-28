#!/usr/bin/env bash
set -euo pipefail

kubectl api-resources --api-group=gateway.networking.k8s.io | grep -q httproutes
kubectl -n workloads get gateway kubelab >/dev/null
kubectl -n workloads get httproute echo >/dev/null
accepted=$(kubectl -n workloads get httproute echo -o jsonpath='{.status.parents[0].conditions[?(@.type=="Accepted")].status}')
[[ "$accepted" == "True" ]] || { echo "HTTPRoute ainda não aceita: ${accepted:-sem status}"; exit 1; }
echo "Gateway API validada."
