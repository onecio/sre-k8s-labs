# Lab 08 - Helm 4 e fluxo GitOps

## Objetivo

Empacotar uma aplicação, validar o chart e promover uma alteração por fluxo declarativo.

## Execução

```bash
helm lint chart
helm template kubelab chart -f environments/dev-values.yaml > /tmp/kubelab-rendered.yaml
kubectl apply --server-side --dry-run=server -f /tmp/kubelab-rendered.yaml
bash scripts/validate.sh
```

Conecte o diretório a Argo CD ou Flux em um repositório de laboratório e demonstre drift e reconciliação.

## Critério de saída

Chart aprovado, renderização válida e aplicação GitOps sincronizada sem credenciais no repositório.
