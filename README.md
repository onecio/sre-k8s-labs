# KubeLab ECOMNIX

Formação prática de Kubernetes para DevOps e SRE, do primeiro ambiente em WSL até cenários de operação, alta disponibilidade e resposta a incidentes.

[![Quality](https://github.com/onecio/sre-k8s-labs/actions/workflows/quality.yml/badge.svg)](https://github.com/onecio/sre-k8s-labs/actions/workflows/quality.yml)
[![Deploy](https://github.com/onecio/sre-k8s-labs/actions/workflows/deploy.yml/badge.svg)](https://github.com/onecio/sre-k8s-labs/actions/workflows/deploy.yml)

## Proposta educacional

A trilha combina explicação progressiva, prática reprodutível e evidências verificáveis. O conteúdo inicial usa linguagem acessível e exemplos concretos. O nível intermediário introduz os termos e mecanismos operacionais. O nível avançado adota linguagem técnica, restrições realistas e decisões arquiteturais.

| Nível | Resultado esperado | Ambiente principal |
|---|---|---|
| Foundations | Preparar o ambiente, compreender objetos e publicar workloads | WSL 2, Docker e kind |
| Kubernetes Operator | Operar rede, storage, segurança, observabilidade e GitOps | kind e K3s |
| Operations and SRE | Projetar resiliência, responder a incidentes e operar por SLOs | VMs, clusters HA e infraestrutura em escala |

## Laboratórios

Os diretórios em [`labs`](labs) contêm instruções, artefatos iniciais, verificações e critérios de saída.

1. WSL e preflight da estação
2. Primeiro cluster com kind
3. Workloads, configuração e exposição
4. Gateway API e roteamento moderno
5. Storage e StatefulSet
6. RBAC, segurança e políticas
7. Observabilidade orientada a sinais
8. Helm 4 e fluxo GitOps
9. K3s multi-VM
10. Resposta a incidentes
11. Alta disponibilidade e disaster recovery
12. SRE Capstone da plataforma ECOMNIX

## Credenciais KubeLab ECOMNIX

- Environment Ready: laboratório 01 validado.
- Kubernetes Foundations: laboratórios 01 a 03 validados.
- Kubernetes Essentials - Associate: onze avaliações com aproveitamento mínimo de 80% e laboratórios 01 a 10 validados.
- Operations and SRE: Associate concluído, laboratórios 11 e 12 validados e revisão técnica do capstone.

A versão atual gera credenciais locais no navegador. A verificação pública, assinatura criptográfica e emissão institucional exigem um serviço de credenciais separado e não são simuladas pelo frontend.

## Execução local

Requisitos: Node.js 20 ou superior. Para os laboratórios, consulte os requisitos de cada diretório.

```bash
git clone https://github.com/onecio/sre-k8s-labs.git
cd sre-k8s-labs
npm run validate
npm run dev
```

Acesse `http://localhost:8000`.

## Qualidade e build

```bash
npm run validate
npm run build
```

O build estático é gerado em `dist/`. O workflow de publicação usa o mecanismo oficial do GitHub Pages.

## Estrutura

```text
labs/                         Laboratórios e verificadores
scripts/                      Validação e build do portal
.github/workflows/            Qualidade e publicação
index.html                    Portal de aprendizagem
script.js                     Interações, progresso e credenciais
style.css                     Sistema visual responsivo
manifest.json                 Aplicação web instalável
service-worker.js             Operação offline
```

## Contribuição e segurança

Leia [CONTRIBUTING.md](CONTRIBUTING.md) antes de propor alterações. Vulnerabilidades devem seguir o processo descrito em [SECURITY.md](SECURITY.md).

## Referências

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Gateway API](https://gateway-api.sigs.k8s.io/)
- [kind](https://kind.sigs.k8s.io/)
- [K3s](https://docs.k3s.io/)
- [Helm](https://helm.sh/docs/)
- [Argo CD](https://argo-cd.readthedocs.io/)

KubeLab ECOMNIX. Formação baseada em competências para Kubernetes, DevOps e SRE.
