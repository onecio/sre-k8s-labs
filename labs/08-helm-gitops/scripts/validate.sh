#!/usr/bin/env bash
set -euo pipefail

lab_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
helm lint "$lab_root/chart"
helm template kubelab "$lab_root/chart" -f "$lab_root/environments/dev-values.yaml" >/dev/null
echo "Chart Helm validado. Valide também o estado Synced e Healthy no controlador GitOps escolhido."
