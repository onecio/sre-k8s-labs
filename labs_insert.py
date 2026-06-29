#!/usr/bin/env python3
"""Insert labs section and quizzes into index.html"""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================
# 1. INSERT LABS SECTION
# ============================================
labs_html = """
<!-- ==================== LABORATÓRIOS PRÁTICOS ==================== -->
<section class="section" id="labs">
  <h2><span class="sec-icon" style="background:var(--accent-subtle);color:var(--accent);"><i data-lucide="flask-conical" class="icon-svg"></i></span> 23. Laboratórios Práticos</h2>
  <p>10 labs guiados para colocar a mão no teclado. Cada lab tem objetivo claro, passo a passo e verificação ao final. Siga na ordem ou pule direto ao que precisa.</p>

  <div class="alert info">
    <span class="alert-icon"><i data-lucide="info" class="icon-svg"></i></span>
    <div class="alert-content"><strong>Pré-requisitos:</strong> Uma VM Ubuntu 22.04+ com pelo menos 2GB RAM e 2 vCPUs. Acesso SSH configurado. Conhecimentos básicos de Linux e terminal.</div>
  </div>

  <!-- Lab 01 -->
  <div class="lab-card" id="lab-01" onclick="toggleLab(this, event)">
    <div class="lab-card-header">
      <span class="lab-num">01</span>
      <div class="lab-info">
        <h4>Instalar K3s Server e Worker</h4>
        <div class="lab-meta">
          <span class="lab-tag beginner">Iniciante</span>
          <span><i data-lucide="clock" class="icon-svg"></i> ~30min</span>
          <span><i data-lucide="server" class="icon-svg"></i> 2 VMs</span>
        </div>
      </div>
      <span class="lab-arrow">▼</span>
    </div>
    <div class="lab-card-body"><div class="lab-card-body-inner">
      <p>Monte um cluster K3s com um node server (control plane) e um worker. Ao final, você terá um cluster funcional pronto para receber aplicações.</p>
      <h5><i data-lucide="crosshair" class="icon-svg"></i> Objetivo</h5>
      <p>Criar um cluster K3s com 2 nodes e validar que todos os componentes estão saudáveis.</p>
      <div class="lab-step"><span class="step-num">1</span><div class="step-content">Preparar ambientes — atualizar sistema e configurar hostnames únicos em cada VM.<br><code>sudo apt update && sudo apt upgrade -y</code></div></div>
      <div class="lab-step"><span class="step-num">2</span><div class="step-content">Instalar K3s no server com Traefik e ServiceLB desabilitados.<br><code>curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server --disable traefik --disable servicelb" sh -</code></div></div>
      <div class="lab-step"><span class="step-num">3</span><div class="step-content">Obter o token do cluster.<br><code>sudo cat /var/lib/rancher/k3s/server/node-token</code></div></div>
      <div class="lab-step"><span class="step-num">4</span><div class="step-content">Configurar kubectl sem sudo no server.<br><code>mkdir -p ~/.kube && sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config && sudo chown $USER:$USER ~/.kube/config</code></div></div>
      <div class="lab-step"><span class="step-num">5</span><div class="step-content">Instalar o worker usando o token e o IP do server.<br><code>curl -sfL https://get.k3s.io K3S_URL=https://IP_SERVER:6443 K3S_TOKEN=TOKEN INSTALL_K3S_EXEC="agent --node-name worker01" sh -</code></div></div>
      <div class="lab-verify"><strong>✓ Verificação:</strong> <code>kubectl get nodes -o wide</code> deve mostrar 2 nodes com STATUS Ready.</div>
    </div></div>
  </div>

  <!-- Lab 02 -->
  <div class="lab-card" id="lab-02" onclick="toggleLab(this, event)">
    <div class="lab-card-header">
      <span class="lab-num">02</span>
      <div class="lab-info">
        <h4>Helm e Repositórios</h4>
        <div class="lab-meta">
          <span class="lab-tag beginner">Iniciante</span>
          <span><i data-lucide="clock" class="icon-svg"></i> ~15min</span>
          <span><i data-lucide="package" class="icon-svg"></i> 1 ferramenta</span>
        </div>
      </div>
      <span class="lab-arrow">▼</span>
    </div>
    <div class="lab-card-body"><div class="lab-card-body-inner">
      <p>Instale o Helm 3, adicione repositórios essenciais e aprenda a gerenciar chart repositories.</p>
      <h5><i data-lucide="crosshair" class="icon-svg"></i> Objetivo</h5>
      <p>Helm funcional com repositórios de Traefik, NGINX e Prometheus adicionados.</p>
      <div class="lab-step"><span class="step-num">1</span><div class="step-content">Instalar o Helm 3 via script oficial.<br><code>curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash</code></div></div>
      <div class="lab-step"><span class="step-num">2</span><div class="step-content">Adicionar repositórios de charts populares.<br><code>helm repo add traefik https://traefik.github.io/charts</code><br><code>helm repo add prometheus-community https://prometheus-community.github.io/helm-charts</code><br><code>helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx</code></div></div>
      <div class="lab-step"><span class="step-num">3</span><div class="step-content">Atualizar e listar repositórios.<br><code>helm repo update && helm search repo traefik</code></div></div>
      <div class="lab-step"><span class="step-num">4</span><div class="step-content">Listar releases instaladas (deve estar vazio).<br><code>helm list -A</code></div></div>
      <div class="lab-verify"><strong>✓ Verificação:</strong> <code>helm version</code> deve mostrar v3.x. <code>helm repo list</code> deve listar os 3 repositórios adicionados.</div>
    </div></div>
  </div>

  <!-- Lab 03 -->
  <div class="lab-card" id="lab-03" onclick="toggleLab(this, event)">
    <div class="lab-card-header">
      <span class="lab-num">03</span>
      <div class="lab-info">
        <h4>Traefik via Helm</h4>
        <div class="lab-meta">
          <span class="lab-tag intermediate">Intermediário</span>
          <span><i data-lucide="clock" class="icon-svg"></i> ~25min</span>
          <span><i data-lucide="target" class="icon-svg"></i> Ingress Controller</span>
        </div>
      </div>
      <span class="lab-arrow">▼</span>
    </div>
    <div class="lab-card-body"><div class="lab-card-body-inner">
      <p>Instale o Traefik como Ingress Controller via Helm com CRDs, HostPort e redirecionamento HTTPS.</p>
      <h5><i data-lucide="crosshair" class="icon-svg"></i> Objetivo</h5>
      <p>Traefik rodando, escutando nas portas 80 e 443, pronto para rotear tráfego.</p>
      <div class="lab-step"><span class="step-num">1</span><div class="step-content">Criar namespace e instalar CRDs do Traefik.<br><code>kubectl create namespace traefik</code><br><code>helm template traefik-crds traefik/traefik-crds --namespace traefik | kubectl apply -f -</code></div></div>
      <div class="lab-step"><span class="step-num">2</span><div class="step-content">Criar o arquivo <code>values.yaml</code> com HostPort 80/443, IngressClass padrão e providers Kubernetes habilitados.</div></div>
      <div class="lab-step"><span class="step-num">3</span><div class="step-content">Instalar Traefik com os values customizados.<br><code>helm install traefik traefik/traefik --namespace traefik -f values.yaml --timeout 10m</code></div></div>
      <div class="lab-step"><span class="step-num">4</span><div class="step-content">Verificar que os pods estão rodando e que as portas estão abertas.<br><code>kubectl get pods -n traefik -o wide</code></div></div>
      <div class="lab-verify"><strong>✓ Verificação:</strong> <code>kubectl get pods -n traefik</code> mostra STATUS Running. <code>kubectl get ingressclass</code> mostra traefik como padrão.</div>
    </div></div>
  </div>

  <!-- Lab 04 -->
  <div class="lab-card" id="lab-04" onclick="toggleLab(this, event)">
    <div class="lab-card-header">
      <span class="lab-num">04</span>
      <div class="lab-info">
        <h4>Cloudflare Origin Certificate + TLSStore</h4>
        <div class="lab-meta">
          <span class="lab-tag intermediate">Intermediário</span>
          <span><i data-lucide="clock" class="icon-svg"></i> ~20min</span>
          <span><i data-lucide="shield" class="icon-svg"></i> TLS / SSL</span>
        </div>
      </div>
      <span class="lab-arrow">▼</span>
    </div>
    <div class="lab-card-body"><div class="lab-card-body-inner">
      <p>Configure certificado TLS da Cloudflare no Traefik para o modo Full Strict.</p>
      <h5><i data-lucide="crosshair" class="icon-svg"></i> Objetivo</h5>
      <p>Traefik servindo HTTPS com certificado válido da Cloudflare, com redirect automático HTTP → HTTPS.</p>
      <div class="lab-step"><span class="step-num">1</span><div class="step-content">Gerar Origin Certificate na Cloudflare Dashboard → SSL/TLS → Origin Server. Copiar o .crt e .key para o servidor.</div></div>
      <div class="lab-step"><span class="step-num">2</span><div class="step-content">Criar Secret TLS no namespace traefik.<br><code>kubectl create secret tls cloudflare-origin-tls --cert=cloudflare.crt --key=cloudflare.key -n traefik</code></div></div>
      <div class="lab-step"><span class="step-num">3</span><div class="step-content">Criar e aplicar o TLSStore para definir o certificado padrão.<br><code>kubectl apply -f tlsstore.yaml</code></div></div>
      <div class="lab-step"><span class="step-num">4</span><div class="step-content">No Cloudflare Dashboard, definir SSL/TLS mode como <strong>Full (Strict)</strong>.</div></div>
      <div class="lab-verify"><strong>✓ Verificação:</strong> <code>curl -vk https://seu-dominio.com</code> mostra certificado válido. Redirect HTTP → HTTPS funciona.</div>
    </div></div>
  </div>

  <!-- Lab 05 -->
  <div class="lab-card" id="lab-05" onclick="toggleLab(this, event)">
    <div class="lab-card-header">
      <span class="lab-num">05</span>
      <div class="lab-info">
        <h4>Deploy Frontend (Nginx)</h4>
        <div class="lab-meta">
          <span class="lab-tag beginner">Iniciante</span>
          <span><i data-lucide="clock" class="icon-svg"></i> ~15min</span>
          <span><i data-lucide="layout" class="icon-svg"></i> Web Server</span>
        </div>
      </div>
      <span class="lab-arrow">▼</span>
    </div>
    <div class="lab-card-body"><div class="lab-card-body-inner">
      <p>Implante um servidor web Nginx com Deployment, Service e Ingress para servir conteúdo estático.</p>
      <h5><i data-lucide="crosshair" class="icon-svg"></i> Objetivo</h5>
      <p>Página Nginx acessível via Ingress em <code>app.seu-dominio.com</code>.</p>
      <div class="lab-step"><span class="step-num">1</span><div class="step-content">Criar namespace para aplicações.<br><code>kubectl create namespace applications</code></div></div>
      <div class="lab-step"><span class="step-num">2</span><div class="step-content">Criar Deployment do Nginx com 2 réplicas e resource limits.<br><code>kubectl apply -f frontend-deployment.yaml</code></div></div>
      <div class="lab-step"><span class="step-num">3</span><div class="step-content">Criar Service ClusterIP para expor o Nginx internamente.<br><code>kubectl apply -f frontend-service.yaml</code></div></div>
      <div class="lab-step"><span class="step-num">4</span><div class="step-content">Criar Ingress com host <code>app.seu-dominio.com</code> e IngressClass traefik.<br><code>kubectl apply -f frontend-ingress.yaml</code></div></div>
      <div class="lab-verify"><strong>✓ Verificação:</strong> <code>kubectl get ingress -n applications</code> mostra ADDRESS. Acessar <code>https://app.seu-dominio.com</code> retorna a página padrão do Nginx.</div>
    </div></div>
  </div>

  <!-- Lab 06 -->
  <div class="lab-card" id="lab-06" onclick="toggleLab(this, event)">
    <div class="lab-card-header">
      <span class="lab-num">06</span>
      <div class="lab-info">
        <h4>Deploy Backend (API)</h4>
        <div class="lab-meta">
          <span class="lab-tag intermediate">Intermediário</span>
          <span><i data-lucide="clock" class="icon-svg"></i> ~20min</span>
          <span><i data-lucide="server" class="icon-svg"></i> API</span>
        </div>
      </div>
      <span class="lab-arrow">▼</span>
    </div>
    <div class="lab-card-body"><div class="lab-card-body-inner">
      <p>Implante uma API backend com ConfigMap, Secret e Health Checks.</p>
      <h5><i data-lucide="crosshair" class="icon-svg"></i> Objetivo</h5>
      <p>Backend respondendo em <code>/api</code> com configurações injetadas via ConfigMap e Secret.</p>
      <div class="lab-step"><span class="step-num">1</span><div class="step-content">Criar ConfigMap com variáveis de ambiente da aplicação.<br><code>kubectl apply -f backend-configmap.yaml</code></div></div>
      <div class="lab-step"><span class="step-num">2</span><div class="step-content">Criar Secret com credenciais sensíveis.<br><code>kubectl apply -f backend-secret.yaml</code></div></div>
      <div class="lab-step"><span class="step-num">3</span><div class="step-content">Criar Deployment com readinessProbe e livenessProbe.<br><code>kubectl apply -f backend-deployment.yaml</code></div></div>
      <div class="lab-step"><span class="step-num">4</span><div class="step-content">Criar Service e Ingress com path <code>/api</code>.<br><code>kubectl apply -f backend-service.yaml</code></div></div>
      <div class="lab-verify"><strong>✓ Verificação:</strong> <code>kubectl describe deploy backend -n applications</code> mostra probes funcionando. <code>curl https://app.seu-dominio.com/api/health</code> retorna 200 OK.</div>
    </div></div>
  </div>

  <!-- Lab 07 -->
  <div class="lab-card" id="lab-07" onclick="toggleLab(this, event)">
    <div class="lab-card-header">
      <span class="lab-num">07</span>
      <div class="lab-info">
        <h4>PostgreSQL com StatefulSet</h4>
        <div class="lab-meta">
          <span class="lab-tag intermediate">Intermediário</span>
          <span><i data-lucide="clock" class="icon-svg"></i> ~25min</span>
          <span><i data-lucide="database" class="icon-svg"></i> Database</span>
        </div>
      </div>
      <span class="lab-arrow">▼</span>
    </div>
    <div class="lab-card-body"><div class="lab-card-body-inner">
      <p>Implante um PostgreSQL com StatefulSet, VolumeClaimTemplate e dados persistentes.</p>
      <h5><i data-lucide="crosshair" class="icon-svg"></i> Objetivo</h5>
      <p>PostgreSQL rodando com dados persistentes que sobrevivem a restarts dos Pods.</p>
      <div class="lab-step"><span class="step-num">1</span><div class="step-content">Criar PVC com 10Gi de armazenamento.<br><code>kubectl apply -f postgres-pvc.yaml</code></div></div>
      <div class="lab-step"><span class="step-num">2</span><div class="step-content">Criar StatefulSet do PostgreSQL com volumeMounts.<br><code>kubectl apply -f postgres-statefulset.yaml</code></div></div>
      <div class="lab-step"><span class="step-num">3</span><div class="step-content">Criar Service headless para acesso estável ao banco.<br><code>kubectl apply -f postgres-service.yaml</code></div></div>
      <div class="lab-step"><span class="step-num">4</span><div class="step-content">Testar conectividade do backend ao PostgreSQL.<br><code>kubectl exec -it deploy/backend -n applications -- sh -c "nc -zv postgres 5432"</code></div></div>
      <div class="lab-verify"><strong>✓ Verificação:</strong> <code>kubectl get pvc -n applications</code> mostra Bound. <code>kubectl get pods -n applications -l app=postgres</code> mostra Running.</div>
    </div></div>
  </div>

  <!-- Lab 08 -->
  <div class="lab-card" id="lab-08" onclick="toggleLab(this, event)">
    <div class="lab-card-header">
      <span class="lab-num">08</span>
      <div class="lab-info">
        <h4>CI/CD com GitHub Actions</h4>
        <div class="lab-meta">
          <span class="lab-tag advanced">Avançado</span>
          <span><i data-lucide="clock" class="icon-svg"></i> ~30min</span>
          <span><i data-lucide="refresh-cw" class="icon-svg"></i> Pipeline</span>
        </div>
      </div>
      <span class="lab-arrow">▼</span>
    </div>
    <div class="lab-card-body"><div class="lab-card-body-inner">
      <p>Configure um pipeline CI/CD com GitHub Actions para build, push e deploy automatizado.</p>
      <h5><i data-lucide="crosshair" class="icon-svg"></i> Objetivo</h5>
      <p>Pipeline que builda imagem Docker, faz push para GHCR e atualiza o manifesto no cluster.</p>
      <div class="lab-step"><span class="step-num">1</span><div class="step-content">Criar repositório GitHub para a aplicação backend.</div></div>
      <div class="lab-step"><span class="step-num">2</span><div class="step-content">Criar arquivo <code>.github/workflows/deploy.yaml</code> com jobs de build, push e deploy.</div></div>
      <div class="lab-step"><span class="step-num">3</span><div class="step-content">Configurar GitHub Secrets: <code>KUBECONFIG</code> (base64 do kubeconfig), <code>GHCR_TOKEN</code>.</div></div>
      <div class="lab-step"><span class="step-num">4</span><div class="step-content">Fazer commit e push para o branch main. Observar o pipeline executar no GitHub Actions.</div></div>
      <div class="lab-verify"><strong>✓ Verificação:</strong> O workflow aparece verde no GitHub. <code>kubectl get deploy backend -n applications</code> mostra a nova versão após o push.</div>
    </div></div>
  </div>

  <!-- Lab 09 -->
  <div class="lab-card" id="lab-09" onclick="toggleLab(this, event)">
    <div class="lab-card-header">
      <span class="lab-num">09</span>
      <div class="lab-info">
        <h4>Observabilidade com Prometheus + Grafana</h4>
        <div class="lab-meta">
          <span class="lab-tag advanced">Avançado</span>
          <span><i data-lucide="clock" class="icon-svg"></i> ~35min</span>
          <span><i data-lucide="bar-chart-3" class="icon-svg"></i> Métricas</span>
        </div>
      </div>
      <span class="lab-arrow">▼</span>
    </div>
    <div class="lab-card-body"><div class="lab-card-body-inner">
      <p>Instale a stack de observabilidade completa: Prometheus para métricas e Grafana para dashboards.</p>
      <h5><i data-lucide="crosshair" class="icon-svg"></i> Objetivo</h5>
      <p>Prometheus coletando métricas do cluster e Grafana com dashboards visuais de saúde.</p>
      <div class="lab-step"><span class="step-num">1</span><div class="step-content">Criar namespace de observabilidade.<br><code>kubectl create namespace monitoring</code></div></div>
      <div class="lab-step"><span class="step-num">2</span><div class="step-content">Instalar kube-prometheus-stack via Helm.<br><code>helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring</code></div></div>
      <div class="lab-step"><span class="step-num">3</span><div class="step-content">Criar Ingress para acessar Grafana em <code>grafana.seu-dominio.com</code>.</div></div>
      <div class="lab-step"><span class="step-num">4</span><div class="step-content">Login no Grafana (admin/prom-operator) e explorar os dashboards Kubernetes pré-configurados.</div></div>
      <div class="lab-verify"><strong>✓ Verificação:</strong> <code>kubectl get pods -n monitoring</code> mostra todos os pods Running. Grafana acessível com dashboards de cluster.</div>
    </div></div>
  </div>

  <!-- Lab 10 -->
  <div class="lab-card" id="lab-10" onclick="toggleLab(this, event)">
    <div class="lab-card-header">
      <span class="lab-num">10</span>
      <div class="lab-info">
        <h4>Troubleshooting Completo</h4>
        <div class="lab-meta">
          <span class="lab-tag advanced">Avançado</span>
          <span><i data-lucide="clock" class="icon-svg"></i> ~20min</span>
          <span><i data-lucide="wrench" class="icon-svg"></i> Diagnóstico</span>
        </div>
      </div>
      <span class="lab-arrow">▼</span>
    </div>
    <div class="lab-card-body"><div class="lab-card-body-inner">
      <p>Pratique cenários reais de troubleshooting: Pods em CrashLoop, Services sem endpoints, Ingress quebrado.</p>
      <h5><i data-lucide="crosshair" class="icon-svg"></i> Objetivo</h5>
      <p>Diagnosticar e corrigir 3 cenários reais de falha usando metodologia SRE.</p>
      <div class="lab-step"><span class="step-num">1</span><div class="step-content"><strong>Cenário 1:</strong> Pod em CrashLoopBackOff. Aplicar o manifesto quebrado, investigar com <code>kubectl logs</code> e corrigir.</div></div>
      <div class="lab-step"><span class="step-num">2</span><div class="step-content"><strong>Cenário 2:</strong> Service aponta para Pods errados. Verificar labels com <code>kubectl get endpoints</code> e corrigir o selector.</div></div>
      <div class="lab-step"><span class="step-num">3</span><div class="step-content"><strong>Cenário 3:</strong> Ingress retorna 404. Verificar <code>kubectl describe ingress</code>, conferir host, path e serviceName.</div></div>
      <div class="lab-step"><span class="step-num">4</span><div class="step-content">Documentar cada cenário: causa, sintoma, diagnóstico e solução encontrada.</div></div>
      <div class="lab-verify"><strong>✓ Verificação:</strong> Todos os 3 cenários resolvidos. Pods rodando, endpoints corretos, Ingress respondendo corretamente.</div>
    </div></div>
  </div>

</section>
"""

anchor = '</div><!-- /content -->'
idx = content.find(anchor)
if idx == -1:
    print("ERROR: Could not find anchor '</div><!-- /content -->'")
else:
    content = content[:idx] + labs_html + "\n" + content[idx:]
    print(f"Labs section inserted at position {idx}")

# ============================================
# 2. INSERT QUIZ: After Fundamentos section
# ============================================
quiz_fundamentos = """
<!-- Quiz: Fundamentos -->
<div class="quiz-box" id="quiz-fundamentos">
  <h4><i data-lucide="brain" class="icon-svg lg"></i> Quiz — Fundamentos</h4>
  <div class="quiz-subtitle">Teste seus conhecimentos sobre containers, imagens e Kubernetes</div>

  <div class="quiz-question" data-correct="1">
    <div class="q-text">1. O que diferencia um container de uma máquina virtual?</div>
    <label class="quiz-option"><input type="radio" name="q-f1" value="0" onchange="checkQuiz(this)"> Container tem seu próprio kernel completo</label>
    <label class="quiz-option"><input type="radio" name="q-f1" value="1" onchange="checkQuiz(this)"> Container compartilha o kernel do host, mas isola processos</label>
    <label class="quiz-option"><input type="radio" name="q-f1" value="2" onchange="checkQuiz(this)"> Container é mais pesado que VM</label>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-question" data-correct="2">
    <div class="q-text">2. Por que NÃO se deve usar a tag <code>latest</code> em produção?</div>
    <label class="quiz-option"><input type="radio" name="q-f2" value="0" onchange="checkQuiz(this)"> É muito grande em tamanho</label>
    <label class="quiz-option"><input type="radio" name="q-f2" value="1" onchange="checkQuiz(this)"> Não é suportada pelo Kubernetes</label>
    <label class="quiz-option"><input type="radio" name="q-f2" value="2" onchange="checkQuiz(this)"> Não permite rollback previsível e reproduzível</label>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-question" data-correct="0">
    <div class="q-text">3. O que o Kubernetes faz de principal?</div>
    <label class="quiz-option"><input type="radio" name="q-f3" value="0" onchange="checkQuiz(this)"> Mantém o estado desejado declarado no manifesto</label>
    <label class="quiz-option"><input type="radio" name="q-f3" value="1" onchange="checkQuiz(this)"> Compila e faz build de imagens Docker</label>
    <label class="quiz-option"><input type="radio" name="q-f3" value="2" onchange="checkQuiz(this)"> Gerencia banco de dados</label>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-score" id="score-fundamentos"></div>
  <button class="quiz-btn" onclick="showScore('fundamentos', 3)">Ver Resultado</button>
</div>
"""

anchor_quiz = """</section>

<!-- ==================== O QUE É K8S ==================== -->"""
content = content.replace(anchor_quiz, anchor_quiz[0:10].replace("\n", "\n") + quiz_fundamentos + anchor_quiz[10:], 1)

# ============================================
# 3. INSERT QUIZ: After kubectl section
# ============================================
quiz_kubectl = """
<!-- Quiz: kubectl -->
<div class="quiz-box" id="quiz-kubectl">
  <h4><i data-lucide="brain" class="icon-svg lg"></i> Quiz — kubectl e Operação</h4>
  <div class="quiz-subtitle">Comandos essenciais de diagnóstico e rollout</div>

  <div class="quiz-question" data-correct="1">
    <div class="q-text">1. Qual comando mostra os eventos mais recentes do cluster?</div>
    <label class="quiz-option"><input type="radio" name="q-k1" value="0" onchange="checkQuiz(this)"> kubectl get events</label>
    <label class="quiz-option"><input type="radio" name="q-k1" value="1" onchange="checkQuiz(this)"> kubectl get events -A --sort-by=.lastTimestamp</label>
    <label class="quiz-option"><input type="radio" name="q-k1" value="2" onchange="checkQuiz(this)"> kubectl logs -A</label>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-question" data-correct="2">
    <div class="q-text">2. Para fazer rollback de um deployment, o comando correto é:</div>
    <label class="quiz-option"><input type="radio" name="q-k2" value="0" onchange="checkQuiz(this)"> kubectl rollback deployment/NOME</label>
    <label class="quiz-option"><input type="radio" name="q-k2" value="1" onchange="checkQuiz(this)"> kubectl undo deploy/NOME</label>
    <label class="quiz-option"><input type="radio" name="q-k2" value="2" onchange="checkQuiz(this)"> kubectl rollout undo deployment/NOME</label>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-question" data-correct="1">
    <div class="q-text">3. Qual a diferença entre <code>kubectl apply</code> e <code>kubectl create</code>?</div>
    <label class="quiz-option"><input type="radio" name="q-k3" value="0" onchange="checkQuiz(this)"> São equivalentes</label>
    <label class="quiz-option"><input type="radio" name="q-k3" value="1" onchange="checkQuiz(this)"> Apply é declarativo e idempotente; create falha se já existir</label>
    <label class="quiz-option"><input type="radio" name="q-k3" value="2" onchange="checkQuiz(this)"> Create é mais seguro que apply</label>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-score" id="score-kubectl"></div>
  <button class="quiz-btn" onclick="showScore('kubectl', 3)">Ver Resultado</button>
</div>
"""

# Insert quiz after the kubectl section (before the services section)
anchor_kubectl_quiz = """</section>

<!-- ==================== SERVICES ==================== -->"""
# Find the LAST occurrence of this pattern (the kubectl section is before services)
pos = content.rfind(anchor_kubectl_quiz)
if pos != -1:
    content = content[:pos] + anchor_kubectl_quiz[:10] + quiz_kubectl + anchor_kubectl_quiz[10:] + content[pos + len(anchor_kubectl_quiz):]
    print("kubectl quiz inserted")

# ============================================
# 4. INSERT QUIZ: After Storage section
# ============================================
quiz_storage = """
<!-- Quiz: Storage -->
<div class="quiz-box" id="quiz-storage">
  <h4><i data-lucide="brain" class="icon-svg lg"></i> Quiz — Storage e Volumes</h4>
  <div class="quiz-subtitle">Volumes, PVCs, StorageClasses e Longhorn</div>

  <div class="quiz-question" data-correct="2">
    <div class="q-text">1. Por que containers precisam de volumes persistentes?</div>
    <label class="quiz-option"><input type="radio" name="q-s1" value="0" onchange="checkQuiz(this)"> Para aumentar a performance</label>
    <label class="quiz-option"><input type="radio" name="q-s1" value="1" onchange="checkQuiz(this)"> Para fazer cache de imagens</label>
    <label class="quiz-option"><input type="radio" name="q-s1" value="2" onchange="checkQuiz(this)"> Containers são efêmeros — dados dentro dele são perdidos no restart</label>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-question" data-correct="0">
    <div class="q-text">2. Qual access mode permite que apenas um node monte o volume para escrita?</div>
    <label class="quiz-option"><input type="radio" name="q-s2" value="0" onchange="checkQuiz(this)"> ReadWriteOnce</label>
    <label class="quiz-option"><input type="radio" name="q-s2" value="1" onchange="checkQuiz(this)"> ReadWriteMany</label>
    <label class="quiz-option"><input type="radio" name="q-s2" value="2" onchange="checkQuiz(this)"> ReadOnlyMany</label>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-score" id="score-storage"></div>
  <button class="quiz-btn" onclick="showScore('storage', 2)">Ver Resultado</button>
</div>
"""

anchor_storage_quiz = """</section>

<!-- ==================== LONGHORN ==================== -->"""
pos = content.find(anchor_storage_quiz)
if pos != -1:
    content = content[:pos] + anchor_storage_quiz[:10] + quiz_storage + anchor_storage_quiz[10:] + content[pos + len(anchor_storage_quiz):]
    print("Storage quiz inserted")

# ============================================
# 5. INSERT QUIZ: After CI/CD section
# ============================================
quiz_cicd = """
<!-- Quiz: CI/CD -->
<div class="quiz-box" id="quiz-cicd">
  <h4><i data-lucide="brain" class="icon-svg lg"></i> Quiz — CI/CD e GitOps</h4>
  <div class="quiz-subtitle">Pipelines, GitHub Actions e deploy contínuo</div>

  <div class="quiz-question" data-correct="1">
    <div class="q-text">1. No GitOps, quem dispara a atualização do cluster?</div>
    <label class="quiz-option"><input type="radio" name="q-c1" value="0" onchange="checkQuiz(this)"> O desenvolvedor manualmente</label>
    <label class="quiz-option"><input type="radio" name="q-c1" value="1" onchange="checkQuiz(this)"> O Argo CD/Flux detecta mudanças no repositório Git</label>
    <label class="quiz-option"><input type="radio" name="q-c1" value="2" onchange="checkQuiz(this)"> O GitHub Actions diretamente no cluster</label>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-question" data-correct="2">
    <div class="q-text">2. Qual ferramenta é usada para criar infraestrutura como código (VMs, redes, etc)?</div>
    <label class="quiz-option"><input type="radio" name="q-c2" value="0" onchange="checkQuiz(this)"> Helm</label>
    <label class="quiz-option"><input type="radio" name="q-c2" value="1" onchange="checkQuiz(this)"> Ansible</label>
    <label class="quiz-option"><input type="radio" name="q-c2" value="2" onchange="checkQuiz(this)"> Terraform</label>
    <div class="quiz-feedback"></div>
  </div>

  <div class="quiz-score" id="score-cicd"></div>
  <button class="quiz-btn" onclick="showScore('cicd', 2)">Ver Resultado</button>
</div>
"""

anchor_cicd_quiz = """</section>

<!-- ==================== OBSERVABILIDADE ==================== -->"""
pos = content.find(anchor_cicd_quiz)
if pos != -1:
    content = content[:pos] + anchor_cicd_quiz[:10] + quiz_cicd + anchor_cicd_quiz[10:] + content[pos + len(anchor_cicd_quiz):]
    print("CI/CD quiz inserted")

# ============================================
# 6. INSERT JAVASCRIPT for quiz and lab toggle
# ============================================
# Find the last script section and add quiz/lab JS before </script>
js_addition = """
// ===== LAB TOGGLE =====
function toggleLab(el, e) {
  if (e.target.closest('a')) return;
  const body = el.querySelector('.lab-card-body');
  const isOpen = el.classList.contains('open');
  // Close all other labs
  document.querySelectorAll('.lab-card.open').forEach(card => {
    if (card !== el) {
      card.classList.remove('open');
      card.querySelector('.lab-card-body').style.maxHeight = '0';
    }
  });
  if (isOpen) {
    el.classList.remove('open');
    body.style.maxHeight = '0';
  } else {
    el.classList.add('open');
    body.style.maxHeight = body.scrollHeight + 'px';
  }
}

// ===== QUIZ SYSTEM =====
function checkQuiz(radio) {
  const question = radio.closest('.quiz-question');
  const correct = parseInt(question.dataset.correct);
  const selected = parseInt(radio.value);
  const options = question.querySelectorAll('.quiz-option');
  const feedback = question.querySelector('.quiz-feedback');

  options.forEach(opt => {
    opt.classList.add('disabled');
    opt.querySelector('input').disabled = true;
  });

  if (selected === correct) {
    radio.closest('.quiz-option').classList.add('correct');
    feedback.className = 'quiz-feedback show correct-fb';
    feedback.textContent = '✓ Correto! Excelente!';
  } else {
    radio.closest('.quiz-option').classList.add('incorrect');
    options[correct].classList.add('correct');
    feedback.className = 'quiz-feedback show incorrect-fb';
    feedback.textContent = '✗ Incorreto. A resposta correta está destacada em verde.';
  }
}

function showScore(quizId, totalQuestions) {
  const quiz = document.getElementById('quiz-' + quizId);
  const scoreEl = document.getElementById('score-' + quizId);
  const questions = quiz.querySelectorAll('.quiz-question');
  let correct = 0;
  let answered = 0;

  questions.forEach(q => {
    const selected = q.querySelector('input:checked');
    if (selected) {
      answered++;
      if (parseInt(selected.value) === parseInt(q.dataset.correct)) {
        correct++;
      }
    }
  });

  if (answered < totalQuestions) {
    scoreEl.className = 'quiz-score show';
    scoreEl.style.background = 'var(--orange-subtle)';
    scoreEl.style.color = 'var(--orange)';
    scoreEl.style.borderColor = 'rgba(210,153,34,0.3)';
    scoreEl.textContent = 'Responda todas as perguntas antes de ver o resultado (' + answered + '/' + totalQuestions + ')';
    return;
  }

  const pct = Math.round((correct / totalQuestions) * 100);
  scoreEl.className = 'quiz-score show';
  if (pct === 100) {
    scoreEl.style.background = 'var(--green-subtle)';
    scoreEl.style.color = 'var(--green)';
    scoreEl.style.borderColor = 'rgba(63,185,80,0.3)';
    scoreEl.textContent = '🎉 Perfeito! ' + correct + '/' + totalQuestions + ' — Você dominou este módulo!';
  } else if (pct >= 60) {
    scoreEl.style.background = 'var(--accent-subtle)';
    scoreEl.style.color = 'var(--accent)';
    scoreEl.style.borderColor = 'rgba(88,166,255,0.3)';
    scoreEl.textContent = '👍 Bom! ' + correct + '/' + totalQuestions + ' (' + pct + '%) — Revise os tópicos errados.';
  } else {
    scoreEl.style.background = 'var(--red-subtle)';
    scoreEl.style.color = 'var(--red)';
    scoreEl.style.borderColor = 'rgba(248,81,73,0.3)';
    scoreEl.textContent = '📚 Continue estudando! ' + correct + '/' + totalQuestions + ' (' + pct + '%) — Revise a seção e tente novamente.';
  }
}
"""

# Insert JS before the last </script>
last_script_pos = content.rfind('</script>')
if last_script_pos != -1:
    content = content[:last_script_pos] + js_addition + "\n" + content[last_script_pos:]
    print("JavaScript for quiz and labs inserted")

# ============================================
# 7. UPDATE SEARCH DATA
# ============================================
new_search_items = """  {t:"Laboratórios",s:"Prática",h:"#labs"},
  {t:"Lab K3s",s:"Prática",h:"#lab-01"},
  {t:"Lab Helm",s:"Prática",h:"#lab-02"},
  {t:"Lab Traefik",s:"Prática",h:"#lab-03"},
  {t:"Lab Cloudflare",s:"Prática",h:"#lab-04"},
  {t:"Lab Frontend",s:"Prática",h:"#lab-05"},
  {t:"Lab Backend",s:"Prática",h:"#lab-06"},
  {t:"Lab PostgreSQL",s:"Prática",h:"#lab-07"},
  {t:"Lab CI/CD",s:"Prática",h:"#lab-08"},
  {t:"Lab Observabilidade",s:"Prática",h:"#lab-09"},
  {t:"Lab Troubleshooting",s:"Prática",h:"#lab-10"},
  {t:"Quiz",s:"Avaliação",h:"#labs"},
"""

anchor_search = "const searchData = ["
if anchor_search in content:
    content = content.replace(anchor_search, anchor_search + "\n" + new_search_items, 1)
    print("Search data updated")

# ============================================
# SAVE
# ============================================
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nDone! Final file size: {len(content):,} characters")
print("All sections inserted: labs, quizzes, JavaScript, search data")
