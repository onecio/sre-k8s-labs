# Lab 02 - Primeiro cluster com kind

## Objetivo

Criar um cluster local com um nó de control plane e dois workers, publicar uma aplicação e validar DNS e conectividade.

## Execução

```bash
kind create cluster --name kubelab --config kind-config.yaml
kubectl apply -f starter.yaml
bash scripts/validate.sh
```

## Evidências

Registre `kubectl get nodes -o wide`, `kubectl get pods -A` e o resultado da validação.

## Limpeza

Execute `bash scripts/cleanup.sh`.
