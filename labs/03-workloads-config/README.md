# Lab 03 - Workloads, configuração e exposição

## Objetivo

Aplicar Deployment, ConfigMap, probes, recursos e Service usando Kustomize.

## Execução

```bash
kubectl apply -k starter
bash scripts/validate.sh
```

Altere a mensagem da ConfigMap, aplique novamente e observe o rollout. Explique por que uma ConfigMap montada e uma variável de ambiente possuem comportamentos diferentes.

## Limpeza

`kubectl delete -k starter`
