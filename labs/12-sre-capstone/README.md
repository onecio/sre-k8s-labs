# Lab 12 - SRE Capstone ECOMNIX

## Missão

Entregar e operar uma plataforma Kubernetes para três serviços, com promoção GitOps, controles de segurança, telemetria, SLO e resposta a game day.

## Restrições

- Disponibilidade alvo mensal de 99,9% para a API pública.
- Nenhuma credencial no Git.
- Workloads sem privilégio, com recursos, probes e políticas de rede.
- Mudanças de produção promovidas por pull request.
- RTO de 30 minutos e RPO de 15 minutos para o serviço stateful.

## Entregáveis

1. Diagrama e registro de decisões arquiteturais.
2. Repositório declarativo com ambientes separados.
3. Painel de SLO e alertas de burn rate.
4. Evidências de backup e recuperação.
5. Post-mortem sem culpabilização após game day.
6. Resultado de `bash scripts/validate.sh`.

O capstone não oferece uma solução única. A credencial profissional requer revisão técnica das evidências além da validação automatizada.
