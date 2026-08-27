# Lab 07 - Observabilidade orientada a sinais

## Objetivo

Instrumentar o cluster com métricas, painéis e alerta orientado a sintoma.

## Execução

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm upgrade --install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace -f values.yaml
kubectl apply -f prometheus-rule.yaml
bash scripts/validate.sh
```

## Evidências

Capture alvos ativos, consulta PromQL, alerta em estado pending ou firing e painel com os quatro sinais de ouro.

## Limpeza

`helm uninstall monitoring -n monitoring`
