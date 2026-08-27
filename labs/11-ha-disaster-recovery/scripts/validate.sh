#!/usr/bin/env bash
set -euo pipefail

backup_file=${KUBELAB_BACKUP_FILE:-}
[[ -n "$backup_file" && -s "$backup_file" ]] || { echo "Defina KUBELAB_BACKUP_FILE para um backup não vazio."; exit 1; }
sha256sum "$backup_file"
kubectl get --raw='/readyz?verbose' | grep -q 'readyz check passed'
ready_control_planes=$(kubectl get nodes -l node-role.kubernetes.io/control-plane -o jsonpath='{range .items[?(@.status.conditions[-1].status=="True")]}{.metadata.name}{"\n"}{end}' | sed '/^$/d' | wc -l)
[[ "$ready_control_planes" -ge 3 ]] || { echo "Control planes Ready insuficientes: $ready_control_planes"; exit 1; }
echo "Topologia HA e artefato de backup validados."
