# Lab 11 - Alta disponibilidade e disaster recovery

## Objetivo

Projetar control plane redundante, definir RPO e RTO, gerar backup verificável e executar recuperação controlada.

## Requisitos técnicos

- Três nós de control plane em zonas de falha distintas.
- Endpoint estável para a API.
- Backup criptografado e armazenado fora do domínio de falha.
- Runbook revisado por outra pessoa.

## Exercício

1. Registre RPO, RTO, componentes críticos e dependências.
2. Gere um snapshot conforme a distribuição Kubernetes escolhida.
3. Calcule e registre o SHA-256.
4. Remova um nó de control plane de forma controlada.
5. Restaure em ambiente isolado e execute `bash scripts/validate.sh`.

Defina `KUBELAB_BACKUP_FILE` com o caminho do backup restaurado antes da validação.
