#!/usr/bin/env bash
set -euo pipefail

required=(docker kubectl kind helm)
for command_name in "${required[@]}"; do
  command -v "$command_name" >/dev/null || { echo "Ausente: $command_name"; exit 1; }
done

docker info >/dev/null
if [[ -f "${KUBECONFIG:-$HOME/.kube/config}" ]]; then
  permissions=$(stat -c '%a' "${KUBECONFIG:-$HOME/.kube/config}")
  [[ "$permissions" == "600" || "$permissions" == "640" ]] || { echo "Permissões inseguras no kubeconfig: $permissions"; exit 1; }
fi
echo "Preflight aprovado."
