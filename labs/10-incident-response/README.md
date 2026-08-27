# Lab 10 - Resposta a incidentes

## Objetivo

Investigar e corrigir um incidente controlado sem remover proteções de segurança.

## Cenário

A aplicação está saudável. O script de injeção troca a imagem por uma tag inexistente. O participante deve observar, formular hipóteses, mitigar e registrar uma linha do tempo.

```bash
kubectl apply -f scenario.yaml
kubectl -n incident rollout status deployment/api
bash scripts/inject-failure.sh
```

Não execute o injetor em ambientes compartilhados. Para restaurar, use uma imagem válida, acompanhe o rollout e execute `bash scripts/validate.sh`.

## Evidências

Entregue impacto, detecção, linha do tempo, causa raiz, mitigação e ações preventivas.
