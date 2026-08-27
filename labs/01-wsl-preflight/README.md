# Lab 01 - WSL e preflight

## Objetivo

Preparar uma estação reprodutível e validar WSL 2, Docker, kubectl, kind, Helm e recursos mínimos.

## Passos

1. No PowerShell administrativo, execute `wsl --install` e reinicie quando solicitado.
2. Instale Ubuntu, Docker Desktop com integração WSL, kubectl, kind e Helm.
3. No WSL, execute `bash scripts/validate.sh`.

## Critério de saída

O script encerra com código zero e não encontra arquivo de configuração Kubernetes com permissões abertas.

## Limpeza

Este laboratório não cria recursos Kubernetes.
