#!/usr/bin/env python3
"""Inject educational features into index.html: Terminal, YAML Explorer, Flashcards, Rollout Simulator"""
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ============================================================
# 1. CSS STYLES FOR ALL 4 FEATURES
# ============================================================
NEW_CSS = """
/* ===== TERMINAL SIMULATOR ===== */
.terminal-sim {
  background: #0a0e14; border: 1px solid var(--border); border-radius: var(--radius);
  margin: 20px 0; overflow: hidden; font-family: var(--font-mono);
}
.terminal-header {
  background: #161b22; padding: 8px 14px; display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid var(--border);
}
.terminal-dot { width: 12px; height: 12px; border-radius: 50%; }
.terminal-dot.red { background: #f85149; }
.terminal-dot.yellow { background: #d29922; }
.terminal-dot.green { background: #3fb950; }
.terminal-title { font-size: 12px; color: var(--text-muted); margin-left: 8px; }
.terminal-output {
  padding: 16px; max-height: 400px; overflow-y: auto; font-size: 13px;
  line-height: 1.6; color: #c9d1d9; min-height: 200px;
}
.terminal-output::-webkit-scrollbar { width: 6px; }
.terminal-output::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
.terminal-line { white-space: pre-wrap; word-break: break-all; }
.terminal-line.prompt-line { color: #3fb950; }
.terminal-line.output-line { color: #c9d1d9; }
.terminal-line.error-line { color: #f85149; }
.terminal-line.info-line { color: #58a6ff; }
.terminal-line.warning-line { color: #d29922; }
.terminal-input-row {
  display: flex; align-items: center; padding: 8px 16px 16px; gap: 8px;
  border-top: 1px solid #21262d;
}
.terminal-prompt { color: #3fb950; font-size: 13px; white-space: nowrap; }
.terminal-input {
  flex: 1; background: none; border: none; outline: none; color: #e6edf3;
  font-family: var(--font-mono); font-size: 13px; caret-color: #58a6ff;
}
.terminal-hint {
  font-size: 11px; color: var(--text-muted); padding: 0 16px 12px;
  display: flex; flex-wrap: wrap; gap: 6px;
}
.terminal-hint span {
  background: #161b22; border: 1px solid #30363d; padding: 2px 8px;
  border-radius: 4px; font-family: var(--font-mono); font-size: 11px; color: #8b949e;
  cursor: pointer; transition: all 0.2s;
}
.terminal-hint span:hover { border-color: var(--accent); color: var(--accent); }

/* ===== YAML EXPLORER ===== */
.yaml-explorer {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); margin: 20px 0; overflow: hidden;
}
.yaml-explorer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: var(--bg-tertiary); border-bottom: 1px solid var(--border);
}
.yaml-explorer-header h4 { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; margin: 0; }
.yaml-tabs { display: flex; gap: 4px; }
.yaml-tab {
  padding: 4px 12px; border-radius: var(--radius-sm); font-size: 12px;
  font-weight: 500; cursor: pointer; border: 1px solid transparent;
  background: none; color: var(--text-muted); transition: all 0.2s;
}
.yaml-tab:hover { color: var(--text-primary); }
.yaml-tab.active { background: var(--accent-subtle); color: var(--accent); border-color: rgba(88,166,255,0.3); }
.yaml-explorer-body { display: flex; min-height: 300px; }
.yaml-code-panel {
  flex: 1; padding: 16px; overflow-x: auto; font-family: var(--font-mono);
  font-size: 13px; line-height: 1.8; color: var(--text-primary);
  border-right: 1px solid var(--border); position: relative;
}
.yaml-key { color: #7ee787; cursor: pointer; position: relative; }
.yaml-key:hover { text-decoration: underline; text-decoration-style: dotted; }
.yaml-key.highlighted { background: rgba(88,166,255,0.15); border-radius: 2px; }
.yaml-str { color: #a5d6ff; }
.yaml-num { color: #79c0ff; }
.yaml-comment { color: #8b949e; font-style: italic; }
.yaml-doc-panel {
  width: 320px; padding: 16px; background: var(--bg-secondary);
  overflow-y: auto; font-size: 13px; color: var(--text-secondary);
}
.yaml-doc-panel h5 { font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
.yaml-doc-panel p { font-size: 13px; line-height: 1.6; margin-bottom: 8px; }
.yaml-doc-panel .yaml-doc-type {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  font-size: 11px; font-weight: 600; margin-bottom: 12px;
  background: var(--accent-subtle); color: var(--accent);
}
.yaml-doc-panel .yaml-doc-required { color: var(--red); font-weight: 600; }
.yaml-doc-panel .yaml-doc-optional { color: var(--text-muted); }
.yaml-doc-empty { color: var(--text-muted); font-style: italic; text-align: center; padding: 40px 16px; }
@media (max-width: 768px) {
  .yaml-explorer-body { flex-direction: column; }
  .yaml-doc-panel { width: 100%; border-right: none; border-top: 1px solid var(--border); max-height: 200px; }
}

/* ===== FLASHCARDS ===== */
.flashcard-area { margin: 20px 0; }
.flashcard-controls {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; flex-wrap: wrap; gap: 8px;
}
.flashcard-category-select {
  display: flex; gap: 4px; flex-wrap: wrap;
}
.flashcat-btn {
  padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
  border: 1px solid var(--border); background: var(--bg-card);
  color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
}
.flashcat-btn:hover { border-color: var(--accent); color: var(--accent); }
.flashcat-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.flashcard-progress-info { font-size: 12px; color: var(--text-muted); }
.flashcard-container { perspective: 1000px; height: 280px; margin-bottom: 16px; }
.flashcard {
  width: 100%; height: 100%; position: relative;
  transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.flashcard.flipped { transform: rotateY(180deg); }
.flashcard-face {
  position: absolute; inset: 0; backface-visibility: hidden;
  border-radius: var(--radius); padding: 32px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; border: 1px solid var(--border);
}
.flashcard-front {
  background: linear-gradient(135deg, var(--bg-card), var(--bg-secondary));
}
.flashcard-back {
  background: linear-gradient(135deg, rgba(88,166,255,0.05), rgba(188,140,255,0.05));
  transform: rotateY(180deg); border-color: var(--accent);
}
.flashcard-term {
  font-size: 22px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;
}
.flashcard-category-badge {
  font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 12px;
  background: var(--accent-subtle); color: var(--accent); margin-bottom: 12px;
}
.flashcard-definition { font-size: 15px; color: var(--text-secondary); line-height: 1.6; }
.flashcard-example {
  margin-top: 12px; padding: 8px 14px; background: var(--bg-code);
  border-radius: var(--radius-sm); font-family: var(--font-mono);
  font-size: 12px; color: var(--accent); border: 1px solid var(--border);
}
.flashcard-hint { font-size: 11px; color: var(--text-muted); margin-top: 12px; }
.flashcard-nav {
  display: flex; align-items: center; justify-content: center; gap: 12px;
}
.flashcard-nav button {
  padding: 8px 20px; border-radius: var(--radius-sm); font-size: 13px;
  font-weight: 600; cursor: pointer; border: 1px solid var(--border);
  background: var(--bg-card); color: var(--text-secondary); transition: all 0.2s;
}
.flashcard-nav button:hover { border-color: var(--accent); color: var(--accent); }
.flashcard-nav button:disabled { opacity: 0.4; cursor: not-allowed; }
.flashcard-nav .fc-counter { font-size: 13px; color: var(--text-muted); font-weight: 600; min-width: 60px; text-align: center; }
.flashcard-nav .fc-know { background: var(--green-subtle); color: var(--green); border-color: var(--green); }
.flashcard-nav .fc-know:hover { background: var(--green); color: #fff; }
.flashcard-nav .fc-dunno { background: var(--red-subtle); color: var(--red); border-color: var(--red); }
.flashcard-nav .fc-dunno:hover { background: var(--red); color: #fff; }

/* ===== ROLLOUT SIMULATOR ===== */
.rollout-sim {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 24px; margin: 20px 0;
}
.rollout-sim h4 { font-size: 16px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.rollout-status-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; background: var(--bg-tertiary); border-radius: var(--radius-sm);
  margin-bottom: 16px; font-size: 13px; flex-wrap: wrap; gap: 8px;
}
.rollout-status-bar .rs-label { color: var(--text-muted); }
.rollout-status-bar .rs-value { font-weight: 600; }
.rollout-status-bar .rs-value.rolling { color: var(--orange); }
.rollout-status-bar .rs-value.success { color: var(--green); }
.rollout-status-bar .rs-value.failed { color: var(--red); }
.rollout-status-bar .rs-value.pending { color: var(--text-muted); }
.rollout-pods-area {
  display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
  padding: 20px; min-height: 100px; margin-bottom: 16px;
}
.rollout-pod {
  width: 80px; height: 80px; border-radius: var(--radius);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 600; transition: all 0.5s ease;
  border: 2px solid transparent; position: relative;
}
.rollout-pod .pod-icon { font-size: 24px; margin-bottom: 4px; }
.rollout-pod .pod-label { font-family: var(--font-mono); font-size: 10px; }
.rollout-pod.v1 {
  background: rgba(63,185,80,0.15); border-color: var(--green); color: var(--green);
}
.rollout-pod.v2 {
  background: rgba(88,166,255,0.15); border-color: var(--accent); color: var(--accent);
}
.rollout-pod.starting {
  background: rgba(210,153,34,0.15); border-color: var(--orange); color: var(--orange);
  animation: pod-pulse 1s ease-in-out infinite;
}
.rollout-pod.terminating {
  background: rgba(248,81,73,0.1); border-color: var(--red); color: var(--red);
  opacity: 0.6; animation: pod-fade 0.8s ease-in-out infinite;
}
@keyframes pod-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
@keyframes pod-fade {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.3; }
}
.rollout-controls {
  display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
}
.rollout-btn {
  padding: 10px 20px; border-radius: var(--radius-sm); font-size: 13px;
  font-weight: 600; cursor: pointer; border: 1px solid var(--border);
  background: var(--bg-card); color: var(--text-secondary); transition: all 0.2s;
  display: flex; align-items: center; gap: 6px;
}
.rollout-btn:hover { border-color: var(--accent); color: var(--accent); }
.rollout-btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.rollout-btn.primary:hover { opacity: 0.9; }
.rollout-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.rollout-btn.danger { border-color: var(--red); color: var(--red); }
.rollout-btn.danger:hover { background: var(--red); color: #fff; }
.rollout-log {
  margin-top: 16px; padding: 12px 16px; background: var(--bg-code);
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  font-family: var(--font-mono); font-size: 12px; line-height: 1.8;
  max-height: 200px; overflow-y: auto; color: var(--text-secondary);
}
.rollout-log .log-time { color: var(--text-muted); }
.rollout-log .log-info { color: var(--accent); }
.rollout-log .log-success { color: var(--green); }
.rollout-log .log-warn { color: var(--orange); }
.rollout-log .log-error { color: var(--red); }
"""

# ============================================================
# 2. SIDEBAR LINKS
# ============================================================
NEW_SIDEBAR = """
    <div class="sidebar-section">
      <div class="sidebar-section-title">Ferramentas Interativas</div>
      <a class="sidebar-link" href="#terminal-sim"><span class="icon"><i data-lucide="terminal" class="icon-svg"></i></span> Terminal Simulado</a>
      <a class="sidebar-link" href="#yaml-explorer"><span class="icon"><i data-lucide="file-code" class="icon-svg"></i></span> Explorador YAML</a>
      <a class="sidebar-link" href="#flashcards"><span class="icon"><i data-lucide="layers" class="icon-svg"></i></span> Flashcards</a>
      <a class="sidebar-link" href="#rollout-sim"><span class="icon"><i data-lucide="play-circle" class="icon-svg"></i></span> Simulador Rollout</a>
    </div>"""

# ============================================================
# 3. HTML SECTIONS (before <script>)
# ============================================================
NEW_SECTIONS = """
<!-- ==================== TERMINAL SIMULADO ==================== -->
<section class="section" id="terminal-sim">
  <h2><span class="sec-icon" style="background:var(--green-subtle);color:var(--green);"><i data-lucide="terminal" class="icon-svg"></i></span> Terminal Simulado</h2>
  <p>Pratique comandos essenciais de Kubernetes sem precisar de um cluster. Este terminal simula respostas realistas para comandos comuns.</p>

  <div class="terminal-sim" id="terminalSim">
    <div class="terminal-header">
      <span class="terminal-dot red"></span>
      <span class="terminal-dot yellow"></span>
      <span class="terminal-dot green"></span>
      <span class="terminal-title">kubectl-terminal — bash</span>
    </div>
    <div class="terminal-output" id="terminalOutput">
      <div class="terminal-line info-line">Bem-vindo ao Terminal Simulado de Kubernetes!</div>
      <div class="terminal-line info-line">Digite um comando kubectl, helm ou digite "help" para ver os comandos disponíveis.</div>
      <div class="terminal-line output-line"></div>
    </div>
    <div class="terminal-hint">
      <span onclick="terminalInsert(this.textContent)">kubectl get pods</span>
      <span onclick="terminalInsert(this.textContent)">kubectl get nodes</span>
      <span onclick="terminalInsert(this.textContent)">kubectl get svc</span>
      <span onclick="terminalInsert(this.textContent)">kubectl get deployments</span>
      <span onclick="terminalInsert(this.textContent)">kubectl describe pod</span>
      <span onclick="terminalInsert(this.textContent)">kubectl logs web-0</span>
      <span onclick="terminalInsert(this.textContent)">kubectl apply -f app.yaml</span>
      <span onclick="terminalInsert(this.textContent)">kubectl rollout status deploy/web</span>
      <span onclick="terminalInsert(this.textContent)">kubectl rollout undo deploy/web</span>
      <span onclick="terminalInsert(this.textContent)">helm list</span>
    </div>
    <div class="terminal-input-row">
      <span class="terminal-prompt">user@k8s-lab:~$</span>
      <input type="text" class="terminal-input" id="terminalInput" placeholder="Digite um comando..." autofocus autocomplete="off" spellcheck="false">
    </div>
  </div>

  <div class="alert tip">
    <span class="alert-icon"><i data-lucide="lightbulb" class="icon-svg"></i></span>
    <div class="alert-content"><strong>Dica:</strong> Tente comandos como <code>kubectl get pods -A</code>, <code>kubectl describe pod web-0</code>, ou <code>kubectl logs frontend-abc123</code>. Pressione Enter para executar e ↑/↓ para navegar no histórico.</div>
  </div>
</section>

<!-- ==================== EXPLORADOR DE YAML ==================== -->
<section class="section" id="yaml-explorer">
  <h2><span class="sec-icon" style="background:var(--purple-subtle);color:var(--purple);"><i data-lucide="file-code" class="icon-svg"></i></span> Explorador de YAML</h2>
  <p>Clique em qualquer campo-chave do manifesto para ver sua documentação, tipo e se é obrigatório. Entenda cada linha de um manifesto Kubernetes.</p>

  <div class="yaml-explorer" id="yamlExplorer">
    <div class="yaml-explorer-header">
      <h4><i data-lucide="file-code" class="icon-svg"></i> Explorador de Manifesto</h4>
      <div class="yaml-tabs">
        <button class="yaml-tab active" onclick="switchYamlTab('deployment', this)">Deployment</button>
        <button class="yaml-tab" onclick="switchYamlTab('service', this)">Service</button>
        <button class="yaml-tab" onclick="switchYamlTab('ingress', this)">Ingress</button>
      </div>
    </div>
    <div class="yaml-explorer-body">
      <div class="yaml-code-panel" id="yamlCodePanel"></div>
      <div class="yaml-doc-panel" id="yamlDocPanel">
        <div class="yaml-doc-empty">👆 Clique em um campo-chave do YAML à esquerda para ver a documentação</div>
      </div>
    </div>
  </div>
</section>

<!-- ==================== FLASHCARDS ==================== -->
<section class="section" id="flashcards">
  <h2><span class="sec-icon" style="background:var(--accent-subtle);color:var(--accent);"><i data-lucide="layers" class="icon-svg"></i></span> Flashcards</h2>
  <p>Revise conceitos essenciais com flashcards interativos. Clique na cartinha para ver a resposta e marque se você acertou ou não.</p>

  <div class="flashcard-area" id="flashcardArea">
    <div class="flashcard-controls">
      <div class="flashcard-category-select" id="flashcardCats"></div>
      <div class="flashcard-progress-info" id="flashcardProgress"></div>
    </div>
    <div class="flashcard-container">
      <div class="flashcard" id="flashcard" onclick="flipFlashcard()">
        <div class="flashcard-face flashcard-front" id="flashcardFront">
          <div class="flashcard-category-badge" id="flashcardCat"></div>
          <div class="flashcard-term" id="flashcardTerm"></div>
          <div class="flashcard-hint">Clique para ver a resposta</div>
        </div>
        <div class="flashcard-face flashcard-back" id="flashcardBack">
          <div class="flashcard-category-badge" id="flashcardCatBack"></div>
          <div class="flashcard-definition" id="flashcardDef"></div>
          <div class="flashcard-example" id="flashcardExample" style="display:none"></div>
        </div>
      </div>
    </div>
    <div class="flashcard-nav">
      <button class="fc-dunno" onclick="rateFlashcard(false)" id="fcDunnoBtn">✗ Não sei</button>
      <button onclick="prevFlashcard()" id="fcPrevBtn">← Anterior</button>
      <span class="fc-counter" id="fcCounter">1 / 10</span>
      <button onclick="nextFlashcard()" id="fcNextBtn">Próximo →</button>
      <button class="fc-know" onclick="rateFlashcard(true)" id="fcKnowBtn">✓ Sei</button>
    </div>
  </div>
</section>

<!-- ==================== SIMULADOR DE ROLLOUT ==================== -->
<section class="section" id="rollout-sim">
  <h2><span class="sec-icon" style="background:var(--orange-subtle);color:var(--orange);"><i data-lucide="play-circle" class="icon-svg"></i></span> Simulador de Rollout</h2>
  <p>Visualize como funciona um rolling update no Kubernetes. Execute um deploy da versão 1 para a versão 2 e observe o ciclo de vida dos Pods em tempo real.</p>

  <div class="rollout-sim" id="rolloutSim">
    <h4><i data-lucide="play-circle" class="icon-svg"></i> Rolling Update — Deploy v1 → v2</h4>
    <div class="rollout-status-bar">
      <div><span class="rs-label">Status:</span> <span class="rs-value pending" id="rolloutStatus">Pronto</span></div>
      <div><span class="rs-label">Versão:</span> <span class="rs-value" id="rolloutVersion">v1 (estável)</span></div>
      <div><span class="rs-label">Pods v1:</span> <span class="rs-value" id="rolloutV1Count">3</span></div>
      <div><span class="rs-label">Pods v2:</span> <span class="rs-value" id="rolloutV2Count">0</span></div>
    </div>
    <div class="rollout-pods-area" id="rolloutPodsArea"></div>
    <div class="rollout-controls">
      <button class="rollout-btn primary" id="rolloutDeployBtn" onclick="startRollout()">🚀 Deploy v2</button>
      <button class="rollout-btn danger" id="rolloutRollbackBtn" onclick="rollbackRollout()" disabled>⏪ Rollback para v1</button>
      <button class="rollout-btn" onclick="resetRollout()">🔄 Resetar</button>
    </div>
    <div class="rollout-log" id="rolloutLog">
      <div><span class="log-time">[00:00]</span> <span class="log-info">Simulador pronto. Clique em "Deploy v2" para iniciar um rolling update.</span></div>
    </div>
  </div>

  <div class="alert info">
    <span class="alert-icon"><i data-lucide="info" class="icon-svg"></i></span>
    <div class="alert-content"><strong>Como funciona:</strong> O Kubernetes substitui Pods antigos por novos gradualmente (controlled by <code>maxSurge</code> e <code>maxUnavailable</code>). Observe como os Pods são criados e encerrados um a um, garantindo zero downtime.</div>
  </div>
</section>"""

# ============================================================
# 4. JAVASCRIPT (before DOMContentLoaded)
# ============================================================
NEW_JS = r"""
/* ===== TERMINAL SIMULATOR ===== */
var termHistory = [], termHistIdx = -1;
var termOutput, termInput;
function terminalInsert(cmd) {
  if (termInput) { termInput.value = cmd; termInput.focus(); }
}
function termPrint(text, cls) {
  if (!termOutput) return;
  var d = document.createElement('div');
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
  var c = cmd.trim().toLowerCase();
  if (c === 'help') {
    termPrint('Comandos disponíveis:', 'info-line');
    termPrint('  kubectl get pods|nodes|svc|deployments|configmaps [-A] [-n namespace]', '');
    termPrint('  kubectl describe pod|svc|node <name>', '');
    termPrint('  kubectl logs <pod-name> [-f]', '');
    termPrint('  kubectl apply -f <file.yaml>', '');
    termPrint('  kubectl delete -f <file.yaml>', '');
    termPrint('  kubectl rollout status|history|undo deploy/<name>', '');
    termPrint('  kubectl exec -it <pod> -- /bin/sh', '');
    termPrint('  helm list|install|upgrade|rollback|uninstall', '');
    termPrint('  kubectl kustomize <path>', '');
    termPrint('  clear — limpar terminal', '');
    termPrint('  help — mostrar esta ajuda', '');
    return;
  }
  if (c === 'clear') { termOutput.innerHTML = ''; return; }
  // kubectl get
  if (c.match(/^kubectl get pods/)) {
    var all = c.includes('-a');
    var ns = c.match(/-n\s+(\S+)/);
    termPrint('NAME                    READY   STATUS    RESTARTS   AGE', 'output-line');
    termPrint('frontend-abc123         1/1     Running   0          2d', 'output-line');
    termPrint('backend-def456          1/1     Running   0          2d', 'output-line');
    termPrint('backend-ghi789          1/1     Running   0          2d', 'output-line');
    if (all) termPrint('db-migration-jkl012     0/1     Completed 0          1h', 'output-line');
    if (ns) termPrint('--- Listando pods no namespace: ' + ns[1], 'info-line');
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
    termPrint('default-token     kubernetes.io/service-account-token   3   30d', 'output-line');
    return;
  }
  if (c.match(/^kubectl get ingress/)) {
    termPrint('NAME             CLASS     HOSTS              ADDRESS         PORTS     AGE', 'output-line');
    termPrint('web-ingress      traefik   app.example.com    192.168.1.100   80, 443   2d', 'output-line');
    return;
  }
  if (c.match(/^kubectl get/)) {
    termPrint('error: the server doesn\'t have a resource type ""', 'error-line');
    termPrint('Use: kubectl get pods|nodes|svc|deployments', 'info-line');
    return;
  }
  // describe
  if (c.match(/^kubectl describe pod\s+(\S+)/)) {
    var pod = cmd.match(/describe pod\s+(\S+)/)[1];
    termPrint('Name:             ' + pod, 'output-line');
    termPrint('Namespace:        default', 'output-line');
    termPrint('Priority:         0', 'output-line');
    termPrint('Service Account:  default', 'output-line');
    termPrint('Node:             worker1/192.168.1.101', 'output-line');
    termPrint('Start Time:       Mon, 08 Jul 2026 10:00:00 +0000', 'output-line');
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
    termPrint('  Type    Reason     Age   From               Message', 'output-line');
    termPrint('  ----    ------     ----  ----               -------', 'output-line');
    termPrint('  Normal  Scheduled  2d    default-scheduler  Successfully assigned default/' + pod + ' to worker1', 'output-line');
    termPrint('  Normal  Pulled     2d    kubelet            Container image already present', 'output-line');
    termPrint('  Normal  Created    2d    kubelet            Created container', 'output-line');
    termPrint('  Normal  Started    2d    kubelet            Started container', 'output-line');
    return;
  }
  if (c.match(/^kubectl describe/)) {
    termPrint('Error: specify a resource and name (e.g., kubectl describe pod <name>)', 'error-line');
    return;
  }
  // logs
  if (c.match(/^kubectl logs\s+(\S+)/)) {
    var pod = cmd.match(/logs\s+(\S+)/)[1];
    termPrint('[' + pod + '] 2026-07-10T12:00:01Z INFO  Server starting on :8080', 'output-line');
    termPrint('[' + pod + '] 2026-07-10T12:00:01Z INFO  Connected to database', 'output-line');
    termPrint('[' + pod + '] 2026-07-10T12:00:02Z INFO  Health check endpoint ready at /healthz', 'output-line');
    termPrint('[' + pod + '] 2026-07-10T12:00:15Z INFO  GET /api/status 200 12ms', 'output-line');
    termPrint('[' + pod + '] 2026-07-10T12:00:30Z INFO  GET /api/status 200 8ms', 'output-line');
    if (c.includes('-f')) termPrint('Tailing logs... (Ctrl+C to stop)', 'info-line');
    return;
  }
  // apply
  if (c.match(/^kubectl apply -f/)) {
    var file = cmd.match(/apply -f\s+(\S+)/);
    var name = file ? file[1] : 'resource';
    termPrint('deployment.apps/frontend configured', 'output-line');
    termPrint('service/frontend created', 'output-line');
    termPrint('ingress.networking.k8s.io/web-ingress created', 'output-line');
    return;
  }
  // delete
  if (c.match(/^kubectl delete/)) {
    termPrint('deployment.apps/frontend deleted', 'output-line');
    termPrint('service/frontend deleted', 'output-line');
    return;
  }
  // rollout
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
    termPrint('Rollback para revisão anterior iniciado.', 'info-line');
    return;
  }
  // helm
  if (c === 'helm list') {
    termPrint('NAME            NAMESPACE  REVISION  UPDATED                                 STATUS    CHART               APP VERSION', 'output-line');
    termPrint('traefik         kube-system 1         2026-07-08 10:00:00.000000000 +0000 UTC deployed  traefik-25.0.0     v3.0', 'output-line');
    termPrint('postgres        default     1         2026-07-08 11:00:00.000000000 +0000 UTC deployed  postgresql-13.2.0  16.1', 'output-line');
    return;
  }
  if (c.match(/^helm install/)) {
    termPrint('"app" has been installed. 🎉', 'success-line');
    termPrint('NAME: app', 'output-line');
    termPrint('LAST DEPLOYED: Mon Jul 10 12:00:00 2026', 'output-line');
    termPrint('NAMESPACE: default', 'output-line');
    termPrint('STATUS: deployed', 'output-line');
    return;
  }
  if (c.match(/^helm upgrade/)) {
    termPrint('"app" has been upgraded. 🎉', 'success-line');
    termPrint('STATUS: deployed', 'output-line');
    return;
  }
  if (c.match(/^helm rollback/)) {
    termPrint('Rollback "app" has been rolled back. 🎉', 'success-line');
    return;
  }
  if (c.match(/^helm uninstall/)) {
    termPrint('"app" has been uninstalled. 🗑️', 'info-line');
    return;
  }
  // kustomize
  if (c.match(/kustomize/)) {
    termPrint('apiVersion: apps/v1', 'output-line');
    termPrint('kind: Deployment', 'output-line');
    termPrint('metadata:', 'output-line');
    termPrint('  name: frontend', 'output-line');
    termPrint('  namespace: production', 'output-line');
    termPrint('spec:', 'output-line');
    termPrint('  replicas: 3', 'output-line');
    termPrint('  ...', 'output-line');
    return;
  }
  // exec
  if (c.match(/^kubectl exec/)) {
    termPrint('$ (sessão interativa simulada)', 'info-line');
    termPrint('root@frontend-abc123:/app# ls', 'output-line');
    termPrint('Dockerfile  README.md  app.js  package.json  node_modules', 'output-line');
    termPrint('root@frontend-abc123:/app# exit', 'info-line');
    return;
  }
  // unknown
  termPrint('bash: ' + cmd.split(' ')[0] + ': comando não encontrado', 'error-line');
  termPrint('Digite "help" para ver os comandos disponíveis.', 'info-line');
}

function initTerminal() {
  termOutput = document.getElementById('terminalOutput');
  termInput = document.getElementById('terminalInput');
  if (!termInput) return;
  termInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      var cmd = this.value;
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
var yamlDocs = {
  apiVersion: { title: 'apiVersion', type: 'string', required: true, desc: 'A versão da API do Kubernetes que define o tipo de recurso. Exemplos: apps/v1, v1, networking.k8s.io/v1.' },
  kind: { title: 'kind', type: 'string', required: true, desc: 'O tipo de recurso Kubernetes. Exemplos: Deployment, Service, Pod, ConfigMap, Ingress.' },
  metadata: { title: 'metadata', type: 'object', required: true, desc: 'Dados de identificação do recurso: nome, namespace, labels e annotations.' },
  name: { title: 'name', type: 'string', required: true, desc: 'Nome único do recurso dentro do namespace. Deve ser RFC 1123 compliant: minúsculas, números e hífens.' },
  namespace: { title: 'namespace', type: 'string', required: false, desc: 'Namespace onde o recurso será criado. Default: "default". Usado para isolar ambientes.' },
  labels: { title: 'labels', type: 'map[string]string', required: false, desc: 'Pares chave=valor para organização e seleção. Ex: app=frontend, tier=web. Usados por Services e Selectors.' },
  annotations: { title: 'annotations', type: 'map[string]string', required: false, desc: 'Metadados não-identificadores. Usados por ferramentas como Ingress, cert-manager, Prometheus.' },
  spec: { title: 'spec', type: 'object', required: true, desc: 'O estado desejado do recurso. O control plane tenta manter este estado. Conteúdo varia por kind.' },
  selector: { title: 'selector', type: 'object', required: true, desc: 'Define como o controlador encontra os Pods que gerencia. Deve coincidir com os labels dos Pods.' },
  matchLabels: { title: 'matchLabels', type: 'map', required: true, desc: 'Mapa chave=valor. Todos os labels devem coincidir com os labels do Pod para selecioná-lo.' },
  template: { title: 'template', type: 'PodTemplateSpec', required: true, desc: 'Template do Pod que o Deployment cria. Contém metadata (labels) e spec do Pod.' },
  replicas: { title: 'replicas', type: 'integer', required: false, desc: 'Número desejado de réplicas do Pod. Default: 1. O controlador mantém este número.' },
  containers: { title: 'containers', type: '[]Container', required: true, desc: 'Lista de containers no Pod. Pelo menos um container principal é obrigatório.' },
  image: { title: 'image', type: 'string', required: true, desc: 'Imagem do container (ex: nginx:1.25, ghcr.io/org/app:v1). Preferir tags versionadas em produção.' },
  ports: { title: 'ports', type: '[]ContainerPort', required: false, desc: 'Portas que o container expõe. Não controla acesso externo — apenas documentação.' },
  containerPort: { title: 'containerPort', type: 'integer', required: true, desc: 'Porta TCP/UDP que o container escuta. Deve ser 1-65535.' },
  resources: { title: 'resources', type: 'object', required: false, desc: 'Limites e requests de CPU/memória. CRÍTICO para estabilidade do cluster.' },
  requests: { title: 'requests', type: 'ResourceList', required: false, desc: 'Recursos mínimos garantidos ao Pod. O scheduler usa para decisões de placement.' },
  limits: { title: 'limits', type: 'ResourceList', required: false, desc: 'Recursos máximos que o Pod pode usar. Exceder memória limit = OOMKill.' },
  type: { title: 'type', type: 'string', required: true, desc: 'Tipo do Service: ClusterIP (interno), NodePort (exposição direta), LoadBalancer (cloud), ExternalName (alias DNS).' },
  clusterIP: { title: 'clusterIP', type: 'string', required: false, desc: 'IP interno do cluster. "None" cria headless service. Default: IP automático.' },
  selector_service: { title: 'selector', type: 'map[string]string', required: true, desc: 'Labels para selecionar Pods que o Service roteia. Deve coincidir com labels dos Pods.' },
  path: { title: 'path', type: 'string', required: true, desc: 'Caminho da URL (ex: /, /api, /static). Pode ser prefixo ou match exato.' },
  pathType: { title: 'pathType', type: 'string', required: true, desc: 'Prefix: /api casa com /api e /api/v1. Exact: /api casa apenas com /api. ImplementationSpecific.' },
  backend: { title: 'backend', type: 'IngressBackend', required: true, desc: 'Define o Service e porta de destino para o tráfego desta regra.' },
  service: { title: 'service', type: 'ObjectReference', required: true, desc: 'Referência ao Service de destino com nome e porta.' },
  tls: { title: 'tls', type: '[]IngressTLS', required: false, desc: 'Configuração TLS/HTTPS. Lista de hosts e segredo com certificado.' },
};

var yamlData = {
  deployment: {
    raw: `<span class="yaml-key" onclick="showYamlDoc('apiVersion')">apiVersion</span>: <span class="yaml-str">apps/v1</span>
<span class="yaml-key" onclick="showYamlDoc('kind')">kind</span>: <span class="yaml-str">Deployment</span>
<span class="yaml-key" onclick="showYamlDoc('metadata')">metadata</span>:
  <span class="yaml-key" onclick="showYamlDoc('name')">name</span>: <span class="yaml-str">frontend</span>
  <span class="yaml-key" onclick="showYamlDoc('namespace')">namespace</span>: <span class="yaml-str">default</span>
  <span class="yaml-key" onclick="showYamlDoc('labels')">labels</span>:
    <span class="yaml-key">app</span>: <span class="yaml-str">frontend</span>
    <span class="yaml-key">tier</span>: <span class="yaml-str">web</span>
<span class="yaml-key" onclick="showYamlDoc('spec')">spec</span>:
  <span class="yaml-key" onclick="showYamlDoc('replicas')">replicas</span>: <span class="yaml-num">3</span>
  <span class="yaml-key" onclick="showYamlDoc('selector')">selector</span>:
    <span class="yaml-key" onclick="showYamlDoc('matchLabels')">matchLabels</span>:
      <span class="yaml-key">app</span>: <span class="yaml-str">frontend</span>
  <span class="yaml-key" onclick="showYamlDoc('template')">template</span>:
    <span class="yaml-key" onclick="showYamlDoc('metadata')">metadata</span>:
      <span class="yaml-key" onclick="showYamlDoc('labels')">labels</span>:
        <span class="yaml-key">app</span>: <span class="yaml-str">frontend</span>
        <span class="yaml-key">tier</span>: <span class="yaml-str">web</span>
    <span class="yaml-key" onclick="showYamlDoc('spec')">spec</span>:
      <span class="yaml-key" onclick="showYamlDoc('containers')">containers</span>:
        - <span class="yaml-key">name</span>: <span class="yaml-str">frontend</span>
          <span class="yaml-key" onclick="showYamlDoc('image')">image</span>: <span class="yaml-str">ghcr.io/org/frontend:v1.2.0</span>
          <span class="yaml-key" onclick="showYamlDoc('ports')">ports</span>:
            - <span class="yaml-key" onclick="showYamlDoc('containerPort')">containerPort</span>: <span class="yaml-num">8080</span>
          <span class="yaml-key" onclick="showYamlDoc('resources')">resources</span>:
            <span class="yaml-key" onclick="showYamlDoc('requests')">requests</span>:
              <span class="yaml-key">cpu</span>: <span class="yaml-str">100m</span>
              <span class="yaml-key">memory</span>: <span class="yaml-str">128Mi</span>
            <span class="yaml-key" onclick="showYamlDoc('limits')">limits</span>:
              <span class="yaml-key">cpu</span>: <span class="yaml-str">200m</span>
              <span class="yaml-key">memory</span>: <span class="yaml-str">256Mi</span>`,
  },
  service: {
    raw: `<span class="yaml-key" onclick="showYamlDoc('apiVersion')">apiVersion</span>: <span class="yaml-str">v1</span>
<span class="yaml-key" onclick="showYamlDoc('kind')">kind</span>: <span class="yaml-str">Service</span>
<span class="yaml-key" onclick="showYamlDoc('metadata')">metadata</span>:
  <span class="yaml-key" onclick="showYamlDoc('name')">name</span>: <span class="yaml-str">frontend</span>
<span class="yaml-key" onclick="showYamlDoc('spec')">spec</span>:
  <span class="yaml-key" onclick="showYamlDoc('type')">type</span>: <span class="yaml-str">ClusterIP</span>
  <span class="yaml-key" onclick="showYamlDoc('selector_service')">selector</span>:
    <span class="yaml-key">app</span>: <span class="yaml-str">frontend</span>
  <span class="yaml-key" onclick="showYamlDoc('ports')">ports</span>:
    - <span class="yaml-key">protocol</span>: <span class="yaml-str">TCP</span>
      <span class="yaml-key" onclick="showYamlDoc('port')">port</span>: <span class="yaml-num">80</span>
      <span class="yaml-key" onclick="showYamlDoc('targetPort')">targetPort</span>: <span class="yaml-num">8080</span>`,
  },
  ingress: {
    raw: `<span class="yaml-key" onclick="showYamlDoc('apiVersion')">apiVersion</span>: <span class="yaml-str">networking.k8s.io/v1</span>
<span class="yaml-key" onclick="showYamlDoc('kind')">kind</span>: <span class="yaml-str">Ingress</span>
<span class="yaml-key" onclick="showYamlDoc('metadata')">metadata</span>:
  <span class="yaml-key" onclick="showYamlDoc('name')">name</span>: <span class="yaml-str">web-ingress</span>
  <span class="yaml-key" onclick="showYamlDoc('annotations')">annotations</span>:
    <span class="yaml-key">traefik.ingress.kubernetes.io/router.entrypoints</span>: <span class="yaml-str">websecure</span>
<span class="yaml-key" onclick="showYamlDoc('spec')">spec</span>:
  <span class="yaml-key">ingressClassName</span>: <span class="yaml-str">traefik</span>
  <span class="yaml-key" onclick="showYamlDoc('tls')">tls</span>:
    - <span class="yaml-key">hosts</span>:
        - <span class="yaml-str">app.example.com</span>
      <span class="yaml-key">secretName</span>: <span class="yaml-str">tls-cert</span>
  <span class="yaml-key">rules</span>:
    - <span class="yaml-key">host</span>: <span class="yaml-str">app.example.com</span>
      <span class="yaml-key">http</span>:
        <span class="yaml-key">paths</span>:
          - <span class="yaml-key" onclick="showYamlDoc('path')">path</span>: <span class="yaml-str">/</span>
            <span class="yaml-key" onclick="showYamlDoc('pathType')">pathType</span>: <span class="yaml-str">Prefix</span>
            <span class="yaml-key" onclick="showYamlDoc('backend')">backend</span>:
              <span class="yaml-key" onclick="showYamlDoc('service')">service</span>:
                <span class="yaml-key">name</span>: <span class="yaml-str">frontend</span>
                <span class="yaml-key" onclick="showYamlDoc('port')">port</span>:
                  <span class="yaml-key">number</span>: <span class="yaml-num">80</span>`,
  },
};

function showYamlDoc(key) {
  var panel = document.getElementById('yamlDocPanel');
  if (!panel) return;
  var doc = yamlDocs[key];
  // Remove previous highlights
  var prev = document.querySelectorAll('.yaml-key.highlighted');
  prev.forEach(function(p) { p.classList.remove('highlighted'); });
  // Highlight current key
  var keys = document.querySelectorAll('.yaml-key');
  keys.forEach(function(k) { if (k.textContent.trim() === key || k.getAttribute('onclick') === "showYamlDoc('" + key + "')") k.classList.add('highlighted'); });
  if (!doc) {
    panel.innerHTML = '<div class="yaml-doc-empty">Sem documentação disponível para "' + key + '"</div>';
    return;
  }
  panel.innerHTML = '<h5>' + doc.title + '</h5>'
    + '<div class="yaml-doc-type">' + doc.type + '</div> '
    + (doc.required ? '<span class="yaml-doc-required">● Obrigatório</span>' : '<span class="yaml-doc-optional">● Opcional</span>')
    + '<p>' + doc.desc + '</p>';
}
function switchYamlTab(tab, btn) {
  document.querySelectorAll('.yaml-tab').forEach(function(t) { t.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  var panel = document.getElementById('yamlCodePanel');
  if (panel && yamlData[tab]) {
    panel.innerHTML = '<pre style="margin:0;background:none;border:none;padding:0;font-family:inherit;font-size:inherit;color:inherit;line-height:1.8;">' + yamlData[tab].raw + '</pre>';
  }
  var docPanel = document.getElementById('yamlDocPanel');
  if (docPanel) docPanel.innerHTML = '<div class="yaml-doc-empty">👆 Clique em um campo-chave do YAML à esquerda para ver a documentação</div>';
}

/* ===== FLASHCARDS ===== */
var flashcardData = [
  { term: 'Pod', cat: 'Recursos', def: 'A menor unidade implantável no Kubernetes. Contém um ou mais containers que compartilham rede e storage.', example: 'kubectl get pods' },
  { term: 'Deployment', cat: 'Recursos', def: 'Controlador que mantém N réplicas de Pods. Gerencia ReplicaSets e realiza rolling updates.', example: 'kubectl create deploy web --image=nginx' },
  { term: 'Service', cat: 'Recursos', def: 'Endereço estável e IP fixo que roteia tráfego para um conjunto de Pods selecionados por labels.', example: 'kubectl expose deploy web --port=80' },
  { term: 'Ingress', cat: 'Recursos', def: 'Regra HTTP/HTTPS que roteia tráfego externo para Services baseado em host e path.', example: 'kubectl apply -f ingress.yaml' },
  { term: 'ConfigMap', cat: 'Recursos', def: 'Armazena configurações não sensíveis como arquivos de config ou variáveis de ambiente.', example: 'kubectl create configmap app-config --from-literal=key=value' },
  { term: 'Secret', cat: 'Recursos', def: 'Armazena dados sensíveis (senhas, tokens, certificados) em base64. Use External Secrets para produção.', example: 'kubectl create secret generic db-pass --from-literal=password=abc123' },
  { term: 'StatefulSet', cat: 'Recursos', def: 'Controlador para aplicações com estado (bancos de dados). Garante nomes e ordem estáveis dos Pods.', example: 'kubectl get sts postgres' },
  { term: 'PV / PVC', cat: 'Recursos', def: 'PersistentVolume é storage físico. PersistentVolumeClaim é o pedido de um Pod para usar esse storage.', example: 'kubectl get pv,pvc' },
  { term: 'Namespace', cat: 'Recursos', def: 'Isolamento lógico dentro do cluster. Separa ambientes, equipes ou aplicações.', example: 'kubectl create ns production' },
  { term: 'ReplicaSet', cat: 'Recursos', def: 'Garante N Pods rodando. Raramente criado diretamente — o Deployment cria e gerencia.', example: 'kubectl get rs' },
  { term: 'kubectl get', cat: 'Comandos', def: 'Lista recursos. Flags: -A (todos ns), -o wide/yaml/json, -l (labels), --field-selector.', example: 'kubectl get pods -A -o wide' },
  { term: 'kubectl describe', cat: 'Comandos', def: 'Mostra detalhes completos de um recurso incluindo eventos, condições e configuração.', example: 'kubectl describe pod web-0' },
  { term: 'kubectl logs', cat: 'Comandos', def: 'Exibe logs de um container. Use -f para streaming e --previous para logs de containers reiniciados.', example: 'kubectl logs web-0 -f --tail=100' },
  { term: 'kubectl apply', cat: 'Comandos', def: 'Cria ou atualiza recursos de forma idempotente. Baseado no estado desejado declarado no YAML.', example: 'kubectl apply -f deployment.yaml' },
  { term: 'kubectl rollout', cat: 'Comandos', def: 'Gerencia rollouts: status, history, undo, restart. Essencial para deploy e rollback.', example: 'kubectl rollout undo deploy/web' },
  { term: 'Control Plane', cat: 'Arquitetura', def: 'O cérebro do cluster: API Server, etcd, Scheduler e Controller Manager. Gerencia estado e decisões.', example: 'kubectl get nodes -o wide' },
  { term: 'Worker Node', cat: 'Arquitetura', def: 'Máquina que executa Pods. Contém kubelet, kube-proxy, container runtime e plugins CNI/CSI.', example: 'kubectl describe node worker1' },
  { term: 'etcd', cat: 'Arquitetura', def: 'Banco chave-valor distribuído que armazena todo o estado do cluster. Ponto único de verdade.', example: 'Etcd roda no control plane (porta 2379)' },
  { term: 'kubelet', cat: 'Arquitetura', def: 'Agente em cada node que gerencia o ciclo de vida dos Pods e reporta status ao API Server.', example: 'systemctl status kubelet' },
  { term: 'kube-proxy', cat: 'Arquitetura', def: 'Implementa regras de rede (iptables/IPVS) que roteiam tráfego dos Services para os Pods corretos.', example: 'iptables -t nat -L' },
  { term: 'CrashLoopBackOff', cat: 'Troubleshooting', def: 'Container inicia e cai repetidamente. Primeira ação: kubectl logs. Causas: erro na app, probe falhando, falta de recurso.', example: 'kubectl logs web-0 --previous' },
  { term: 'ImagePullBackOff', cat: 'Troubleshooting', def: 'Kubernetes não consegue baixar a imagem. Verificar: nome da imagem, tag, credenciais de registry.', example: 'kubectl describe pod | grep -A5 Events' },
  { term: 'Pending', cat: 'Troubleshooting', def: 'Pod não foi agendado. Causas: sem recursos, selector sem node, volume PVC não bound.', example: 'kubectl describe pod | grep -A3 Conditions' },
  { term: 'NetworkPolicy', cat: 'Segurança', def: 'Firewall entre Pods. Define quem pode falar com quem baseado em labels e ports.', example: 'kubectl apply -f networkpolicy.yaml' },
  { term: 'RBAC', cat: 'Segurança', def: 'Role-Based Access Control. Controla permissões via Roles, ClusterRoles e Bindings.', example: 'kubectl auth can-i get pods' },
  { term: 'Helm', cat: 'Ferramentas', def: 'Gerenciador de pacotes para Kubernetes. Charts são templates parametrizáveis com versionamento.', example: 'helm install traefik traefik/traefik' },
  { term: 'Kustomize', cat: 'Ferramentas', def: 'Customização de manifests sem templates. Usa base + overlays para variações de ambiente.', example: 'kubectl apply -k overlays/prod/' },
];

var fcIndex = 0, fcCategory = 'Todos', fcFiltered = [], fcFlipped = false;

function filterFlashcards(cat) {
  fcCategory = cat;
  fcIndex = 0;
  fcFlipped = false;
  fcFiltered = cat === 'Todos' ? flashcardData.slice() : flashcardData.filter(function(c) { return c.cat === cat; });
  renderFlashcard();
  document.querySelectorAll('.flashcat-btn').forEach(function(b) {
    b.classList.toggle('active', b.textContent === cat);
  });
}

function renderFlashcard() {
  if (!fcFiltered.length) return;
  var card = fcFiltered[fcIndex];
  var el = document.getElementById('flashcard');
  el.classList.remove('flipped');
  fcFlipped = false;
  document.getElementById('flashcardTerm').textContent = card.term;
  document.getElementById('flashcardCat').textContent = card.cat;
  document.getElementById('flashcardCatBack').textContent = card.cat;
  document.getElementById('flashcardDef').textContent = card.def;
  var exEl = document.getElementById('flashcardExample');
  if (card.example) { exEl.textContent = '$ ' + card.example; exEl.style.display = 'block'; }
  else { exEl.style.display = 'none'; }
  document.getElementById('fcCounter').textContent = (fcIndex + 1) + ' / ' + fcFiltered.length;
  document.getElementById('fcPrevBtn').disabled = fcIndex === 0;
  document.getElementById('fcNextBtn').disabled = fcIndex === fcFiltered.length - 1;
  updateFlashcardProgress();
}

function flipFlashcard() {
  var el = document.getElementById('flashcard');
  fcFlipped = !fcFlipped;
  el.classList.toggle('flipped', fcFlipped);
}

function nextFlashcard() { if (fcIndex < fcFiltered.length - 1) { fcIndex++; renderFlashcard(); } }
function prevFlashcard() { if (fcIndex > 0) { fcIndex--; renderFlashcard(); } }

function rateFlashcard(known) {
  var key = 'k8s-fc-' + fcCategory + '-' + fcIndex;
  localStorage.setItem(key, known ? 'known' : 'dunno');
  if (fcIndex < fcFiltered.length - 1) { fcIndex++; renderFlashcard(); }
  updateFlashcardProgress();
}

function updateFlashcardProgress() {
  var known = 0;
  fcFiltered.forEach(function(_, i) {
    if (localStorage.getItem('k8s-fc-' + fcCategory + '-' + i) === 'known') known++;
  });
  var el = document.getElementById('flashcardProgress');
  if (el) el.textContent = known + '/' + fcFiltered.length + ' dominados';
}

function initFlashcards() {
  var cats = ['Todos'];
  flashcardData.forEach(function(c) { if (cats.indexOf(c.cat) === -1) cats.push(c.cat); });
  var container = document.getElementById('flashcardCats');
  if (!container) return;
  cats.forEach(function(cat) {
    var btn = document.createElement('button');
    btn.className = 'flashcat-btn' + (cat === 'Todos' ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = function() { filterFlashcards(cat); };
    container.appendChild(btn);
  });
  filterFlashcards('Todos');
}

/* ===== ROLLOUT SIMULATOR ===== */
var rolloutState = { pods: [], phase: 'idle', time: 0, interval: null };
function createPod(label, version, state) {
  return { label: label, version: version, state: state };
}
function renderRolloutPods() {
  var area = document.getElementById('rolloutPodsArea');
  if (!area) return;
  area.innerHTML = '';
  var v1Count = 0, v2Count = 0;
  rolloutState.pods.forEach(function(pod) {
    var div = document.createElement('div');
    div.className = 'rollout-pod ' + pod.state;
    var icon = pod.state === 'terminating' ? '⏹' : pod.state === 'starting' ? '⏳' : '✓';
    div.innerHTML = '<span class="pod-icon">' + icon + '</span><span class="pod-label">' + pod.label + '</span><span class="pod-label">' + pod.version + '</span>';
    area.appendChild(div);
    if (pod.version === 'v1' && pod.state !== 'terminating') v1Count++;
    if (pod.version === 'v2' && pod.state !== 'terminating') v2Count++;
  });
  document.getElementById('rolloutV1Count').textContent = v1Count;
  document.getElementById('rolloutV2Count').textContent = v2Count;
}
function rolloutLog(msg, cls) {
  var log = document.getElementById('rolloutLog');
  if (!log) return;
  var now = new Date();
  var t = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0') + ':' + String(now.getSeconds()).padStart(2,'0');
  log.innerHTML += '<div><span class="log-time">[' + t + ']</span> <span class="' + (cls || 'log-info') + '">' + msg + '</span></div>';
  log.scrollTop = log.scrollHeight;
}
function setRolloutStatus(text, cls) {
  var el = document.getElementById('rolloutStatus');
  if (el) { el.textContent = text; el.className = 'rs-value ' + cls; }
  var ver = document.getElementById('rolloutVersion');
  if (ver) {
    var v1 = 0, v2 = 0;
    rolloutState.pods.forEach(function(p) {
      if (p.state !== 'terminating') { if (p.version === 'v1') v1++; if (p.version === 'v2') v2++; }
    });
    if (v2 > 0 && v1 === 0) ver.textContent = 'v2 (estável)';
    else if (v2 > 0) ver.textContent = 'v1 → v2 (em transição)';
    else ver.textContent = 'v1 (estável)';
  }
}

function startRollout() {
  if (rolloutState.phase !== 'idle') return;
  rolloutState.pods = [
    createPod('web-0', 'v1', 'v1'), createPod('web-1', 'v1', 'v1'), createPod('web-2', 'v1', 'v1')
  ];
  rolloutState.phase = 'rolling';
  rolloutState.time = 0;
  document.getElementById('rolloutDeployBtn').disabled = true;
  document.getElementById('rolloutRollbackBtn').disabled = true;
  document.getElementById('rolloutLog').innerHTML = '';
  rolloutLog('🚀 Iniciando rolling update: v1 → v2', 'log-info');
  rolloutLog('maxSurge: 1, maxUnavailable: 0', 'log-info');
  setRolloutStatus('Rolling Update...', 'rolling');
  renderRolloutPods();

  var step = 0;
  var maxSteps = 8;
  rolloutState.interval = setInterval(function() {
    step++;
    rolloutState.time++;
    switch(step) {
      case 1:
        rolloutLog(' Criando novo Pod v2 (maxSurge=1)...', 'log-info');
        rolloutState.pods.push(createPod('web-new', 'v2', 'starting'));
        break;
      case 2:
        rolloutLog(' Pod web-new (v2) está Running e Ready ✓', 'log-success');
        rolloutState.pods[rolloutState.pods.length - 1].state = 'v2';
        rolloutLog(' Encerrando Pod antigo (web-0 v1)...', 'log-warn');
        rolloutState.pods[0].state = 'terminating';
        break;
      case 3:
        rolloutLog(' Pod web-0 (v1) terminado. 2/3 Pods na v1, 1 na v2', 'log-info');
        rolloutState.pods.splice(0, 1);
        rolloutLog(' Criando novo Pod v2 (maxSurge=1)...', 'log-info');
        rolloutState.pods.push(createPod('web-new2', 'v2', 'starting'));
        break;
      case 4:
        rolloutLog(' Pod web-new2 (v2) está Running e Ready ✓', 'log-success');
        rolloutState.pods[rolloutState.pods.length - 1].state = 'v2';
        rolloutLog(' Encerrando Pod antigo (web-1 v1)...', 'log-warn');
        rolloutState.pods[0].state = 'terminating';
        break;
      case 5:
        rolloutLog(' Pod web-1 (v1) terminado. 1/3 Pods na v1, 2 na v2', 'log-info');
        rolloutState.pods.splice(0, 1);
        rolloutLog(' Criando último Pod v2...', 'log-info');
        rolloutState.pods.push(createPod('web-new3', 'v2', 'starting'));
        break;
      case 6:
        rolloutLog(' Pod web-new3 (v2) está Running e Ready ✓', 'log-success');
        rolloutState.pods[rolloutState.pods.length - 1].state = 'v2';
        rolloutLog(' Encerrando último Pod v1 (web-2)...', 'log-warn');
        rolloutState.pods[0].state = 'terminating';
        break;
      case 7:
        rolloutLog(' Pod web-2 (v1) terminado.', 'log-info');
        rolloutState.pods.splice(0, 1);
        break;
      case 8:
        clearInterval(rolloutState.interval);
        rolloutState.phase = 'deployed';
        rolloutLog('✅ Rolling update concluído com sucesso!', 'log-success');
        rolloutLog(' 3/3 Pods rodando versão v2. Zero downtime garantido.', 'log-success');
        setRolloutStatus('Concluído', 'success');
        document.getElementById('rolloutDeployBtn').disabled = true;
        document.getElementById('rolloutRollbackBtn').disabled = false;
        break;
    }
    renderRolloutPods();
    setRolloutStatus(step < 8 ? 'Rolling Update...' : 'Concluído', step < 8 ? 'rolling' : 'success');
  }, 1500);
}

function rollbackRollout() {
  if (rolloutState.phase !== 'deployed') return;
  rolloutState.phase = 'rolling';
  document.getElementById('rolloutRollbackBtn').disabled = true;
  document.getElementById('rolloutDeployBtn').disabled = true;
  rolloutLog('⏪ Rollback para v1 iniciado...', 'log-warn');
  setRolloutStatus('Rollback...', 'rolling');
  renderRolloutPods();

  var step = 0;
  rolloutState.interval = setInterval(function() {
    step++;
    switch(step) {
      case 1:
        rolloutLog(' Criando Pod v1 (maxSurge=1)...', 'log-info');
        rolloutState.pods.push(createPod('web-rb', 'v1', 'starting'));
        break;
      case 2:
        rolloutLog(' Pod web-rb (v1) está Ready ✓', 'log-success');
        rolloutState.pods[rolloutState.pods.length - 1].state = 'v1';
        rolloutLog(' Encerrando Pod v2 (web-new)...', 'log-warn');
        var v2idx = -1;
        rolloutState.pods.forEach(function(p, i) { if (p.version === 'v2' && v2idx === -1 && p.state === 'v2') v2idx = i; });
        if (v2idx >= 0) rolloutState.pods[v2idx].state = 'terminating';
        break;
      case 3:
        rolloutState.pods = rolloutState.pods.filter(function(p) { return p.state !== 'terminating'; });
        rolloutLog(' Criando Pod v1 #2...', 'log-info');
        rolloutState.pods.push(createPod('web-rb2', 'v1', 'starting'));
        break;
      case 4:
        rolloutLog(' Pod web-rb2 (v1) Ready ✓', 'log-success');
        rolloutState.pods[rolloutState.pods.length - 1].state = 'v1';
        var v2idx2 = -1;
        rolloutState.pods.forEach(function(p, i) { if (p.version === 'v2' && v2idx2 === -1 && p.state === 'v2') v2idx2 = i; });
        if (v2idx2 >= 0) rolloutState.pods[v2idx2].state = 'terminating';
        break;
      case 5:
        rolloutState.pods = rolloutState.pods.filter(function(p) { return p.state !== 'terminating'; });
        rolloutLog(' Criando Pod v1 #3...', 'log-info');
        rolloutState.pods.push(createPod('web-rb3', 'v1', 'starting'));
        break;
      case 6:
        rolloutLog(' Pod web-rb3 (v1) Ready ✓', 'log-success');
        rolloutState.pods[rolloutState.pods.length - 1].state = 'v1';
        var v2idx3 = -1;
        rolloutState.pods.forEach(function(p, i) { if (p.version === 'v2' && v2idx3 === -1 && p.state === 'v2') v2idx3 = i; });
        if (v2idx3 >= 0) rolloutState.pods[v2idx3].state = 'terminating';
        break;
      case 7:
        rolloutState.pods = rolloutState.pods.filter(function(p) { return p.state !== 'terminating'; });
        clearInterval(rolloutState.interval);
        rolloutState.phase = 'idle';
        rolloutLog('✅ Rollback concluído! Todos os Pods na versão v1.', 'log-success');
        setRolloutStatus('Rollback Concluído', 'success');
        document.getElementById('rolloutDeployBtn').disabled = false;
        document.getElementById('rolloutRollbackBtn').disabled = true;
        break;
    }
    renderRolloutPods();
    if (step < 7) setRolloutStatus('Rollback...', 'rolling');
  }, 1200);
}

function resetRollout() {
  clearInterval(rolloutState.interval);
  rolloutState = { pods: [createPod('web-0','v1','v1'), createPod('web-1','v1','v1'), createPod('web-2','v1','v1')], phase: 'idle', time: 0, interval: null };
  document.getElementById('rolloutDeployBtn').disabled = false;
  document.getElementById('rolloutRollbackBtn').disabled = true;
  document.getElementById('rolloutLog').innerHTML = '<div><span class="log-time">[00:00]</span> <span class="log-info">Simulador resetado. 3 Pods rodando v1.</span></div>';
  setRolloutStatus('Pronto', 'pending');
  renderRolloutPods();
}

function initRolloutSim() {
  resetRollout();
}

/* ===== INIT NEW FEATURES ===== */
document.addEventListener('DOMContentLoaded', function() {
  initTerminal();
  switchYamlTab('deployment', document.querySelector('.yaml-tab'));
  initFlashcards();
  initRolloutSim();
});
"""

# ============================================================
# INJECT CSS — before the DARK READER COMPATIBILITY comment
# ============================================================
anchor_css = '/* ===== DARK READER COMPATIBILITY ===== */'
if anchor_css in html:
    html = html.replace(anchor_css, NEW_CSS + '\n' + anchor_css, 1)
    print('[OK] CSS injected before DARK READER section')
else:
    print('[FAIL] CSS anchor not found')

# ============================================================
# INJECT SIDEBAR — before the closing </nav>
# ============================================================
# Find the last </nav> before <main
main_idx = html.find('<main class="main">')
if main_idx > 0:
    nav_close = html.rfind('</nav>', 0, main_idx)
    if nav_close > 0:
        html = html[:nav_close] + NEW_SIDEBAR + '\n' + html[nav_close:]
        print('[OK] Sidebar links injected')

# ============================================================
# INJECT HTML SECTIONS — before the <script> tag (line ~4260)
# ============================================================
# Find the main <script> block
script_marker = '\n<script>\n'
script_idx = html.find(script_marker)
if script_idx > 0:
    html = html[:script_idx] + '\n' + NEW_SECTIONS + '\n' + script_marker + html[script_idx + len(script_marker):]
    print('[OK] HTML sections injected before <script>')

# ============================================================
# INJECT JS — before /* ===== INIT ON DOM READY ===== */
# ============================================================
anchor_js = '/* ===== INIT ON DOM READY ===== */'
if anchor_js in html:
    html = html.replace(anchor_js, NEW_JS + '\n\n' + anchor_js, 1)
    print('[OK] JavaScript injected before INIT ON DOM READY')
else:
        print('[WARN] JS anchor not found, trying alternative...')
    # Try inserting before the first function in the script block
    alt_anchor = 'if (typeof lucide !== \'undefined\' && lucide.createIcons) lucide.createIcons();'
    if alt_anchor in html:
        html = html.replace(alt_anchor, NEW_JS + '\n\n' + alt_anchor, 1)
        print('[OK] JavaScript injected at alternative anchor')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('[OK] index.html updated successfully!')
print(f'  File size: {len(html)} chars')
