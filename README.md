# Manual Kubernetes para SRE/DevOps

> Do absoluto zero a implantacao, operacao, diagnostico e automacao de aplicacoes em Kubernetes.

## Visao Geral

Este e um manual interativo e completo para aprender Kubernetes, voltado para profissionais de SRE e DevOps. O projeto e uma aplicacao web estatica (PWA) que pode ser acessada offline apos o primeiro carregamento.

### Caracteristicas

- Conteudo Completo: Fundamentos, Arquitetura, kubectl, Services, Ingress, Storage, Seguranca, CI/CD, Observabilidade e Troubleshooting
- 10 Laboratorios Praticos: K3s, Helm, Traefik, Cloudflare TLS, Apps Fullstack, PostgreSQL, CI/CD e Observabilidade
- Quizzes Interativos: Teste seus conhecimentos apos cada modulo
- Sistema de Progresso: Acompanhe seu aprendizado com barra de progresso e badges de conquista
- Dark/Light Mode: Tema escuro e claro com alternancia automatica
- Busca Avancada: Encontre qualquer conteudo rapidamente (Ctrl+K)
- PWA: Funciona offline apos o primeiro carregamento
- Impressao Otimizada: Salve como PDF com estilos dedicados para impressao
- Acessibilidade: Suporte completo a navegacao por teclado e leitores de tela
- Responsivo: Funciona perfeitamente em desktop, tablet e mobile

## Tecnologias

- HTML5/CSS3/JavaScript vanilla (sem frameworks)
- Lucide Icons para icones modernos e consistentes
- Service Worker para suporte offline (PWA)
- GitHub Actions para deploy automatico

## Estrutura do Projeto

```
.github/workflows/deploy.yml  - Workflow de deploy para GitHub Pages
.nojekyll                      - Desabilita processamento Jekyll
icon.svg                       - Icone do PWA
index.html                     - Pagina principal (todo o conteudo)
manifest.json                  - Manifesto PWA
service-worker.js              - Service Worker para offline
```

## Como Usar

### Local

1. Clone o repositorio:
   ```bash
   git clone https://github.com/onecio/sre-k8s-labs.git
   cd sre-k8s-labs
   ```

2. Abra index.html no navegador ou use um servidor local:
   ```bash
   python -m http.server 8000
   # ou
   npx serve .
   ```

3. Acesse http://localhost:8000

## Conteudo

### Modulos

1. Fundamentos (Containers, Imagens, K8s) - ~2h
2. Arquitetura do Cluster - ~2h
3. kubectl e Operacao - ~1.5h
4. Services e Rede - ~2h
5. Ingress Controllers - ~2h
6. Storage e Volumes - ~2h
7. Seguranca e Secrets - ~1.5h
8. Instalacao K3s - ~1h
9. Traefik via Helm - ~1h
10. App Fullstack - ~3h
11. CI/CD e GitOps - ~2h
12. Observabilidade - ~1.5h
13. Troubleshooting - ~2h
14. Plano de Estudo 30 Dias - ~30min

### Laboratorios Praticos

1. Lab 01: K3s Server + Worker
2. Lab 02: Helm e Repositorios
3. Lab 03: Traefik via Helm
4. Lab 04: Cloudflare TLS
5. Lab 05: App Frontend
6. Lab 06: App Backend
7. Lab 07: PostgreSQL
8. Lab 08: CI/CD GitHub Actions
9. Lab 09: Observabilidade
10. Lab 10: Troubleshooting

## Funcionalidades Interativas

- Quizzes: Teste seus conhecimentos ao final de cada modulo
- Checklists: Marque os topicos concluidos
- Glossario Pesquisavel: Busca em tempo real por termos
- Badges de Conquista: Compartilhe seu progresso
- Certificado: Gere um certificado personalizado ao completar todos os quizzes
- Exportacao PDF: Imprima ou salve como PDF com formatacao otimizada

## Contribuindo

1. Faca um fork do repositorio
2. Crie uma branch para sua feature
3. Commit suas mudancas
4. Push para a branch
5. Abra um Pull Request

## Recursos Uteis

- [Documentacao Oficial do Kubernetes](https://kubernetes.io/docs/)
- [K3s](https://k3s.io/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [Helm Documentation](https://helm.sh/docs/)
- [Cloudflare Documentation](https://developers.cloudflare.com/)

---

Desenvolvido com carinho para a comunidade SRE/DevOps
