#!/usr/bin/env bash
set -euo pipefail

context=$(kubectl config current-context)
[[ "$context" == *kind* || "$context" == *kubelab* ]] || { echo "Contexto não reconhecido como laboratório: $context"; exit 1; }
kubectl -n incident set image deployment/api api=nginx:tag-inexistente-kubelab
echo "Falha injetada no contexto $context. Inicie a investigação."
