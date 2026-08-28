# Lab 05 - Storage e StatefulSet

## Objetivo

Validar identidade estável, persistência e recuperação após recriação de Pod.

## Execução

```bash
kubectl apply -f starter.yaml
kubectl -n stateful exec database-0 -- sh -c 'echo persistente > /data/prova.txt'
kubectl -n stateful delete pod database-0
bash scripts/validate.sh
```

## Critério de saída

O Pod retorna Ready e o arquivo criado antes da recriação permanece no volume.

## Limpeza

Remova os recursos. A remoção do PVC deve ser uma decisão explícita.
