#!/usr/bin/env bash
set -euo pipefail

identity='system:serviceaccount:secure:observer'
kubectl auth can-i list pods -n secure --as="$identity" | grep -qx yes
kubectl auth can-i get secrets -n secure --as="$identity" | grep -qx no
kubectl -n secure get networkpolicy default-deny >/dev/null
[[ $(kubectl get namespace secure -o jsonpath='{.metadata.labels.pod-security\.kubernetes\.io/enforce}') == "restricted" ]]
echo "Controles de segurança validados."
