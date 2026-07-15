// ===== MIGRATION =====
if (localStorage.getItem('k8s-quiz-progress') && !localStorage.getItem('k8s-progress')) {
  localStorage.setItem('k8s-progress', localStorage.getItem('k8s-quiz-progress'));
  localStorage.removeItem('k8s-quiz-progress');
}
try {
  const _p = JSON.parse(localStorage.getItem('k8s-progress') || '{}');
  if (_p.quizzes) {
    Object.keys(_p.quizzes).forEach(function(qid) {
      let q = _p.quizzes[qid];
      Object.keys(q).forEach(function(k) {
        if (typeof q[k] === 'boolean') delete q[k];
      });
    });
    localStorage.setItem('k8s-progress', JSON.stringify(_p));
  }
} catch(e) {}

// ===== CONSTANTS =====
const QUIZ_IDS = ['fundamentos','arquitetura','kubectl','services','ingress','storage','seguranca','fullstack','cicd','observabilidade','troubleshooting'];
const QUIZ_NAMES = {
  fundamentos: 'Fundamentos', arquitetura: 'Arquitetura', kubectl: 'kubectl',
  services: 'Services', ingress: 'Ingress', storage: 'Storage',
  seguranca: 'Seguran\u00e7a', fullstack: 'Fullstack', cicd: 'CI/CD',
  observabilidade: 'Observabilidade', troubleshooting: 'Troubleshooting'
};
const TOTAL_QUESTIONS = {fundamentos:3, arquitetura:3, kubectl:3, services:3, ingress:3, storage:2, seguranca:3, fullstack:3, cicd:2, observabilidade:3, troubleshooting:3};
const LAB_IDS = ['lab-01','lab-02','lab-03','lab-04','lab-05','lab-06','lab-07','lab-08','lab-09','lab-10'];
const LAB_NAMES = {
  'lab-01': 'K3s Server + Worker', 'lab-02': 'Helm e Reposit\u00f3rios',
  'lab-03': 'Traefik via Helm', 'lab-04': 'Cloudflare TLS',
  'lab-05': 'Deploy Frontend', 'lab-06': 'Deploy Backend',
  'lab-07': 'PostgreSQL', 'lab-08': 'CI/CD GitHub Actions',
  'lab-09': 'Observabilidade', 'lab-10': 'Troubleshooting',
};

// ===== PERSISTENCE =====
function getProgress() {
  try { return JSON.parse(localStorage.getItem('k8s-progress') || '{}'); } catch(e) { return {}; }
}
function saveProgress(progress) {
  localStorage.setItem('k8s-progress', JSON.stringify(progress));
}

// ===== LAB TOGGLE =====
function toggleLab(el, e) {
  if (e.target.closest('a') || e.target.closest('.lab-check')) return;
  const body = el.querySelector('.lab-card-body');
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.lab-card.open').forEach(card => {
    if (card !== el) { card.classList.remove('open'); card.querySelector('.lab-card-body').style.maxHeight = '0'; const hdr = card.querySelector('.lab-card-header'); if (hdr) hdr.setAttribute('aria-expanded', 'false'); }
  });
  if (isOpen) { el.classList.remove('open'); body.style.maxHeight = '0'; }
  else { el.classList.add('open'); body.style.maxHeight = body.scrollHeight + 'px'; }
  const header = el.querySelector('.lab-card-header');
  if (header) header.setAttribute('aria-expanded', String(!isOpen));
}

// ===== LAB COMPLETION =====
function toggleLabComplete(labId) {
  const cb = document.getElementById('cb-' + labId);
  const label = document.getElementById('check-' + labId);
  const progress = getProgress();
  if (!progress.labs) progress.labs = {};
  if (cb.checked) { progress.labs[labId] = true; label.classList.add('done'); }
  else { delete progress.labs[labId]; label.classList.remove('done'); }
  saveProgress(progress);
  updateProgressUI();
  checkAchievements();
}

// ===== QUIZ SYSTEM =====
function checkQuiz(radio) {
  const question = radio.closest('.quiz-question');
  const correct = parseInt(question.dataset.correct);
  const selected = parseInt(radio.value);
  const options = question.querySelectorAll('.quiz-option');
  const feedback = question.querySelector('.quiz-feedback');
  options.forEach(opt => { opt.classList.add('disabled'); opt.querySelector('input').disabled = true; });
  const quizBox = radio.closest('.quiz-box');
  const quizId = quizBox.id.replace('quiz-', '');
  const isCorrect = selected === correct;
  if (isCorrect) {
    radio.closest('.quiz-option').classList.add('correct');
    feedback.className = 'quiz-feedback show correct-fb';
    feedback.textContent = '\u2713 Correto! Excelente!';
  } else {
    radio.closest('.quiz-option').classList.add('incorrect');
    options[correct].classList.add('correct');
    feedback.className = 'quiz-feedback show incorrect-fb';
    feedback.textContent = '\u2717 Incorreto. A resposta correta est\u00e1 destacada em verde.';
  }
  const progress = getProgress();
  if (!progress.quizzes) progress.quizzes = {};
  const qIndex = Array.from(quizBox.querySelectorAll('.quiz-question')).indexOf(question);
  if (!progress.quizzes[quizId]) progress.quizzes[quizId] = {};
  progress.quizzes[quizId]['q' + qIndex] = { selected: selected, correct: isCorrect };
  saveProgress(progress);
}

function showScore(quizId, totalQuestions) {
  const quiz = document.getElementById('quiz-' + quizId);
  const scoreEl = document.getElementById('score-' + quizId);
  const questions = quiz.querySelectorAll('.quiz-question');
  let correct = 0, answered = 0;
  questions.forEach(q => {
    const selected = q.querySelector('input:checked');
    if (selected) { answered++; if (parseInt(selected.value) === parseInt(q.dataset.correct)) correct++; }
  });
  if (answered < totalQuestions) {
    scoreEl.className = 'quiz-score show';
    scoreEl.style.background = 'var(--orange-subtle)'; scoreEl.style.color = 'var(--orange)';
    scoreEl.style.borderColor = 'rgba(210,153,34,0.3)';
    scoreEl.textContent = 'Responda todas as perguntas antes de ver o resultado (' + answered + '/' + totalQuestions + ')';
    return;
  }
  const pct = Math.round((correct / totalQuestions) * 100);
  const progress = getProgress();
  if (!progress.quizzes) progress.quizzes = {};
  const existing = progress.quizzes[quizId] || {};
  const bestPct = existing.bestPct || 0;
  const isNewBest = pct > bestPct;

  scoreEl.className = 'quiz-score show';
  if (pct === 100) {
    scoreEl.style.background = 'var(--green-subtle)'; scoreEl.style.color = 'var(--green)';
    scoreEl.style.borderColor = 'rgba(63,185,80,0.3)';
    scoreEl.textContent = '\ud83c\udf89 Perfeito! ' + correct + '/' + totalQuestions + ' \u2014 Voc\u00ea dominou este m\u00f3dulo!';
  } else if (pct >= 60) {
    scoreEl.style.background = 'var(--accent-subtle)'; scoreEl.style.color = 'var(--accent)';
    scoreEl.style.borderColor = 'rgba(88,166,255,0.3)';
    scoreEl.textContent = (isNewBest ? '\ud83d\udc4d Novo recorde! ' : '\ud83d\udc4d Bom! ') + correct + '/' + totalQuestions + ' (' + pct + '%)';
  } else {
    scoreEl.style.background = 'var(--red-subtle)'; scoreEl.style.color = 'var(--red)';
    scoreEl.style.borderColor = 'rgba(248,81,73,0.3)';
    scoreEl.textContent = '\ud83d\udcda Continue estudando! ' + correct + '/' + totalQuestions + ' (' + pct + '%)';
  }

  progress.quizzes[quizId] = { ...existing, score: correct, total: totalQuestions, pct: pct, completed: true, bestPct: Math.max(pct, bestPct), attempts: (existing.attempts || 0) + 1 };
  saveProgress(progress);
  updateProgressUI();
  checkAchievements();
  showRetryButton(quizId);
  showShareButton(quizId);
}

// ===== QUIZ RETRY =====
function showRetryButton(quizId) {
  const quiz = document.getElementById('quiz-' + quizId);
  if (!quiz) return;
  let retryBtn = quiz.querySelector('.quiz-retry');
  if (!retryBtn) {
    retryBtn = document.createElement('button');
    retryBtn.className = 'quiz-retry show';
    retryBtn.innerHTML = '\ud83d\udd04 Tentar novamente';
    retryBtn.onclick = function() { retryQuiz(quizId); };
    const scoreEl = document.getElementById('score-' + quizId);
    if (scoreEl) scoreEl.parentNode.insertBefore(retryBtn, scoreEl.nextSibling);
  } else {
    retryBtn.classList.add('show');
  }
}

function showShareButton(quizId) {
  const quiz = document.getElementById('quiz-' + quizId);
  if (!quiz) return;
  let existing = quiz.querySelector('.quiz-share-btn');
  if (!existing) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'quiz-share-btn';
    shareBtn.innerHTML = '\ud83d\udce4 Compartilhar badge';
    shareBtn.onclick = function() { shareQuizBadge(quizId); };
    // Insert after the retry button if it exists, otherwise after the score
    const retryBtn = quiz.querySelector('.quiz-retry');
    const scoreEl = quiz.querySelector('.quiz-score');
    const refEl = retryBtn || scoreEl;
    if (refEl && refEl.nextSibling) {
      refEl.parentNode.insertBefore(shareBtn, refEl.nextSibling);
    } else if (refEl) {
      refEl.parentNode.appendChild(shareBtn);
    } else {
      quiz.appendChild(shareBtn);
    }
  }
  existing = quiz.querySelector('.quiz-share-btn');
  if (existing) existing.classList.add('show');
}

function retryQuiz(quizId) {
  const quiz = document.getElementById('quiz-' + quizId);
  if (!quiz) return;
  const progress = getProgress();
  const existing = (progress.quizzes && progress.quizzes[quizId]) || {};

  // Clear radio selections, classes, feedback
  quiz.querySelectorAll('.quiz-option').forEach(opt => {
    opt.classList.remove('disabled', 'correct', 'incorrect');
    opt.querySelector('input').disabled = false;
    opt.querySelector('input').checked = false;
  });
  quiz.querySelectorAll('.quiz-feedback').forEach(fb => fb.className = 'quiz-feedback');
  const scoreEl = document.getElementById('score-' + quizId);
  if (scoreEl) { scoreEl.className = 'quiz-score'; scoreEl.textContent = ''; scoreEl.removeAttribute('style'); }
  const retryBtn = quiz.querySelector('.quiz-retry');
  if (retryBtn) retryBtn.classList.remove('show');

  // Keep best score, clear current attempt data
  if (progress.quizzes) {
    progress.quizzes[quizId] = { bestPct: existing.bestPct || 0, attempts: existing.attempts || 0 };
    saveProgress(progress);
  }
  updateProgressUI();
}

// ===== PROGRESS TRACKER UI =====
function updateProgressUI() {
  const progress = getProgress();
  if (!progress.quizzes) progress.quizzes = {};
  if (!progress.labs) progress.labs = {};

  let quizCompleted = 0;
  const quizListEl = document.getElementById('progressQuizList');
  let quizHtml = '';
  QUIZ_IDS.forEach(id => {
    const data = progress.quizzes[id];
    const isComplete = data && data.completed;
    if (isComplete) quizCompleted++;
    const iconClass = isComplete ? 'done' : 'pending';
    const icon = isComplete ? (data.pct === 100 ? '\ud83c\udf89' : (data.pct >= 60 ? '\u2713' : '\u2717')) : '\u25cb';
    let scoreText = isComplete && data ? data.score + '/' + data.total + ' (' + data.pct + '%)' : 'N\u00e3o respondido';
    if (data && data.attempts && data.attempts > 1) scoreText += ' | Tentativas: ' + data.attempts;
    if (data && data.bestPct > 0 && (!isComplete || data.pct < data.bestPct)) {
      scoreText += ' | Melhor: ' + data.bestPct + '%';
    }
    const scoreClass = isComplete ? (data.pct === 100 ? 'perfect' : (data.pct >= 60 ? 'good' : 'needs-work')) : '';
    quizHtml += '<div class="progress-quiz-item"><span class="pi-icon ' + iconClass + '">' + icon + '</span><div class="pi-info"><div class="pi-name">' + QUIZ_NAMES[id] + '</div><div class="pi-score ' + scoreClass + '">' + scoreText + '</div></div></div>';
  });
  if (quizListEl) quizListEl.innerHTML = quizHtml;

  let labCompleted = 0;
  const labListEl = document.getElementById('progressLabList');
  let labHtml = '';
  LAB_IDS.forEach(id => {
    const isDone = progress.labs[id] === true;
    if (isDone) labCompleted++;
    const iconClass = isDone ? 'done' : 'pending';
    const icon = isDone ? '\u2713' : '\u25cb';
    const statusText = isDone ? 'Conclu\u00eddo' : 'Pendente';
    const statusClass = isDone ? 'done' : '';
    labHtml += '<div class="progress-lab-item"><span class="pl-icon ' + iconClass + '">' + icon + '</span><div class="pl-info"><div class="pl-name">' + LAB_NAMES[id] + '</div><div class="pl-status ' + statusClass + '">' + statusText + '</div></div></div>';
  });
  if (labListEl) labListEl.innerHTML = labHtml;

  const totalItems = QUIZ_IDS.length + LAB_IDS.length;
  const totalDone = quizCompleted + labCompleted;
  const overallPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;
  const pctEl = document.getElementById('progressPct');
  const barEl = document.getElementById('progressBarFill');
  if (pctEl) pctEl.textContent = overallPct + '% (' + totalDone + '/' + totalItems + ')';
  if (barEl) barEl.style.width = overallPct + '%';
}

// ===== CHECKLISTS =====
function toggleChecklist(el) {
  const item = el.closest('.checklist-item');
  if (!item) return;
  item.classList.toggle('checked');
  // Persist state
  try {
    const key = 'k8s-checklists';
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    const id = item.getAttribute('data-id') || item.textContent.trim().substring(0, 40);
    saved[id] = item.classList.contains('checked');
    localStorage.setItem(key, JSON.stringify(saved));
  } catch(e) { /* silently ignore */ }
}

// ===== LABS RENDER =====
const labData = [
  {num:"01",title:"Instalar K3s Server e Worker", diffClass:"beginner", diffLabel:"Iniciante",
   meta:[{icon:"clock",text:"~30min"},{icon:"server",text:"2 VMs"}],
   desc:"Monte um cluster K3s com um node server (control plane) e um worker. Ao final, voce tera um cluster funcional pronto para receber aplicações.",
   objective:"Criar um cluster K3s com 2 nodes e validar que todos os componentes estao saudaveis.",
   steps:[
     {num:"1",content:"Preparar ambientes\natualizar sistema e configurar hostnames unicos em cada VM.\nsudo apt update && sudo apt upgrade -y"},
     {num:"2",content:"Instalar K3s no server\ncom Traefik e ServiceLB desabilitados.\ncurl -sfL https://get.k3s.io | INSTALL_K3S_EXEC=\"server --disable traefik --disable servicelb\" sh -"},
     {num:"3",content:"Obter o token do cluster.\nsudo cat /var/lib/rancher/k3s/server/node-token"},
     {num:"4",content:"Configurar kubectl sem sudo no server.\nmkdir -p ~/.kube && sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config && sudo chown $USER:$USER ~/.kube/config"},
     {num:"5",content:"Instalar o worker\nusando o token e o IP do server.\ncurl -sfL https://get.k3s.io K3S_URL=https://IP_SERVER:6443 K3S_TOKEN=TOKEN INSTALL_K3S_EXEC=\"agent --node-name worker01\" sh -"}
   ],
   verify:"kubectl get nodes -o wide deve mostrar 2 nodes com STATUS Ready."},
  {num:"02",title:"Helm e Repositorios", diffClass:"beginner", diffLabel:"Iniciante",
   meta:[{icon:"clock",text:"~15min"},{icon:"package",text:"1 ferramenta"}],
   desc:"Instale o Helm 3, adicione repositorios essenciais e aprenda a gerenciar chart repositories.",
   objective:"Helm funcional com repositorios de Traefik, NGINX e Prometheus adicionados.",
   steps:[
     {num:"1",content:"Instalar o Helm 3 via script oficial.\ncurl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash"},
     {num:"2",content:"Adicionar repositorios de charts populares.\nhelm repo add traefik https://traefik.github.io/charts\nhelm repo add prometheus-community https://prometheus-community.github.io/helm-charts\nhelm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx"},
     {num:"3",content:"Atualizar e listar repositorios.\nhelm repo update && helm search repo traefik"},
     {num:"4",content:"Listar releases instaladas (deve estar vazio).\nhelm list -A"}
   ],
   verify:"helm version deve mostrar v3.x. helm repo list deve listar os 3 repositorios adicionados."},
  {num:"03",title:"Traefik via Helm", diffClass:"intermediate", diffLabel:"Intermediario",
   meta:[{icon:"clock",text:"~20min"},{icon:"shield",text:"Ingress"}],
   desc:"Implante o Traefik como Ingress Controller no cluster K3s usando Helm.",
   objective:"Traefik rodando, escutando nas portas 80/443 e pronto para rotear trafego.",
   steps:[
     {num:"1",content:"Criar namespace e instalar CRDs do Traefik.\nkubectl create namespace traefik\nkubectl apply -f https://raw.githubusercontent.com/traefik/traefik/v3.0/docs/content/reference/static/crds.yaml"},
     {num:"2",content:"Preparar values.yaml.\ncat > values.yaml << 'EOF'\ningressClass:\n  enabled: true\n  name: traefik\nservice:\n  type: ClusterIP\nports:\n  web:\n    port: 80\n  websecure:\n    port: 443\nEOF"},
     {num:"3",content:"Instalar Traefik via Helm.\nhelm repo add traefik https://traefik.github.io/charts\nhelm install traefik traefik/traefik -n traefik -f values.yaml"},
     {num:"4",content:"Verificar instalacao.\nkubectl get pods -n traefik\nkubectl get svc -n traefik"}
   ],
   verify:"kubectl get pods -n traefik deve mostrar o pod do Traefik como Running."},
  {num:"04",title:"Cloudflare Origin Certificate + TLSStore", diffClass:"intermediate", diffLabel:"Intermediario",
   meta:[{icon:"clock",text:"~25min"},{icon:"lock",text:"TLS"}],
   desc:"Configure certificados TLS da Cloudflare para que o Traefik sirva HTTPS com validacao completa.",
   objective:"Traefik servindo HTTPS com certificado Cloudflare valido e redirect HTTP para HTTPS.",
   steps:[
     {num:"1",content:"Gerar certificado Origin CA no dashboard da Cloudflare.\nSSL/TLS > Origin Server > Create Certificate"},
     {num:"2",content:"Criar Secret TLS no Kubernetes.\nkubectl create secret tls cloudflare-origin -n traefik --cert=origin-cert.pem --key=origin-key.pem"},
     {num:"3",content:"Aplicar TLSStore.\ncat > tlsstore.yaml\nkubectl apply -f tlsstore.yaml"},
     {num:"4",content:"Configurar modo Full (Strict) no Cloudflare.\nSSL/TLS > Overview > Full (Strict)"}
   ],
   verify:"curl -vk https://app.seu-dominio.com deve mostrar o certificado Cloudflare e status 200."},
  {num:"05",title:"Deploy Frontend (Nginx)", diffClass:"intermediate", diffLabel:"Intermediario",
   meta:[{icon:"clock",text:"~20min"},{icon:"globe",text:"Frontend"}],
   desc:"Publique uma pagina estatica Nginx no cluster e acesse via Ingress.",
   objective:"Pagina Nginx acessivel via Ingress (app.seu-dominio.com).",
   steps:[
     {num:"1",content:"Criar namespace applications.\nkubectl create namespace applications"},
     {num:"2",content:"Criar Deployment do Nginx.\nkubectl create deployment nginx --image=nginx:alpine -n applications\nkubectl scale deployment nginx --replicas=2 -n applications"},
     {num:"3",content:"Criar Service do tipo ClusterIP.\nkubectl expose deployment nginx --port=80 -n applications"},
     {num:"4",content:"Criar Ingress.\ncat > ingress-frontend.yaml\nkubectl apply -f ingress-frontend.yaml"}
   ],
   verify:"curl -H 'Host: app.seu-dominio.com' http://... deve retornar a pagina padrao do Nginx."},
  {num:"06",title:"Deploy Backend (API)", diffClass:"intermediate", diffLabel:"Intermediario",
   meta:[{icon:"clock",text:"~30min"},{icon:"terminal",text:"API"}],
   desc:"Implante uma API com ConfigMap, Secret, probes de saude e Ingress com prefixo /api.",
   objective:"API respondendo em /api com configurações injetadas via ConfigMap e Secret.",
   steps:[
     {num:"1",content:"Criar ConfigMap e Secret.\nkubectl create configmap api-config --from-literal=DB_HOST=postgres -n applications\nkubectl create secret generic db-secret --from-literal=DB_PASSWORD=supersecret -n applications"},
     {num:"2",content:"Criar Deployment com probes.\nkubectl apply -f deployment-api.yaml -n applications"},
     {num:"3",content:"Expor a API via Service e Ingress.\nkubectl expose deployment api --port=3000 -n applications"},
     {num:"4",content:"Testar a API.\nkubectl exec -it deploy/nginx -n applications -- curl http://api:3000/api/health"}
   ],
   verify:"curl http://.../api/health deve retornar HTTP 200 com status da API."},
  {num:"07",title:"PostgreSQL com StatefulSet", diffClass:"advanced", diffLabel:"Avancado",
   meta:[{icon:"clock",text:"~35min"},{icon:"database",text:"Banco"}],
   desc:"Implante um banco PostgreSQL com armazenamento persistente usando StatefulSet e PersistentVolumeClaim.",
   objective:"PostgreSQL funcional com dados persistentes que sobrevivem a reinicios.",
   steps:[
     {num:"1",content:"Criar PVC para dados do banco.\ncat > pvc-postgres.yaml\nkubectl apply -f pvc-postgres.yaml -n applications"},
     {num:"2",content:"Criar StatefulSet do PostgreSQL.\nkubectl apply -f statefulset-postgres.yaml -n applications"},
     {num:"3",content:"Criar Service headless para o StatefulSet.\nkubectl apply -f svc-postgres.yaml -n applications"},
     {num:"4",content:"Testar conectividade do backend com o banco.\nkubectl exec -it deploy/api -n applications -- nslookup postgres-0.postgres"}
   ],
   verify:"kubectl get pods -n applications deve mostrar postgres-0 como Running. Os dados devem persistir apos reinicio do pod."},
  {num:"08",title:"CI/CD com GitHub Actions", diffClass:"advanced", diffLabel:"Avancado",
   meta:[{icon:"clock",text:"~40min"},{icon:"github",text:"Pipeline"}],
   desc:"Configure um pipeline CI/CD automatizado com GitHub Actions para build, push de imagem e deploy no K3s.",
   objective:"Pipeline automatizado para build de imagem Docker, push para GHCR e atualização do manifesto via SSH.",
   steps:[
     {num:"1",content:"Criar repositorio no GitHub e configurar secrets.\nSettings > Secrets and variables > Actions\nAdicionar: KUBE_CONFIG, GHCR_TOKEN, SSH_HOST, SSH_USER"},
     {num:"2",content:"Criar workflow .github/workflows/deploy.yaml.\nname: Deploy\non: push:\n  branches: [main]\njobs:\n  deploy: \n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Build & Push\n        run: |\n          echo \${{ secrets.GHCR_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin\n          docker build -t ghcr.io/\${{ github.repository }}/app:\${{ github.sha }} .\n          docker push ghcr.io/\${{ github.repository }}/app:\${{ github.sha }}"},
     {num:"3",content:"Configurar SSH deploy.\n- name: SSH Deploy\n  uses: appleboy/ssh-action@v1.0.3\n  with: \n    host: \${{ secrets.SSH_HOST }}\n    username: \${{ secrets.SSH_USER }}\n    key: \${{ secrets.SSH_KEY }}\n    script: |\n      kubectl set image deployment/api api=ghcr.io/\${{ github.repository }}/app:\${{ github.sha }} -n applications\n      kubectl rollout status deployment/api -n applications"},
     {num:"4",content:"Fazer push e verificar pipeline.\ngit add . && git commit -m 'feat: add pipeline'\ngit push origin main"}
   ],
   verify:"Apos o push, o GitHub Actions deve executar o workflow com sucesso. kubectl rollout history deployment/api -n applications deve mostrar a nova revisao."},
  {num:"09",title:"Observabilidade com Prometheus + Grafana", diffClass:"advanced", diffLabel:"Avancado",
   meta:[{icon:"clock",text:"~30min"},{icon:"bar-chart",text:"Monitoramento"}],
   desc:"Instale o stack kube-prometheus-stack para monitorar o cluster com métricas, alertas e dashboards.",
   objective:"Prometheus coletando métricas e Grafana com dashboards visuais de saude do cluster.",
   steps:[
     {num:"1",content:"Criar namespace monitoring.\nkubectl create namespace monitoring"},
     {num:"2",content:"Instalar kube-prometheus-stack via Helm.\nhelm repo add prometheus-community https://prometheus-community.github.io/helm-charts\nhelm install prometheus prometheus-community/kube-prometheus-stack -n monitoring"},
     {num:"3",content:"Criar Ingress para o Grafana.\nkubectl apply -f ingress-grafana.yaml -n monitoring"},
     {num:"4",content:"Acessar dashboards.\nkubectl get secret prometheus-grafana -n monitoring -o jsonpath='{.data.admin-password}' | base64 -d"},
     {num:"5",content:"Verificar targets e métricas.\nkubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring"}
   ],
   verify:"O Grafana deve estar acessivel via Ingress. Dashboards pre-configurados devem mostrar métricas dos nodes, pods e componentes do cluster."},
  {num:"10",title:"Troubleshooting Completo", diffClass:"advanced", diffLabel:"Avancado",
   meta:[{icon:"clock",text:"~45min"},{icon:"wrench",text:"Diagnostico"}],
   desc:"Diagnostique e resolva problemas reais em um cluster Kubernetes usando ferramentas e metodologias SRE.",
   objective:"Identificar e resolver 3 cenarios de falha: CrashLoopBackOff, ImagePullBackOff e Pod Pending.",
   steps:[
     {num:"1",content:"Cenario 1: CrashLoopBackOff.\nAnalisar logs e eventos do pod com falha.\nkubectl logs pod -n applications --previous\nkubectl describe pod -n applications"},
     {num:"2",content:"Cenario 2: ImagePullBackOff.\nVerificar nome da imagem e secrets de registro.\nkubectl describe pod -n applications | grep -A 5 'Image:'"},
     {num:"3",content:"Cenario 3: Pod Pending.\nVerificar recursos, volumes e scheduling.\nkubectl describe pod -n applications | grep -A 10 'Events:'"}
   ],
   verify:"Apos correcoes, kubectl get pods -n applications deve mostrar todos os pods como Running. A aplicacao deve responder em /api."}
];

function renderLabs() {
  const c = document.getElementById("labsContainer");
  if (!c) return;
  let h = "";
  labData.forEach(function(l) {
    h += '<div class="lab-card" id="lab-' + l.num + '">';
    h += '<div class="lab-card-header" role="button" tabindex="0" aria-expanded="false" onclick="toggleLab(this.closest(\'[id^="lab-"]\').parentElement, event)">';
    h += '<span class="lab-num">' + l.num + '</span>';
    h += '<div class="lab-info"><h4>' + escHtml(l.title) + '</h4><div class="lab-meta">';
    h += '<span class="lab-tag ' + l.diffClass + '">' + escHtml(l.diffLabel) + '</span>';
    l.meta.forEach(function(m) {
      h += '<span><i data-lucide="' + m.icon + '" class="icon-svg"></i> ' + escHtml(m.text) + '</span>';
    });
    h += '</div></div>';
    h += '<label class="lab-check" onclick="event.stopPropagation()" id="check-lab-' + l.num + '">';
    h += '<input type="checkbox" onchange="toggleLabComplete(\'lab-\' + l.num)" id="cb-lab-' + l.num + '">';
    h += '<span class="check-label">Concluido</span></label>';
    h += '<span class="lab-arrow">&#9660;</span></div>';
    h += '<div class="lab-card-body"><div class="lab-card-body-inner">';
    h += '<p>' + escHtml(l.desc) + '</p>';
    h += '<h5><i data-lucide="crosshair" class="icon-svg"></i> Objetivo</h5>';
    h += '<p>' + escHtml(l.objective) + '</p>';
    h += '<div class="lab-steps">';
    l.steps.forEach(function(s) {
      h += '<div class="lab-step"><span class="step-num">' + s.num + '</span><div class="step-content">' + fmtStep(s.content) + '</div></div>';
    });
    h += '</div>';
    h += '<div class="lab-verify"><strong>✓ Verificacao:</strong> ' + escHtml(l.verify) + '</div>';
    h += '</div></div></div>';
  });
  c.innerHTML = h;
  if (typeof lucide !== "undefined" && lucide.createIcons) lucide.createIcons();
}

// ===== UTILITY: Throttle =====
function throttle(fn, delay) {
  var last = 0;
  return function() {
    var now = Date.now();
    if (now - last >= delay) { last = now; fn.apply(null, arguments); }
  };
}

function escHtml(s) {
  if (!s) return "";
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;").replace(/`/g,"&#96;");
}

function fmtStep(s) {
  if (!s) return "";
  const parts = s.split("\n");
  let r = escHtml(parts[0]);
  for (let i = 1; i < parts.length; i++) {
    if (parts[i].trim()) r += "<br><code>" + escHtml(parts[i].trim()) + "</code>";
  }
  return r;
}

// ===== CHECKLIST RESTORE =====
function restoreChecklists() {
  try {
    const saved = JSON.parse(localStorage.getItem('k8s-checklists') || '{}');
    const keys = Object.keys(saved);
    if (!keys.length) return;
    document.querySelectorAll('.checklist-item').forEach(function(item) {
      const id = item.getAttribute('data-id') || item.textContent.trim().substring(0, 40);
      if (saved[id]) {
        item.classList.add('checked');
        const cb = item.querySelector('input[type=checkbox]');
        if (cb) cb.checked = true;
      }
    });
  } catch(e) { /* silently ignore */ }
}

// ===== ACHIEVEMENTS =====
function checkAchievements() {
  const progress = getProgress();
  if (!progress.quizzes) progress.quizzes = {};
  if (!progress.labs) progress.labs = {};

  const perfectQuizzes = QUIZ_IDS.filter(id => progress.quizzes[id] && progress.quizzes[id].pct === 100);
  const allLabsDone = LAB_IDS.every(id => progress.labs[id] === true);
  const allPerfect = perfectQuizzes.length === QUIZ_IDS.length;
  const allDone = allLabsDone && allPerfect;

  const badges = [];
  if (allPerfect) {
    badges.push('<div class="achievement-badge gold" onclick="openCert()"><span class="badge-icon">\ud83c\udfc6</span><div><div class="badge-label">Mestre Kubernetes</div><div class="badge-desc">100% em todos os 11 quizzes</div></div></div>');
  } else if (perfectQuizzes.length > 0) {
    badges.push('<div class="achievement-badge silver"><span class="badge-icon">\u2b50</span><div><div class="badge-label">Quizzes Perfeitos: ' + perfectQuizzes.length + '/11</div><div class="badge-desc">Continue para desbloquear o trof\u00e9u!</div></div></div>');
  }
  if (allLabsDone) {
    badges.push('<div class="achievement-badge gold" onclick="openCert()"><span class="badge-icon">\ud83d\udee0\ufe0f</span><div><div class="badge-label">Operador Certificado</div><div class="badge-desc">Todos os 10 labs conclu\u00eddos</div></div></div>');
  } else {
    const labsDone = LAB_IDS.filter(id => progress.labs[id] === true).length;
    if (labsDone > 0) {
      badges.push('<div class="achievement-badge silver"><span class="badge-icon">\ud83d\udd27</span><div><div class="badge-label">Labs: ' + labsDone + '/10</div><div class="badge-desc">Complete todos para a conquista!</div></div></div>');
    }
  }
  if (allDone) {
    badges.push('<div class="achievement-badge gold" onclick="openCert()"><span class="badge-icon">\ud83c\udfaf</span><div><div class="badge-label">Graduado em SRE/DevOps</div><div class="badge-desc">Todas as conquistas desbloqueadas!</div></div></div>');
  }

  const section = document.getElementById('achievementSection');
  if (section) section.innerHTML = badges.length > 0 ? '<div style="margin-bottom:4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);">Conquistas</div>' + badges.join('') : '';
}

// ===== CERTIFICATE =====
function openCert() {
  _previousFocus = document.activeElement;
  const progress = getProgress();
  if (!progress.quizzes) progress.quizzes = {};
  if (!progress.labs) progress.labs = {};
  const perfectQuizzes = QUIZ_IDS.filter(id => progress.quizzes[id] && progress.quizzes[id].pct === 100);
  const labsDone = LAB_IDS.filter(id => progress.labs[id] === true).length;
  const savedName = localStorage.getItem('k8s-cert-name') || '';
  document.getElementById('certDate').textContent = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  document.getElementById('certQuizCount').textContent = perfectQuizzes.length + '/11 quizzes com 100%';
  document.getElementById('certLabCount').textContent = labsDone + '/10 labs conclu\u00eddos';
  document.getElementById('certName').value = savedName;
  let gridHtml = '';
  perfectQuizzes.forEach(id => { gridHtml += '<div class="cert-quiz-item"><span class="cqi-icon">\u2705</span> ' + QUIZ_NAMES[id] + '</div>'; });
  document.getElementById('certQuizGrid').innerHTML = gridHtml;
  document.getElementById('certOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  fireConfetti();
  trapFocus(document.getElementById('certOverlay'));
}
function closeCert() {
  releaseFocus(document.getElementById('certOverlay'));
  document.getElementById('certOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function updateCertName() { localStorage.setItem('k8s-cert-name', document.getElementById('certName').value); }
function copyCertLink() {
  const name = document.getElementById('certName').value || 'Estudante K8s';
  const progress = getProgress();
  const perfectQuizzes = QUIZ_IDS.filter(id => progress.quizzes[id] && progress.quizzes[id].pct === 100);
  const labsDone = LAB_IDS.filter(id => progress.labs[id] === true).length;
  const text = '\ud83c\udfc6 Conquista Desbloqueada!\n\n' + name + ' completou o Manual Kubernetes para SRE/DevOps!\n\n\u2705 ' + perfectQuizzes.length + '/11 quizzes com 100%\n\ud83d\udee0\ufe0f ' + labsDone + '/10 labs conclu\u00eddos\n\n\ud83d\udd17 ' + window.location.origin + window.location.pathname;
  navigator.clipboard.writeText(text).then(function() {
    const btn = document.querySelector('.cert-btn.primary');
    const orig = btn.innerHTML; btn.innerHTML = '\u2705 Copiado!';
    setTimeout(function() { btn.innerHTML = orig; }, 2000);
  });
}
function downloadCert() {
  const name = document.getElementById('certName').value || 'Estudante K8s';
  const progress = getProgress();
  const perfectQuizzes = QUIZ_IDS.filter(id => progress.quizzes[id] && progress.quizzes[id].pct === 100);
  const labsDone = LAB_IDS.filter(id => progress.labs[id] === true).length;
  const canvas = document.createElement('canvas');
  canvas.width = 1200; canvas.height = 800;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 1200, 800);
  grad.addColorStop(0, '#0d1117'); grad.addColorStop(0.5, '#161b22'); grad.addColorStop(1, '#1a1040');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 1200, 800);
  ctx.strokeStyle = '#e3b341'; ctx.lineWidth = 4; ctx.strokeRect(30, 30, 1140, 740); ctx.strokeRect(36, 36, 1128, 728);
  ctx.font = 'bold 42px Segoe UI, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#e3b341';
  ctx.fillText('CERTIFICADO DE CONQUISTA', 600, 140);
  ctx.fillStyle = '#8b949e'; ctx.font = '20px Segoe UI, sans-serif';
  ctx.fillText('Manual Kubernetes para SRE/DevOps', 600, 200);
  ctx.fillStyle = '#e6edf3'; ctx.font = 'bold 36px Segoe UI, sans-serif';
  ctx.fillText(name, 600, 300);
  ctx.strokeStyle = '#e3b341'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(300, 320); ctx.lineTo(900, 320); ctx.stroke();
  ctx.fillStyle = '#8b949e'; ctx.font = '18px Segoe UI, sans-serif';
  ctx.fillText('[OK] ' + perfectQuizzes.length + '/11 quizzes com 100% de acerto', 600, 380);
  ctx.fillText('[LAB] ' + labsDone + '/10 laboratorios concluidos', 600, 420);
  const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  ctx.fillText(dateStr, 600, 480);
  ctx.fillStyle = '#58a6ff'; ctx.font = '14px Consolas, monospace';
  ctx.fillText(window.location.origin + window.location.pathname, 600, 760);
  const link = document.createElement('a');
  link.download = 'certificado-k8s-' + name.replace(/\s+/g, '-').toLowerCase() + '.png';
  link.href = canvas.toDataURL('image/png'); link.click();
}
function fireConfetti() {
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
  const colors = ['#e3b341', '#3fb950', '#58a6ff', '#bc8cff', '#f85149', '#39d2c0'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 1.5 + 's';
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.width = (6 + Math.random() * 8) + 'px';
    piece.style.height = (6 + Math.random() * 8) + 'px';
    container.appendChild(piece);
  }
  setTimeout(function() { container.innerHTML = ''; }, 4000);
}

// ===== RESET =====
function resetProgress() {
  if (!confirm('Tem certeza que deseja limpar todo o progresso?')) return;
  localStorage.removeItem('k8s-progress');
  QUIZ_IDS.forEach(id => {
    const quiz = document.getElementById('quiz-' + id);
    if (quiz) {
      quiz.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('disabled', 'correct', 'incorrect');
        opt.querySelector('input').disabled = false; opt.querySelector('input').checked = false;
      });
      quiz.querySelectorAll('.quiz-feedback').forEach(fb => fb.className = 'quiz-feedback');
      const scoreEl = document.getElementById('score-' + id);
      if (scoreEl) { scoreEl.className = 'quiz-score'; scoreEl.textContent = ''; scoreEl.removeAttribute('style'); }
      const retryBtn = quiz.querySelector('.quiz-retry');
      if (retryBtn) retryBtn.remove();
    }
  });
  LAB_IDS.forEach(id => {
    const cb = document.getElementById('cb-' + id);
    const label = document.getElementById('check-' + id);
    if (cb) cb.checked = false;
    if (label) label.classList.remove('done');
  });
  updateProgressUI();
  checkAchievements();
}

// ===== EXPORT / IMPORT =====
function exportProgress() {
  const progress = getProgress();
  const data = JSON.stringify(progress, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const now = new Date();
  const ts = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + '_' + String(now.getHours()).padStart(2,'0') + String(now.getMinutes()).padStart(2,'0') + String(now.getSeconds()).padStart(2,'0');
  a.href = url;
  a.download = 'k8s-progress-backup-' + ts + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  // Visual feedback
  const btn = document.querySelector('.progress-export');
  if (btn) { const orig = btn.innerHTML; btn.innerHTML = '\u2705 Exportado!'; setTimeout(function() { btn.innerHTML = orig; }, 2000); }
}

function importProgress() {
  document.getElementById('progressFileInput').click();
}

function handleImportFile(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 1048576) {
    alert('Arquivo muito grande (m\u00e1ximo: 1 MB).');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      // Allow empty JSON (no progress yet)
      if (!data.quizzes && !data.labs) {
        alert('Arquivo vazio ou inv\u00e1lido: nenhum progresso para importar.');
        return;
      }
      saveProgress(data);
      // Reset quiz UI
      QUIZ_IDS.forEach(function(id) {
        const quiz = document.getElementById('quiz-' + id);
        if (quiz) {
          quiz.querySelectorAll('.quiz-option').forEach(function(opt) {
            opt.classList.remove('disabled', 'correct', 'incorrect');
            opt.querySelector('input').disabled = false;
            opt.querySelector('input').checked = false;
          });
          quiz.querySelectorAll('.quiz-feedback').forEach(function(fb) { fb.className = 'quiz-feedback'; });
          const scoreEl = document.getElementById('score-' + id);
          if (scoreEl) { scoreEl.className = 'quiz-score'; scoreEl.textContent = ''; scoreEl.removeAttribute('style'); }
          const retryBtn = quiz.querySelector('.quiz-retry');
          if (retryBtn) retryBtn.remove();
          const shareBtn = quiz.querySelector('.quiz-share-btn');
          if (shareBtn) shareBtn.remove();
        }
      });
      // Reset lab checkboxes
      LAB_IDS.forEach(function(id) {
        const cb = document.getElementById('cb-' + id);
        const label = document.getElementById('check-' + id);
        if (cb) cb.checked = false;
        if (label) label.classList.remove('done');
      });
      // Restore everything fresh
      restoreState();
      updateProgressUI();
      checkAchievements();
      // Visual feedback
      const btn = document.querySelector('.progress-import');
      if (btn) { const orig = btn.innerHTML; btn.innerHTML = '\u2705 Importado!'; setTimeout(function() { btn.innerHTML = orig; }, 2000); }
    } catch(err) {
      alert('Erro ao ler o arquivo: ' + err.message);
    }
  };
  reader.readAsText(file);
  input.value = '';
}

// ===== RESTORE =====
function restoreState() {
  const progress = getProgress();
  if (!progress.quizzes) progress.quizzes = {};
  if (!progress.labs) progress.labs = {};
  QUIZ_IDS.forEach(function(id) {
    const data = progress.quizzes[id];
    if (!data) return;
    const quiz = document.getElementById('quiz-' + id);
    if (quiz) {
      const questions = quiz.querySelectorAll('.quiz-question');
      questions.forEach(function(q, qIndex) {
        const qData = data['q' + qIndex];
        if (!qData || typeof qData !== 'object') return;
        const options = q.querySelectorAll('.quiz-option');
        const feedback = q.querySelector('.quiz-feedback');
        options.forEach(function(opt) { opt.classList.add('disabled'); opt.querySelector('input').disabled = true; });
        const savedRadio = q.querySelector('input[value="' + qData.selected + '"]');
        if (savedRadio) savedRadio.checked = true;
        if (qData.correct) {
          savedRadio.closest('.quiz-option').classList.add('correct');
          feedback.className = 'quiz-feedback show correct-fb';
          feedback.textContent = '\u2713 Correto! Excelente!';
        } else {
          savedRadio.closest('.quiz-option').classList.add('incorrect');
          const correctIdx = parseInt(q.dataset.correct);
          if (options[correctIdx]) options[correctIdx].classList.add('correct');
          feedback.className = 'quiz-feedback show incorrect-fb';
          feedback.textContent = '\u2717 Incorreto. A resposta correta est\u00e1 destacada em verde.';
        }
      });
    }
    if (data.completed && data.pct !== undefined) {
      const scoreEl = document.getElementById('score-' + id);
      if (scoreEl) {
        scoreEl.className = 'quiz-score show';
        if (data.pct === 100) {
          scoreEl.style.background = 'var(--green-subtle)'; scoreEl.style.color = 'var(--green)';
          scoreEl.style.borderColor = 'rgba(63,185,80,0.3)';
          scoreEl.textContent = '\ud83c\udf89 Perfeito! ' + data.score + '/' + data.total + ' \u2014 Voc\u00ea dominou este m\u00f3dulo!';
        } else if (data.pct >= 60) {
          scoreEl.style.background = 'var(--accent-subtle)'; scoreEl.style.color = 'var(--accent)';
          scoreEl.style.borderColor = 'rgba(88,166,255,0.3)';
          scoreEl.textContent = '\ud83d\udc4d Bom! ' + data.score + '/' + data.total + ' (' + data.pct + '%)';
        } else {
          scoreEl.style.background = 'var(--red-subtle)'; scoreEl.style.color = 'var(--red)';
          scoreEl.style.borderColor = 'rgba(248,81,73,0.3)';
          scoreEl.textContent = '\ud83d\udcda Continue estudando! ' + data.score + '/' + data.total + ' (' + data.pct + '%)';
        }
      }
      showRetryButton(id);
    }
  });
  LAB_IDS.forEach(function(id) {
    if (progress.labs[id]) {
      const cb = document.getElementById('cb-' + id);
      const label = document.getElementById('check-' + id);
      if (cb) cb.checked = true;
      if (label) label.classList.add('done');
    }
  });
}

// ===== INIT (consolidated in single DOMContentLoaded below) =====


// ===== SHAREABLE BADGES =====
let _badgeQuizId = null;
let _badgeQuizName = '';
let _badgeScore = 0;
let _badgeTotal = 0;
let _badgePct = 0;

function shareQuizBadge(quizId) {
  _previousFocus = document.activeElement;
  const progress = getProgress();
  const data = progress.quizzes && progress.quizzes[quizId];
  if (!data || !data.completed) return;

  _badgeQuizId = quizId;
  _badgeQuizName = QUIZ_NAMES[quizId];
  _badgeScore = data.score;
  _badgeTotal = data.total;
  _badgePct = data.pct;

  const title = _badgePct === 100 ? 'Mestre em ' + _badgeQuizName : _badgePct + '% em ' + _badgeQuizName;
  document.getElementById('badgeTitle').textContent = title;
  document.getElementById('badgeSubtitle').textContent = 'Manual Kubernetes para SRE/DevOps';

  renderBadge();
  document.getElementById('badgeOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  trapFocus(document.getElementById('badgeOverlay'));
}

function closeBadge() {
  releaseFocus(document.getElementById('badgeOverlay'));
  document.getElementById('badgeOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function renderBadge() {
  const canvas = document.getElementById('badgeCanvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#0d1117');
  grad.addColorStop(0.6, '#161b22');
  grad.addColorStop(1, _badgePct === 100 ? '#1a2a10' : '#1a1040');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = _badgePct === 100 ? '#3fb950' : '#58a6ff';
  ctx.lineWidth = 3;
  roundRect(ctx, 8, 8, w - 16, h - 16, 12);
  ctx.stroke();

  ctx.strokeStyle = _badgePct === 100 ? 'rgba(63,185,80,0.3)' : 'rgba(88,166,255,0.3)';
  ctx.lineWidth = 1;
  roundRect(ctx, 14, 14, w - 28, h - 28, 8);
  ctx.stroke();

  ctx.font = '48px serif';
  ctx.textAlign = 'center';
  ctx.fillText(_badgePct === 100 ? '\ud83c\udfc6' : '\u2b50', 80, 100);

  ctx.fillStyle = _badgePct === 100 ? '#3fb950' : '#e3b341';
  ctx.font = 'bold 28px Segoe UI, sans-serif';
  ctx.textAlign = 'left';
  const titleText = _badgePct === 100 ? 'PERFEITO!' : (_badgePct >= 60 ? 'APROVADO' : 'EM PROGRESSO');
  ctx.fillText(titleText, 140, 85);

  ctx.fillStyle = '#e6edf3';
  ctx.font = '22px Segoe UI, sans-serif';
  ctx.fillText(_badgeQuizName, 140, 118);

  ctx.fillStyle = '#8b949e';
  ctx.font = '16px Segoe UI, sans-serif';
  ctx.fillText(_badgeScore + '/' + _badgeTotal + ' (' + _badgePct + '%)', 140, 148);

  ctx.strokeStyle = 'rgba(88,166,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, 180);
  ctx.lineTo(w - 30, 180);
  ctx.stroke();

  ctx.fillStyle = '#8b949e';
  ctx.font = '14px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Manual Kubernetes para SRE/DevOps', w / 2, 210);

  const barX = 80, barY = 235, barW = w - 160, barH = 16;
  ctx.fillStyle = '#21262d';
  roundRectFill(ctx, barX, barY, barW, barH, 8);
  const fillW = Math.max(barH, (barW * _badgePct / 100));
  const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  if (_badgePct === 100) {
    barGrad.addColorStop(0, '#238636');
    barGrad.addColorStop(1, '#3fb950');
  } else if (_badgePct >= 60) {
    barGrad.addColorStop(0, '#1f6feb');
    barGrad.addColorStop(1, '#58a6ff');
  } else {
    barGrad.addColorStop(0, '#da3633');
    barGrad.addColorStop(1, '#f85149');
  }
  ctx.fillStyle = barGrad;
  roundRectFill(ctx, barX, barY, fillW, barH, 8);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(_badgePct + '%', barX + barW / 2, barY + 12);

  ctx.fillStyle = '#58a6ff';
  ctx.font = '11px Consolas, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(window.location.origin + window.location.pathname, w / 2, 290);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function roundRectFill(ctx, x, y, w, h, r) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
}

function downloadBadge() {
  const name = localStorage.getItem('k8s-cert-name') || 'k8s-quiz';
  const canvas = document.getElementById('badgeCanvas');
  const link = document.createElement('a');
  link.download = 'badge-' + _badgeQuizId + '-' + name.replace(/\s+/g, '-').toLowerCase() + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function copyBadgeText() {
  const name = localStorage.getItem('k8s-cert-name') || 'Estudante K8s';
  const emoji = _badgePct === 100 ? '\ud83c\udfc6' : (_badgePct >= 60 ? '\u2705' : '\ud83d\udcda');
  const text = emoji + ' ' + (_badgePct === 100 ? 'Mestre' : 'Aprovado') + ' em ' + _badgeQuizName + '!\n' +
    _badgeScore + '/' + _badgeTotal + ' (' + _badgePct + '%) de acerto\n\n' +
    '\ud83d\udcaa Manual Kubernetes para SRE/DevOps\n' +
    '\ud83d\udd17 ' + window.location.origin + window.location.pathname;
  navigator.clipboard.writeText(text).then(function() {
    const btn = document.querySelector('#badgeOverlay .cert-btn.secondary');
    if (btn) { const orig = btn.innerHTML; btn.innerHTML = '\u2705 Copiado!'; setTimeout(function() { btn.innerHTML = orig; }, 2000); }
  });
}


// ===== CODE COPY & COLLAPSIBLE =====
function copyCode(btn, e) {
  if (e) e.stopPropagation();
  const block = btn.closest('.code-block'); if (!block) return; const pre = block.querySelector('pre');
  if (!pre) return;
  const orig = btn.innerHTML;
  navigator.clipboard.writeText(pre.textContent).then(function() {
    btn.innerHTML = '✅ Copiado!';
    btn.classList.add('copied');
    setTimeout(function() { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
  }).catch(function() {
    btn.innerHTML = '❌ Erro';
    setTimeout(function() { btn.innerHTML = orig; }, 2000);
  });
}

function toggleCollapsible(el, e) {
  if (e) e.stopPropagation();
  el.classList.toggle('open');
  el.setAttribute('aria-expanded', el.classList.contains('open'));
  const body = el.querySelector('.collapsible-body');
  if (!body) return;
  if (el.classList.contains('open')) {
    body.style.maxHeight = body.scrollHeight + 'px';
  } else {
    body.style.maxHeight = '0';
  }
}


// ===== KEYBOARD ACCESSIBILITY =====

let _previousFocus = null;

// Escape key closes open modals
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const cert = document.getElementById('certOverlay');
    if (cert && cert.classList.contains('open')) { closeCert(); return; }
    const badge = document.getElementById('badgeOverlay');
    if (badge && badge.classList.contains('open')) { closeBadge(); return; }
    const search = document.getElementById('searchModal');
    if (search && search.classList.contains('open')) { search.classList.remove('open'); document.body.style.overflow = ''; if (_previousFocus && _previousFocus.focus) { _previousFocus.focus(); _previousFocus = null; } return; }
  }
});

// Focus trap for modals
function trapFocus(modalEl) {
  const focusable = modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  modalEl._trapHandler = handler;
  modalEl.addEventListener('keydown', handler);
  first.focus();
}
function releaseFocus(modalEl) {
  if (modalEl._trapHandler) {
    modalEl.removeEventListener('keydown', modalEl._trapHandler);
    modalEl._trapHandler = null;
  }
  if (_previousFocus && _previousFocus.focus) {
    _previousFocus.focus();
    _previousFocus = null;
  }
}

// Lab card keyboard support (Enter/Space to toggle)
document.querySelectorAll('.lab-card-header').forEach(function(header) {
  header.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const card = header.closest('[id^="lab-"]').parentElement;
      if (card) toggleLab(card, e);
    }
  });
});

// Progress reset: add aria-label
const resetBtn = document.querySelector('.progress-reset');
if (resetBtn && !resetBtn.getAttribute('aria-label')) {
  resetBtn.setAttribute('aria-label', 'Limpar todo o progresso');
}

/* ===== TERMINAL SIMULATOR ===== */
const termHistory = []; let termHistIdx = -1;
let termOutput, termInput;
function terminalInsert(cmd) {
  if (termInput) { termInput.value = cmd; termInput.focus(); }
}
function termPrint(text, cls) {
  if (!termOutput) return;
  const d = document.createElement('div');
  d.className = 'terminal-line ' + (cls || 'output-line');
  d.textContent = text;
  termOutput.appendChild(d);
  termOutput.scrollTop = termOutput.scrollHeight;
}
function termExec(cmd) {
  termPrint('user@k8s-lab:~$ ' + cmd, 'prompt-line');
  if (!cmd.trim()) return;
  termHistory.push(cmd);
  termHistIdx = termHistory.length;
  const c = cmd.trim().toLowerCase();
  if (c === 'help') {
    termPrint('Comandos disponiveis:', 'info-line');
    termPrint('  kubectl get pods|nodes|svc|deployments|configmaps [-A] [-n ns]', '');
    termPrint('  kubectl describe pod|svc|node <name>', '');
    termPrint('  kubectl logs <pod-name> [-f]', '');
    termPrint('  kubectl apply -f <file.yaml>', '');
    termPrint('  kubectl delete -f <file.yaml>', '');
    termPrint('  kubectl rollout status|history|undo deploy/<name>', '');
    termPrint('  kubectl exec -it <pod> -- /bin/sh', '');
    termPrint('  helm list|install|upgrade|rollback|uninstall', '');
    termPrint('  clear - limpar terminal', '');
    termPrint('  help - mostrar esta ajuda', '');
    return;
  }
  if (c === 'clear') { termOutput.innerHTML = ''; return; }
  if (c.match(/^kubectl get pods/)) {
    termPrint('NAME                    READY   STATUS    RESTARTS   AGE', 'output-line');
    termPrint('frontend-abc123         1/1     Running   0          2d', 'output-line');
    termPrint('backend-def456          1/1     Running   0          2d', 'output-line');
    termPrint('backend-ghi789          1/1     Running   0          2d', 'output-line');
    if (c.includes('-a')) termPrint('db-migration-jkl012     0/1     Completed 0          1h', 'output-line');
    return;
  }
  if (c.match(/^kubectl get nodes/)) {
    termPrint('NAME     STATUS   ROLES                  AGE   VERSION', 'output-line');
    termPrint('server   Ready    control-plane,master   30d   v1.28.4+k3s1', 'output-line');
    termPrint('worker1  Ready    <none>                 29d   v1.28.4+k3s1', 'output-line');
    termPrint('worker2  Ready    <none>                 29d   v1.28.4+k3s1', 'output-line');
    return;
  }
  if (c.match(/^kubectl get svc/)) {
    termPrint('NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE', 'output-line');
    termPrint('frontend     ClusterIP   10.43.100.50    <none>        80/TCP         2d', 'output-line');
    termPrint('backend      ClusterIP   10.43.200.30    <none>        8080/TCP       2d', 'output-line');
    termPrint('kubernetes   ClusterIP   10.43.0.1       <none>        443/TCP        30d', 'output-line');
    return;
  }
  if (c.match(/^kubectl get deploy/)) {
    termPrint('NAME       READY   UP-TO-DATE   AVAILABLE   AGE', 'output-line');
    termPrint('frontend   1/1     1            1           2d', 'output-line');
    termPrint('backend    2/2     2            2           2d', 'output-line');
    return;
  }
  if (c.match(/^kubectl get (configmap|cm)/)) {
    termPrint('NAME               DATA   AGE', 'output-line');
    termPrint('app-config         3      2d', 'output-line');
    termPrint('kube-root-ca.crt   1      30d', 'output-line');
    return;
  }
  if (c.match(/^kubectl get (secret|secrets)/)) {
    termPrint('NAME              TYPE     DATA   AGE', 'output-line');
    termPrint('db-credentials    Opaque   2      2d', 'output-line');
    termPrint('tls-cert          TLS      2      2d', 'output-line');
    return;
  }
  if (c.match(/^kubectl get ingress/)) {
    termPrint('NAME             CLASS     HOSTS              ADDRESS         PORTS     AGE', 'output-line');
    termPrint('web-ingress      traefik   app.example.com    192.168.1.100   80, 443   2d', 'output-line');
    return;
  }
  if (c.match(/^kubectl get/)) {
    termPrint('error: the server does not have a resource type', 'error-line');
    termPrint('Use: kubectl get pods|nodes|svc|deployments', 'info-line');
    return;
  }
  if (c.match(/^kubectl describe pod\s+(\S+)/)) {
    const pod = cmd.match(/describe pod\s+(\S+)/)[1];
    termPrint('Name:             ' + pod, 'output-line');
    termPrint('Namespace:        default', 'output-line');
    termPrint('Node:             worker1/192.168.1.101', 'output-line');
    termPrint('Labels:           app=web', 'output-line');
    termPrint('Status:           Running', 'output-line');
    termPrint('IP:               10.42.0.15', 'output-line');
    termPrint('Containers:', 'output-line');
    termPrint('  web:', 'output-line');
    termPrint('    Image:          ghcr.io/org/web:v1.2.0', 'output-line');
    termPrint('    Port:           8080/TCP', 'output-line');
    termPrint('    Ready:          True', 'output-line');
    termPrint('    Restart Count:  0', 'output-line');
    termPrint('    Limits:         cpu=200m, memory=256Mi', 'output-line');
    termPrint('    Requests:       cpu=100m, memory=128Mi', 'output-line');
    termPrint('Events:', 'output-line');
    termPrint('  Normal  Scheduled  2d  Successfully assigned default/' + pod + ' to worker1', 'output-line');
    termPrint('  Normal  Pulled     2d  Container image already present', 'output-line');
    termPrint('  Normal  Created    2d  Created container', 'output-line');
    termPrint('  Normal  Started    2d  Started container', 'output-line');
    return;
  }
  if (c.match(/^kubectl describe/)) {
    termPrint('Error: specify a resource and name (e.g., kubectl describe pod <name>)', 'error-line');
    return;
  }
  if (c.match(/^kubectl logs\s+(\S+)/)) {
    const pod = cmd.match(/logs\s+(\S+)/)[1];
    termPrint('[' + pod + '] 2026-07-10T12:00:01Z INFO  Server starting on :8080', 'output-line');
    termPrint('[' + pod + '] 2026-07-10T12:00:01Z INFO  Connected to database', 'output-line');
    termPrint('[' + pod + '] 2026-07-10T12:00:02Z INFO  Health check ready at /healthz', 'output-line');
    termPrint('[' + pod + '] 2026-07-10T12:00:15Z INFO  GET /api/status 200 12ms', 'output-line');
    return;
  }
  if (c.match(/^kubectl apply -f/)) {
    termPrint('deployment.apps/frontend configured', 'output-line');
    termPrint('service/frontend created', 'output-line');
    termPrint('ingress.networking.k8s.io/web-ingress created', 'output-line');
    return;
  }
  if (c.match(/^kubectl delete/)) {
    termPrint('deployment.apps/frontend deleted', 'output-line');
    return;
  }
  if (c.match(/rollout status deploy/)) {
    termPrint('deployment "frontend" successfully rolled out', 'success-line');
    return;
  }
  if (c.match(/rollout history deploy/)) {
    termPrint('REVISION  CHANGE-CAUSE', 'output-line');
    termPrint('1         kubectl apply --filename=frontend.yaml', 'output-line');
    termPrint('2         kubectl apply --filename=frontend.yaml', 'output-line');
    return;
  }
  if (c.match(/rollout undo deploy/)) {
    termPrint('deployment.apps/frontend rolled back', 'success-line');
    return;
  }
  if (c === 'helm list') {
    termPrint('NAME          NAMESPACE  REVISION  STATUS    CHART               APP VERSION', 'output-line');
    termPrint('traefik       kube-system 1         deployed  traefik-25.0.0     v3.0', 'output-line');
    termPrint('postgres      default    1         deployed  postgresql-13.2.0  16.1', 'output-line');
    return;
  }
  if (c.match(/^helm install/)) {
    termPrint('"app" has been installed!', 'success-line');
    termPrint('STATUS: deployed', 'output-line');
    return;
  }
  if (c.match(/^helm upgrade/)) {
    termPrint('"app" has been upgraded!', 'success-line');
    return;
  }
  if (c.match(/^helm rollback/)) {
    termPrint('Rollback "app" has been rolled back!', 'success-line');
    return;
  }
  if (c.match(/^helm uninstall/)) {
    termPrint('"app" has been uninstalled.', 'info-line');
    return;
  }
  if (c.match(/^kubectl exec/)) {
    termPrint('$ (sessao interativa simulada)', 'info-line');
    termPrint('root@frontend-abc123:/app# ls', 'output-line');
    termPrint('Dockerfile  README.md  app.js  package.json', 'output-line');
    termPrint('root@frontend-abc123:/app# exit', 'info-line');
    return;
  }
  termPrint('bash: ' + cmd.split(' ')[0] + ': comando nao encontrado', 'error-line');
  termPrint('Digite "help" para ver os comandos disponiveis.', 'info-line');
}
function initTerminal() {
  termOutput = document.getElementById('terminalOutput');
  termInput = document.getElementById('terminalInput');
  if (!termInput) return;
  termInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const cmd = this.value;
      this.value = '';
      termExec(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (termHistIdx > 0) { termHistIdx--; this.value = termHistory[termHistIdx] || ''; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (termHistIdx < termHistory.length - 1) { termHistIdx++; this.value = termHistory[termHistIdx] || ''; }
      else { termHistIdx = termHistory.length; this.value = ''; }
    }
  });
}

/* ===== YAML EXPLORER ===== */
const yamlDocs = {
  apiVersion: { title: 'apiVersion', type: 'string', required: true, desc: 'A versao da API do Kubernetes que define o tipo de recurso. Exemplos: apps/v1, v1, networking.k8s.io/v1.' },
  kind: { title: 'kind', type: 'string', required: true, desc: 'O tipo de recurso Kubernetes. Exemplos: Deployment, Service, Pod, ConfigMap, Ingress.' },
  metadata: { title: 'metadata', type: 'object', required: true, desc: 'Dados de identificacao do recurso: nome, namespace, labels e annotations.' },
  name: { title: 'name', type: 'string', required: true, desc: 'Nome unico do recurso dentro do namespace. Deve ser RFC 1123 compliant.' },
  namespace: { title: 'namespace', type: 'string', required: false, desc: 'Namespace onde o recurso sera criado. Default: default.' },
  labels: { title: 'labels', type: 'map[string]string', required: false, desc: 'Pares chave=valor para organização e selecao. Ex: app=frontend, tier=web.' },
  annotations: { title: 'annotations', type: 'map[string]string', required: false, desc: 'Metadados nao-identificadores. Usados por ferramentas como Ingress, cert-manager.' },
  spec: { title: 'spec', type: 'object', required: true, desc: 'O estado desejado do recurso. O control plane tenta manter este estado.' },
  selector: { title: 'selector', type: 'object', required: true, desc: 'Define como o controlador encontra os Pods que gerencia.' },
  matchLabels: { title: 'matchLabels', type: 'map', required: true, desc: 'Mapa chave=valor. Todos os labels devem coincidir com os labels do Pod.' },
  template: { title: 'template', type: 'PodTemplateSpec', required: true, desc: 'Template do Pod que o Deployment cria. Contem metadata e spec do Pod.' },
  replicas: { title: 'replicas', type: 'integer', required: false, desc: 'Numero desejado de replicas do Pod. Default: 1.' },
  containers: { title: 'containers', type: '[]Container', required: true, desc: 'Lista de containers no Pod. Pelo menos um container principal e obrigatorio.' },
  image: { title: 'image', type: 'string', required: true, desc: 'Imagem do container (ex: nginx:1.25). Preferir tags versionadas em producao.' },
  ports: { title: 'ports', type: '[]ContainerPort', required: false, desc: 'Portas que o container expose. Nao controla acesso externo.' },
  containerPort: { title: 'containerPort', type: 'integer', required: true, desc: 'Porta TCP/UDP que o container escuta. Deve ser 1-65535.' },
  resources: { title: 'resources', type: 'object', required: false, desc: 'Limites e requests de CPU/memoria. CRITICO para estabilidade do cluster.' },
  requests: { title: 'requests', type: 'ResourceList', required: false, desc: 'Recursos minimos garantidos ao Pod. O scheduler usa para decisoes.' },
  limits: { title: 'limits', type: 'ResourceList', required: false, desc: 'Recursos maximos que o Pod pode usar. Exceder memoria = OOMKill.' },
  type: { title: 'type', type: 'string', required: true, desc: 'Tipo do Service: ClusterIP, NodePort, LoadBalancer, ExternalName.' },
  clusterIP: { title: 'clusterIP', type: 'string', required: false, desc: 'IP interno do cluster. None cria headless service.' },
  selector_service: { title: 'selector', type: 'map[string]string', required: true, desc: 'Labels para selecionar Pods que o Service roteia.' },
  path: { title: 'path', type: 'string', required: true, desc: 'Caminho da URL (ex: /, /api, /static).' },
  pathType: { title: 'pathType', type: 'string', required: true, desc: 'Prefix casa com prefixo. Exact casa exato. ImplementationSpecific.' },
  backend: { title: 'backend', type: 'IngressBackend', required: true, desc: 'Define o Service e porta de destino.' },
  service: { title: 'service', type: 'ObjectReference', required: true, desc: 'Referencia ao Service de destino com nome e porta.' },
  tls: { title: 'tls', type: '[]IngressTLS', required: false, desc: 'Configuracao TLS/HTTPS. Lista de hosts e segredo com certificado.' },
  port: { title: 'port', type: 'integer', required: true, desc: 'Porta que o Service expoe para Pods ou clientes externos.' },
  targetPort: { title: 'targetPort', type: 'integer', required: false, desc: 'Porta do Pod onde o Service roteia o trafego. Default: igual a port.' },
};
const yamlData = {};
yamlData.deployment = '<span class="yaml-key" onclick="showYamlDoc(\'apiVersion\')">apiVersion</span>: <span class="yaml-str">apps/v1</span>\n';
yamlData.deployment += '<span class="yaml-key" onclick="showYamlDoc(\'kind\')">kind</span>: <span class="yaml-str">Deployment</span>\n';
yamlData.deployment += '<span class="yaml-key" onclick="showYamlDoc(\'metadata\')">metadata</span>:\n';
yamlData.deployment += '  <span class="yaml-key" onclick="showYamlDoc(\'name\')">name</span>: <span class="yaml-str">frontend</span>\n';
yamlData.deployment += '  <span class="yaml-key" onclick="showYamlDoc(\'namespace\')">namespace</span>: <span class="yaml-str">default</span>\n';
yamlData.deployment += '  <span class="yaml-key" onclick="showYamlDoc(\'labels\')">labels</span>:\n';
yamlData.deployment += '    <span class="yaml-key">app</span>: <span class="yaml-str">frontend</span>\n';
yamlData.deployment += '    <span class="yaml-key">tier</span>: <span class="yaml-str">web</span>\n';
yamlData.deployment += '<span class="yaml-key" onclick="showYamlDoc(\'spec\')">spec</span>:\n';
yamlData.deployment += '  <span class="yaml-key" onclick="showYamlDoc(\'replicas\')">replicas</span>: <span class="yaml-num">3</span>\n';
yamlData.deployment += '  <span class="yaml-key" onclick="showYamlDoc(\'selector\')">selector</span>:\n';
yamlData.deployment += '    <span class="yaml-key" onclick="showYamlDoc(\'matchLabels\')">matchLabels</span>:\n';
yamlData.deployment += '      <span class="yaml-key">app</span>: <span class="yaml-str">frontend</span>\n';
yamlData.deployment += '  <span class="yaml-key" onclick="showYamlDoc(\'template\')">template</span>:\n';
yamlData.deployment += '    <span class="yaml-key">metadata</span>:\n';
yamlData.deployment += '      <span class="yaml-key">labels</span>:\n';
yamlData.deployment += '        <span class="yaml-key">app</span>: <span class="yaml-str">frontend</span>\n';
yamlData.deployment += '    <span class="yaml-key">spec</span>:\n';
yamlData.deployment += '      <span class="yaml-key" onclick="showYamlDoc(\'containers\')">containers</span>:\n';
yamlData.deployment += '        - <span class="yaml-key">name</span>: <span class="yaml-str">frontend</span>\n';
yamlData.deployment += '          <span class="yaml-key" onclick="showYamlDoc(\'image\')">image</span>: <span class="yaml-str">ghcr.io/org/frontend:v1.2.0</span>\n';
yamlData.deployment += '          <span class="yaml-key" onclick="showYamlDoc(\'ports\')">ports</span>:\n';
yamlData.deployment += '            - <span class="yaml-key" onclick="showYamlDoc(\'containerPort\')">containerPort</span>: <span class="yaml-num">8080</span>\n';
yamlData.deployment += '          <span class="yaml-key" onclick="showYamlDoc(\'resources\')">resources</span>:\n';
yamlData.deployment += '            <span class="yaml-key" onclick="showYamlDoc(\'requests\')">requests</span>:\n';
yamlData.deployment += '              <span class="yaml-key">cpu</span>: <span class="yaml-str">100m</span>\n';
yamlData.deployment += '              <span class="yaml-key">memory</span>: <span class="yaml-str">128Mi</span>\n';
yamlData.deployment += '            <span class="yaml-key" onclick="showYamlDoc(\'limits\')">limits</span>:\n';
yamlData.deployment += '              <span class="yaml-key">cpu</span>: <span class="yaml-str">200m</span>\n';
yamlData.deployment += '              <span class="yaml-key">memory</span>: <span class="yaml-str">256Mi</span>';

yamlData.service = '<span class="yaml-key" onclick="showYamlDoc(\'apiVersion\')">apiVersion</span>: <span class="yaml-str">v1</span>\n';
yamlData.service += '<span class="yaml-key" onclick="showYamlDoc(\'kind\')">kind</span>: <span class="yaml-str">Service</span>\n';
yamlData.service += '<span class="yaml-key" onclick="showYamlDoc(\'metadata\')">metadata</span>:\n';
yamlData.service += '  <span class="yaml-key" onclick="showYamlDoc(\'name\')">name</span>: <span class="yaml-str">frontend</span>\n';
yamlData.service += '<span class="yaml-key" onclick="showYamlDoc(\'spec\')">spec</span>:\n';
yamlData.service += '  <span class="yaml-key" onclick="showYamlDoc(\'type\')">type</span>: <span class="yaml-str">ClusterIP</span>\n';
yamlData.service += '  <span class="yaml-key" onclick="showYamlDoc(\'selector_service\')">selector</span>:\n';
yamlData.service += '    <span class="yaml-key">app</span>: <span class="yaml-str">frontend</span>\n';
yamlData.service += '  <span class="yaml-key" onclick="showYamlDoc(\'ports\')">ports</span>:\n';
yamlData.service += '    - <span class="yaml-key">protocol</span>: <span class="yaml-str">TCP</span>\n';
yamlData.service += '      <span class="yaml-key" onclick="showYamlDoc(\'port\')">port</span>: <span class="yaml-num">80</span>\n';
yamlData.service += '      <span class="yaml-key" onclick="showYamlDoc(\'targetPort\')">targetPort</span>: <span class="yaml-num">8080</span>';

yamlData.ingress = '<span class="yaml-key" onclick="showYamlDoc(\'apiVersion\')">apiVersion</span>: <span class="yaml-str">networking.k8s.io/v1</span>\n';
yamlData.ingress += '<span class="yaml-key" onclick="showYamlDoc(\'kind\')">kind</span>: <span class="yaml-str">Ingress</span>\n';
yamlData.ingress += '<span class="yaml-key" onclick="showYamlDoc(\'metadata\')">metadata</span>:\n';
yamlData.ingress += '  <span class="yaml-key" onclick="showYamlDoc(\'name\')">name</span>: <span class="yaml-str">web-ingress</span>\n';
yamlData.ingress += '  <span class="yaml-key" onclick="showYamlDoc(\'annotations\')">annotations</span>:\n';
yamlData.ingress += '    <span class="yaml-key">traefik.ingress.kubernetes.io/router.entrypoints</span>: <span class="yaml-str">websecure</span>\n';
yamlData.ingress += '<span class="yaml-key" onclick="showYamlDoc(\'spec\')">spec</span>:\n';
yamlData.ingress += '  <span class="yaml-key">ingressClassName</span>: <span class="yaml-str">traefik</span>\n';
yamlData.ingress += '  <span class="yaml-key" onclick="showYamlDoc(\'tls\')">tls</span>:\n';
yamlData.ingress += '    - <span class="yaml-key">hosts</span>:\n';
yamlData.ingress += '        - <span class="yaml-str">app.example.com</span>\n';
yamlData.ingress += '      <span class="yaml-key">secretName</span>: <span class="yaml-str">tls-cert</span>\n';
yamlData.ingress += '  <span class="yaml-key">rules</span>:\n';
yamlData.ingress += '    - <span class="yaml-key">host</span>: <span class="yaml-str">app.example.com</span>\n';
yamlData.ingress += '      <span class="yaml-key">http</span>:\n';
yamlData.ingress += '        <span class="yaml-key">paths</span>:\n';
yamlData.ingress += '          - <span class="yaml-key" onclick="showYamlDoc(\'path\')">path</span>: <span class="yaml-str">/</span>\n';
yamlData.ingress += '            <span class="yaml-key" onclick="showYamlDoc(\'pathType\')">pathType</span>: <span class="yaml-str">Prefix</span>\n';
yamlData.ingress += '            <span class="yaml-key" onclick="showYamlDoc(\'backend\')">backend</span>:\n';
yamlData.ingress += '              <span class="yaml-key" onclick="showYamlDoc(\'service\')">service</span>:\n';
yamlData.ingress += '                <span class="yaml-key">name</span>: <span class="yaml-str">frontend</span>\n';
yamlData.ingress += '                <span class="yaml-key" onclick="showYamlDoc(\'port\')">port</span>:\n';
yamlData.ingress += '                  <span class="yaml-key">number</span>: <span class="yaml-num">80</span>';

function showYamlDoc(key) {
  const panel = document.getElementById('yamlDocPanel');
  if (!panel) return;
  const prev = document.querySelectorAll('.yaml-key.highlighted');
  prev.forEach(function(p) { p.classList.remove('highlighted'); });
  const keys = document.querySelectorAll('.yaml-key');
  keys.forEach(function(k) { if (k.textContent.trim() === key) k.classList.add('highlighted'); });
  const doc = yamlDocs[key];
  if (!doc) { panel.innerHTML = '<div class="yaml-doc-empty">Sem documentacao para "' + key + '"</div>'; return; }
  panel.innerHTML = '<h5>' + doc.title + '</h5>'
    + '<div class="yaml-doc-type">' + doc.type + '</div> '
    + (doc.required ? '<span class="yaml-doc-required">Obrigatorio</span>' : '<span class="yaml-doc-optional">Opcional</span>')
    + '<p>' + doc.desc + '</p>';
}
function switchYamlTab(tab, btn) {
  document.querySelectorAll('.yaml-tab').forEach(function(t) { t.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  const panel = document.getElementById('yamlCodePanel');
  if (panel && yamlData[tab]) {
    panel.innerHTML = '<pre style="margin:0;background:none;border:none;padding:0;font-family:inherit;font-size:inherit;color:inherit;line-height:1.8;">' + yamlData[tab] + '</pre>';
  }
  const docPanel = document.getElementById('yamlDocPanel');
  if (docPanel) docPanel.innerHTML = '<div class="yaml-doc-empty">Clique em um campo-chave do YAML a esquerda para ver a documentacao</div>';
}

/* ===== FLASHCARDS ===== */
const flashcardData = [
  { term: 'Pod', cat: 'Recursos', def: 'A menor unidade implantavel no Kubernetes. Contem um ou mais containers que compartilham rede e storage.', example: 'kubectl get pods' },
  { term: 'Deployment', cat: 'Recursos', def: 'Controlador que mantem N replicas de Pods. Gerencia ReplicaSets e realiza rolling updates.', example: 'kubectl create deploy web --image=nginx' },
  { term: 'Service', cat: 'Recursos', def: 'Endereco estavel e IP fixo que roteia trafego para um conjunto de Pods selecionados por labels.', example: 'kubectl expose deploy web --port=80' },
  { term: 'Ingress', cat: 'Recursos', def: 'Regra HTTP/HTTPS que roteia trafego externo para Services baseado em host e path.', example: 'kubectl apply -f ingress.yaml' },
  { term: 'ConfigMap', cat: 'Recursos', def: 'Armazena configurações nao sensiveis como arquivos de config ou variaveis de ambiente.', example: 'kubectl create configmap app-config --from-literal=key=value' },
  { term: 'Secret', cat: 'Recursos', def: 'Armazena dados sensiveis (senhas, tokens, certificados) em base64.', example: 'kubectl create secret generic db-pass --from-literal=password=abc123' },
  { term: 'StatefulSet', cat: 'Recursos', def: 'Controlador para aplicações com estado (bancos de dados). Garante nomes e ordem estaveis dos Pods.', example: 'kubectl get sts postgres' },
  { term: 'PV / PVC', cat: 'Recursos', def: 'PersistentVolume e storage fisico. PersistentVolumeClaim e o pedido de um Pod para usar esse storage.', example: 'kubectl get pv,pvc' },
  { term: 'Namespace', cat: 'Recursos', def: 'Isolamento logico dentro do cluster. Separa ambientes, equipes ou aplicações.', example: 'kubectl create ns production' },
  { term: 'ReplicaSet', cat: 'Recursos', def: 'Garante N Pods rodando. Raramente criado diretamente - o Deployment cria e gerencia.', example: 'kubectl get rs' },
  { term: 'kubectl get', cat: 'Comandos', def: 'Lista recursos. Flags: -A (todos ns), -o wide/yaml/json, -l (labels).', example: 'kubectl get pods -A -o wide' },
  { term: 'kubectl describe', cat: 'Comandos', def: 'Mostra detalhes completos de um recurso incluindo eventos, condicoes e configuração.', example: 'kubectl describe pod web-0' },
  { term: 'kubectl logs', cat: 'Comandos', def: 'Exibe logs de um container. Use -f para streaming e --previous para logs anteriores.', example: 'kubectl logs web-0 -f --tail=100' },
  { term: 'kubectl apply', cat: 'Comandos', def: 'Cria ou atualiza recursos de forma idempotente. Baseado no estado desejado declarado no YAML.', example: 'kubectl apply -f deployment.yaml' },
  { term: 'kubectl rollout', cat: 'Comandos', def: 'Gerencia rollouts: status, history, undo, restart. Essencial para deploy e rollback.', example: 'kubectl rollout undo deploy/web' },
  { term: 'Control Plane', cat: 'Arquitetura', def: 'O cerebro do cluster: API Server, etcd, Scheduler e Controller Manager.', example: 'kubectl get nodes -o wide' },
  { term: 'Worker Node', cat: 'Arquitetura', def: 'Maquina que executa Pods. Contem kubelet, kube-proxy, container runtime e plugins.', example: 'kubectl describe node worker1' },
  { term: 'etcd', cat: 'Arquitetura', def: 'Banco chave-valor distribuido que armazena todo o estado do cluster.', example: 'Etcd roda no control plane (porta 2379)' },
  { term: 'kubelet', cat: 'Arquitetura', def: 'Agente em cada node que gerencia o ciclo de vida dos Pods e reporta status.', example: 'systemctl status kubelet' },
  { term: 'kube-proxy', cat: 'Arquitetura', def: 'Implementa regras de rede (iptables/IPVS) que roteiam trafego dos Services para Pods.', example: 'iptables -t nat -L' },
  { term: 'CrashLoopBackOff', cat: 'Troubleshooting', def: 'Container inicia e cai repetidamente. Primeira acao: kubectl logs.', example: 'kubectl logs web-0 --previous' },
  { term: 'ImagePullBackOff', cat: 'Troubleshooting', def: 'Kubernetes nao consegue baixar a imagem. Verificar: nome, tag, credenciais.', example: 'kubectl describe pod | grep -A5 Events' },
  { term: 'Pending', cat: 'Troubleshooting', def: 'Pod nao foi agendado. Causas: sem recursos, selector sem node, volume nao bound.', example: 'kubectl describe pod | grep -A3 Conditions' },
  { term: 'NetworkPolicy', cat: 'Seguranca', def: 'Firewall entre Pods. Define quem pode falar com quem baseado em labels e ports.', example: 'kubectl apply -f networkpolicy.yaml' },
  { term: 'RBAC', cat: 'Seguranca', def: 'Role-Based Access Control. Controla permissoes via Roles, ClusterRoles e Bindings.', example: 'kubectl auth can-i get pods' },
  { term: 'Helm', cat: 'Ferramentas', def: 'Gerenciador de pacotes para Kubernetes. Charts sao templates parametrizaveis.', example: 'helm install traefik traefik/traefik' },
  { term: 'Kustomize', cat: 'Ferramentas', def: 'Customizacao de manifests sem templates. Usa base + overlays para variacoes.', example: 'kubectl apply -k overlays/prod/' },
];
let fcIndex = 0, fcCategory = 'Todos', fcFiltered = [], fcFlipped = false;
function filterFlashcards(cat) {
  fcCategory = cat; fcIndex = 0; fcFlipped = false;
  fcFiltered = cat === 'Todos' ? flashcardData.slice() : flashcardData.filter(function(c) { return c.cat === cat; });
  renderFlashcard();
  document.querySelectorAll('.flashcat-btn').forEach(function(b) { b.classList.toggle('active', b.textContent === cat); });
}
function renderFlashcard() {
  if (!fcFiltered.length) return;
  const card = fcFiltered[fcIndex];
  const el = document.getElementById('flashcard');
  el.classList.remove('flipped'); fcFlipped = false;
  document.getElementById('flashcardTerm').textContent = card.term;
  document.getElementById('flashcardCat').textContent = card.cat;
  document.getElementById('flashcardCatBack').textContent = card.cat;
  document.getElementById('flashcardDef').textContent = card.def;
  const exEl = document.getElementById('flashcardExample');
  if (card.example) { exEl.textContent = '$ ' + card.example; exEl.style.display = 'block'; }
  else { exEl.style.display = 'none'; }
  document.getElementById('fcCounter').textContent = (fcIndex + 1) + ' / ' + fcFiltered.length;
  document.getElementById('fcPrevBtn').disabled = fcIndex === 0;
  document.getElementById('fcNextBtn').disabled = fcIndex === fcFiltered.length - 1;
  updateFlashcardProgress();
}
function flipFlashcard() {
  const el = document.getElementById('flashcard');
  fcFlipped = !fcFlipped;
  el.classList.toggle('flipped', fcFlipped);
}
function nextFlashcard() { if (fcIndex < fcFiltered.length - 1) { fcIndex++; renderFlashcard(); } }
function prevFlashcard() { if (fcIndex > 0) { fcIndex--; renderFlashcard(); } }
function rateFlashcard(known) {
  localStorage.setItem('k8s-fc-' + fcCategory + '-' + fcIndex, known ? 'known' : 'dunno');
  if (fcIndex < fcFiltered.length - 1) { fcIndex++; renderFlashcard(); }
  updateFlashcardProgress();
}
function updateFlashcardProgress() {
  let known = 0;
  fcFiltered.forEach(function(_, i) { if (localStorage.getItem('k8s-fc-' + fcCategory + '-' + i) === 'known') known++; });
  const el = document.getElementById('flashcardProgress');
  if (el) el.textContent = known + '/' + fcFiltered.length + ' dominados';
}
function initFlashcards() {
  const cats = ['Todos'];
  flashcardData.forEach(function(c) { if (cats.indexOf(c.cat) === -1) cats.push(c.cat); });
  const container = document.getElementById('flashcardCats');
  if (!container) return;
  cats.forEach(function(cat) {
    const btn = document.createElement('button');
    btn.className = 'flashcat-btn' + (cat === 'Todos' ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = function() { filterFlashcards(cat); };
    container.appendChild(btn);
  });
  filterFlashcards('Todos');
}

/* ===== ROLLOUT SIMULATOR ===== */
let rolloutState = { pods: [], phase: 'idle', time: 0, interval: null };
function createPod(label, version, state) { return { label: label, version: version, state: state }; }
function renderRolloutPods() {
  const area = document.getElementById('rolloutPodsArea');
  if (!area) return;
  area.innerHTML = '';
  let v1Count = 0, v2Count = 0;
  rolloutState.pods.forEach(function(pod) {
    const div = document.createElement('div');
    div.className = 'rollout-pod ' + pod.state;
    const icon = pod.state === 'terminating' ? 'X' : pod.state === 'starting' ? '...' : 'OK';
    div.innerHTML = '<span class="pod-icon">' + icon + '</span><span class="pod-label">' + pod.label + '</span><span class="pod-label">' + pod.version + '</span>';
    area.appendChild(div);
    if (pod.version === 'v1' && pod.state !== 'terminating') v1Count++;
    if (pod.version === 'v2' && pod.state !== 'terminating') v2Count++;
  });
  document.getElementById('rolloutV1Count').textContent = v1Count;
  document.getElementById('rolloutV2Count').textContent = v2Count;
}
function rolloutLog(msg, cls) {
  const log = document.getElementById('rolloutLog');
  if (!log) return;
  const now = new Date();
  const t = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0') + ':' + String(now.getSeconds()).padStart(2,'0');
  log.innerHTML += '<div><span class="log-time">[' + t + ']</span> <span class="' + (cls || 'log-info') + '">' + msg + '</span></div>';
  log.scrollTop = log.scrollHeight;
}
function setRolloutStatus(text, cls) {
  const el = document.getElementById('rolloutStatus');
  if (el) { el.textContent = text; el.className = 'rs-value ' + cls; }
  const ver = document.getElementById('rolloutVersion');
  if (ver) {
    let v1 = 0, v2 = 0;
    rolloutState.pods.forEach(function(p) { if (p.state !== 'terminating') { if (p.version === 'v1') v1++; if (p.version === 'v2') v2++; } });
    if (v2 > 0 && v1 === 0) ver.textContent = 'v2 (estavel)';
    else if (v2 > 0) ver.textContent = 'v1 -> v2 (em transicao)';
    else ver.textContent = 'v1 (estavel)';
  }
}
function startRollout() {
  if (rolloutState.phase !== 'idle') return;
  rolloutState.pods = [createPod('web-0','v1','v1'), createPod('web-1','v1','v1'), createPod('web-2','v1','v1')];
  rolloutState.phase = 'rolling'; rolloutState.time = 0;
  document.getElementById('rolloutDeployBtn').disabled = true;
  document.getElementById('rolloutRollbackBtn').disabled = true;
  document.getElementById('rolloutLog').innerHTML = '';
  rolloutLog('Iniciando rolling update: v1 -> v2', 'log-info');
  rolloutLog('maxSurge: 1, maxUnavailable: 0', 'log-info');
  setRolloutStatus('Rolling Update...', 'rolling');
  renderRolloutPods();
  let step = 0;
  rolloutState.interval = setInterval(function() {
    step++;
    switch(step) {
      case 1: rolloutLog('Criando novo Pod v2 (maxSurge=1)...', 'log-info'); rolloutState.pods.push(createPod('web-new','v2','starting')); break;
      case 2: rolloutLog('Pod web-new (v2) Running e Ready', 'log-success'); rolloutState.pods[rolloutState.pods.length-1].state='v2'; rolloutLog('Encerrando Pod antigo (web-0 v1)...', 'log-warn'); rolloutState.pods[0].state='terminating'; break;
      case 3: rolloutLog('Pod web-0 (v1) terminado. 2/3 v1, 1/3 v2', 'log-info'); rolloutState.pods.splice(0,1); rolloutLog('Criando novo Pod v2...', 'log-info'); rolloutState.pods.push(createPod('web-new2','v2','starting')); break;
      case 4: rolloutLog('Pod web-new2 (v2) Running e Ready', 'log-success'); rolloutState.pods[rolloutState.pods.length-1].state='v2'; rolloutLog('Encerrando Pod antigo (web-1 v1)...', 'log-warn'); rolloutState.pods[0].state='terminating'; break;
      case 5: rolloutLog('Pod web-1 (v1) terminado. 1/3 v1, 2/3 v2', 'log-info'); rolloutState.pods.splice(0,1); rolloutLog('Criando ultimo Pod v2...', 'log-info'); rolloutState.pods.push(createPod('web-new3','v2','starting')); break;
      case 6: rolloutLog('Pod web-new3 (v2) Running e Ready', 'log-success'); rolloutState.pods[rolloutState.pods.length-1].state='v2'; rolloutLog('Encerrando ultimo Pod v1 (web-2)...', 'log-warn'); rolloutState.pods[0].state='terminating'; break;
      case 7: rolloutLog('Pod web-2 (v1) terminado.', 'log-info'); rolloutState.pods.splice(0,1); break;
      case 8: clearInterval(rolloutState.interval); rolloutState.phase='deployed';
        rolloutLog('Rolling update concluido com sucesso!', 'log-success');
        rolloutLog('3/3 Pods rodando versao v2. Zero downtime garantido.', 'log-success');
        setRolloutStatus('Concluido', 'success');
        document.getElementById('rolloutDeployBtn').disabled=true;
        document.getElementById('rolloutRollbackBtn').disabled=false; break;
    }
    renderRolloutPods();
    if (step < 8) setRolloutStatus('Rolling Update...', 'rolling');
  }, 1500);
}
function rollbackRollout() {
  if (rolloutState.phase !== 'deployed') return;
  rolloutState.phase = 'rolling';
  document.getElementById('rolloutRollbackBtn').disabled = true;
  document.getElementById('rolloutDeployBtn').disabled = true;
  rolloutLog('Rollback para v1 iniciado...', 'log-warn');
  setRolloutStatus('Rollback...', 'rolling'); renderRolloutPods();
  let step = 0;
  rolloutState.interval = setInterval(function() {
    step++;
    switch(step) {
      case 1: rolloutLog('Criando Pod v1 (maxSurge=1)...', 'log-info'); rolloutState.pods.push(createPod('web-rb','v1','starting')); break;
      case 2: rolloutLog('Pod web-rb (v1) Ready', 'log-success'); rolloutState.pods[rolloutState.pods.length-1].state='v1'; let vi=-1; rolloutState.pods.forEach(function(p,i){if(p.version==='v2'&&vi===-1&&p.state==='v2')vi=i;}); if(vi>=0)rolloutState.pods[vi].state='terminating'; break;
      case 3: rolloutState.pods=rolloutState.pods.filter(function(p){return p.state!=='terminating';}); rolloutLog('Criando Pod v1 #2...', 'log-info'); rolloutState.pods.push(createPod('web-rb2','v1','starting')); break;
      case 4: rolloutLog('Pod web-rb2 (v1) Ready', 'log-success'); rolloutState.pods[rolloutState.pods.length-1].state='v1'; let vi2=-1; rolloutState.pods.forEach(function(p,i){if(p.version==='v2'&&vi2===-1&&p.state==='v2')vi2=i;}); if(vi2>=0)rolloutState.pods[vi2].state='terminating'; break;
      case 5: rolloutState.pods=rolloutState.pods.filter(function(p){return p.state!=='terminating';}); rolloutLog('Criando Pod v1 #3...', 'log-info'); rolloutState.pods.push(createPod('web-rb3','v1','starting')); break;
      case 6: rolloutLog('Pod web-rb3 (v1) Ready', 'log-success'); rolloutState.pods[rolloutState.pods.length-1].state='v1'; let vi3=-1; rolloutState.pods.forEach(function(p,i){if(p.version==='v2'&&vi3===-1&&p.state==='v2')vi3=i;}); if(vi3>=0)rolloutState.pods[vi3].state='terminating'; break;
      case 7: rolloutState.pods=rolloutState.pods.filter(function(p){return p.state!=='terminating';}); clearInterval(rolloutState.interval); rolloutState.phase='idle';
        rolloutLog('Rollback concluido! Todos os Pods na versao v1.', 'log-success');
        setRolloutStatus('Rollback Concluido', 'success');
        document.getElementById('rolloutDeployBtn').disabled=false;
        document.getElementById('rolloutRollbackBtn').disabled=true; break;
    }
    renderRolloutPods();
    if (step < 7) setRolloutStatus('Rollback...', 'rolling');
  }, 1200);
}
function resetRollout() {
  clearInterval(rolloutState.interval);
  rolloutState = { pods: [createPod('web-0','v1','v1'),createPod('web-1','v1','v1'),createPod('web-2','v1','v1')], phase: 'idle', time: 0, interval: null };
  document.getElementById('rolloutDeployBtn').disabled = false;
  document.getElementById('rolloutRollbackBtn').disabled = true;
  document.getElementById('rolloutLog').innerHTML = '<div><span class="log-time">[00:00]</span> <span class="log-info">Simulador resetado. 3 Pods rodando v1.</span></div>';
  setRolloutStatus('Pronto', 'pending'); renderRolloutPods();
}
function initRolloutSim() { resetRollout(); }


/* ===== INIT ON DOM READY ===== */
document.addEventListener('DOMContentLoaded', function() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  if (typeof restoreState === 'function') restoreState();
  if (typeof updateProgressUI === 'function') updateProgressUI();
  if (typeof checkAchievements === 'function') checkAchievements();
  if (typeof restoreChecklists === 'function') restoreChecklists();
  if (typeof renderLabs === 'function') renderLabs();
  if (typeof initTerminal === 'function') initTerminal();
  if (typeof initFlashcards === 'function') initFlashcards();
  if (typeof initRolloutSim === 'function') initRolloutSim();
  const t = document.getElementById('themeToggle'), h = document.documentElement;
  const saved = localStorage.getItem('k8s-theme') || 'dark';
  h.setAttribute('data-theme', saved);
  if (t) t.addEventListener('click', function() {
    const n = h.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    h.setAttribute('data-theme', n);
    localStorage.setItem('k8s-theme', n);
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  });
  const m = document.getElementById('menuToggle'), s = document.getElementById('sidebar'), o = document.getElementById('sidebarOverlay');
  function cs() { if(s) s.classList.remove('open'); if(o) o.classList.remove('open'); }
  if (m && s && o) {
    m.addEventListener('click', function() { s.classList.contains('open') ? cs() : (s.classList.add('open'), o.classList.add('open')); });
    o.addEventListener('click', cs);
  }
  const sb = document.getElementById('searchBtn');
  let sm = document.getElementById('searchModal');
  if (!sm) {
    sm = document.createElement('div'); sm.className = 'search-modal'; sm.id = 'searchModal';
    sm.innerHTML = '<div class="search-dialog"><div class="search-input-wrap"><span class="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span><input type="text" class="search-input" placeholder="Buscar seções…" autofocus></div><div class="search-results"></div></div>';
    document.body.appendChild(sm);
  }
  const si = sm ? sm.querySelector('.search-input') : null, sr = sm ? sm.querySelector('.search-results') : null;
  function os() {
    if (!sm) return; sm.classList.add('open');
    if (si) { si.value = ''; si.focus(); ps(''); }
    trapFocus(sm);
  }
  function cs2() {
    if (!sm) return; sm.classList.remove('open');
    releaseFocus(sm);
  }
  function performSearch(q) {
  // Forward to internal search function
  if (typeof ps === 'function') {
    ps(q);
  }
}

function ps(q) {
    if (!sr) return;
    const all = document.querySelectorAll('section[id]');
    if (!q || q.length < 1) {
      let h = '';
      all.forEach(function(sec) {
        const t = (sec.querySelector('h2')||sec.querySelector('h3')||sec.querySelector('h1')||{}).textContent||sec.id;
        h += '<a class="search-result" href="#'+sec.id+'" onclick="window.cs2&&cs2()"><span class="sr-title">'+t+'</span><span class="sr-section">#'+sec.id+'</span></a>';
      });
      sr.innerHTML = h || '<div class="search-empty">Nenhuma secao</div>'; return;
    }
    q = q.toLowerCase();
    let h = '', c = 0;
    all.forEach(function(sec) {
      if ((sec.textContent||'').toLowerCase().indexOf(q) > -1 && c < 20) {
        const t = (sec.querySelector('h2')||sec.querySelector('h3')||sec.querySelector('h1')||{}).textContent||sec.id;
        h += '<a class="search-result" href="#'+sec.id+'" onclick="window.cs2&&cs2()"><span class="sr-title">'+t+'</span><span class="sr-section">#'+sec.id+'</span></a>';
        c++;
      }
    });
    sr.innerHTML = h || '<div class="search-empty">Nenhum resultado</div>';
  }
  if (sb) sb.addEventListener('click', os);
  if (sm) {
    sm.addEventListener('click', function(e) { if (e.target === sm) cs2(); });
    if (si) {
      si.addEventListener('input', function() { ps(this.value); });
      si.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') cs2();
        if (e.key === 'Enter') { const f = sm.querySelector('.search-result.focused'); if (f) f.click(); else { const fi = sm.querySelector('.search-result'); if(fi) fi.click(); } }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const items = sm.querySelectorAll('.search-result');
          const f = sm.querySelector('.search-result.focused');
          const idx = Array.prototype.indexOf.call(items, f);
          if (e.key === 'ArrowDown') { const nxt = items[idx+1]||items[0]; if(f) f.classList.remove('focused'); if(nxt) nxt.classList.add('focused'); }
          else { const prv = items[idx-1]||items[items.length-1]; if(f) f.classList.remove('focused'); if(prv) prv.classList.add('focused'); }
        }
      });
    }
  }
  window.cs2 = cs2; window.closeSearch = cs2;
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey||e.metaKey) && e.key === 'k') { e.preventDefault(); os(); }
    if (e.key === 'Escape') {
      if (sm && sm.classList.contains('open')) cs2();
      const co = document.getElementById('certOverlay');
      if (co && co.classList.contains('open') && typeof closeCert === 'function') closeCert();
      const bo = document.getElementById('badgeOverlay');
      if (bo && bo.classList.contains('open') && typeof closeBadge === 'function') closeBadge();
    }
  });
  const pb = document.getElementById('progress-bar');
  if (pb) window.addEventListener('scroll', throttle(function() {
    const st = window.pageYOffset||document.documentElement.scrollTop;
    const dh = document.documentElement.scrollHeight - window.innerHeight;
    if (dh > 0) pb.style.width = Math.min(100, Math.round((st/dh)*100)) + '%';
  }, 16));
  let bt = document.querySelector('.back-to-top');
  if (!bt) {
    bt = document.createElement('button'); bt.className = 'back-to-top'; bt.setAttribute('aria-label', 'Voltar ao topo');
    bt.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(bt);
    bt.addEventListener('click', function() { window.scrollTo({top:0,behavior:'smooth'}); });
  }
  window.addEventListener('scroll', throttle(function() {
    bt.classList.toggle('visible', window.pageYOffset > 300);
  }, 100));
  const links = document.querySelectorAll('.sidebar-link'), secs = [];
  if (links.length) {
    links.forEach(function(l) {
      const hr = l.getAttribute('href');
      if (hr && hr.startsWith('#')) { const tg = document.getElementById(hr.substring(1)); if (tg) secs.push({el:tg,link:l}); }
    });
    function ual() {
      var sy = window.pageYOffset + 120, cur = null;
      secs.forEach(function(i) { var ot = i.el.offsetTop, ob = ot + i.el.offsetHeight; if (sy >= ot && sy < ob) cur = i.link; });
      links.forEach(function(l) { l.classList.remove('active'); });
      if (cur) cur.classList.add('active');
      else if (secs.length) secs[0].link.classList.add('active');
    }
    window.addEventListener('scroll', throttle(ual, 100)); ual();
  }
  const gs = document.querySelector('.glossary-search'), gi = document.querySelectorAll('.glossary-item');
  if (gs && gi.length) gs.addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    let count = 0;
    gi.forEach(function(i) {
      const match = i.textContent.toLowerCase().indexOf(q) > -1;
      i.style.display = match ? '' : 'none';
      if (match) count++;
    });
    let empty = document.getElementById('glossaryEmpty');
    if (q && count === 0) {
      if (!empty) {
        empty = document.createElement('p');
        empty.id = 'glossaryEmpty';
        empty.style.cssText = 'grid-column:1/-1;text-align:center;color:var(--text-muted);padding:32px;font-size:14px;';
        document.getElementById('glossaryGrid').appendChild(empty);
      }
      empty.textContent = 'Nenhum termo encontrado para "' + this.value + '"';
      empty.style.display = '';
    } else if (empty) {
      empty.style.display = 'none';
    }
  });
  /* SW registered via inline script in index.html */
});
