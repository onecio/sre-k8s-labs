# Lab 06 - RBAC, segurança e políticas

## Objetivo

Aplicar menor privilégio, contexto de segurança e NetworkPolicy com negação padrão.

## Execução

```bash
kubectl apply -f starter.yaml
bash scripts/validate.sh
```

## Critério de saída

A ServiceAccount consulta Pods, não consulta Secrets e o namespace possui política de negação padrão.

## Limpeza

`kubectl delete -f starter.yaml`
