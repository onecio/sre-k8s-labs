#!/usr/bin/env bash
set -euo pipefail

required_namespaces=(platform observability gitops)
for namespace in "${required_namespaces[@]}"; do
  kubectl get namespace "$namespace" >/dev/null || { echo "Namespace ausente: $namespace"; exit 1; }
done

kubectl get deployments,statefulsets -A -o json | node -e '
let body="";
process.stdin.on("data", chunk => body += chunk);
process.stdin.on("end", () => {
  const items = JSON.parse(body).items;
  const invalid = items.filter(item => (item.spec.template.spec.containers || []).some(container => !container.resources?.requests || !container.resources?.limits));
  if (invalid.length) {
    console.error("Workloads sem requests e limits:", invalid.map(item => `${item.metadata.namespace}/${item.metadata.name}`).join(", "));
    process.exit(1);
  }
});'
kubectl get networkpolicy -A --no-headers | grep -Eq '.+'
kubectl get --raw='/readyz' | grep -q ok
echo "Controles automatizados do capstone aprovados. Revisão técnica ainda obrigatória."
