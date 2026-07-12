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
    var pod = cmd.match(/describe pod\s+(\S+)/)[1];
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
    var pod = cmd.match(/logs\s+(\S+)/)[1];
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
  apiVersion: { title: 'apiVersion', type: 'string', required: true, desc: 'A versao da API do Kubernetes que define o tipo de recurso. Exemplos: apps/v1, v1, networking.k8s.io/v1.' },
  kind: { title: 'kind', type: 'string', required: true, desc: 'O tipo de recurso Kubernetes. Exemplos: Deployment, Service, Pod, ConfigMap, Ingress.' },
  metadata: { title: 'metadata', type: 'object', required: true, desc: 'Dados de identificacao do recurso: nome, namespace, labels e annotations.' },
  name: { title: 'name', type: 'string', required: true, desc: 'Nome unico do recurso dentro do namespace. Deve ser RFC 1123 compliant.' },
  namespace: { title: 'namespace', type: 'string', required: false, desc: 'Namespace onde o recurso sera criado. Default: default.' },
  labels: { title: 'labels', type: 'map[string]string', required: false, desc: 'Pares chave=valor para organizacao e selecao. Ex: app=frontend, tier=web.' },
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
var yamlData = {};
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
  var panel = document.getElementById('yamlDocPanel');
  if (!panel) return;
  var prev = document.querySelectorAll('.yaml-key.highlighted');
  prev.forEach(function(p) { p.classList.remove('highlighted'); });
  var keys = document.querySelectorAll('.yaml-key');
  keys.forEach(function(k) { if (k.textContent.trim() === key) k.classList.add('highlighted'); });
  var doc = yamlDocs[key];
  if (!doc) { panel.innerHTML = '<div class="yaml-doc-empty">Sem documentacao para "' + key + '"</div>'; return; }
  panel.innerHTML = '<h5>' + doc.title + '</h5>'
    + '<div class="yaml-doc-type">' + doc.type + '</div> '
    + (doc.required ? '<span class="yaml-doc-required">Obrigatorio</span>' : '<span class="yaml-doc-optional">Opcional</span>')
    + '<p>' + doc.desc + '</p>';
}
function switchYamlTab(tab, btn) {
  document.querySelectorAll('.yaml-tab').forEach(function(t) { t.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  var panel = document.getElementById('yamlCodePanel');
  if (panel && yamlData[tab]) {
    panel.innerHTML = '<pre style="margin:0;background:none;border:none;padding:0;font-family:inherit;font-size:inherit;color:inherit;line-height:1.8;">' + yamlData[tab] + '</pre>';
  }
  var docPanel = document.getElementById('yamlDocPanel');
  if (docPanel) docPanel.innerHTML = '<div class="yaml-doc-empty">Clique em um campo-chave do YAML a esquerda para ver a documentacao</div>';
}

/* ===== FLASHCARDS ===== */
var flashcardData = [
  { term: 'Pod', cat: 'Recursos', def: 'A menor unidade implantavel no Kubernetes. Contem um ou mais containers que compartilham rede e storage.', example: 'kubectl get pods' },
  { term: 'Deployment', cat: 'Recursos', def: 'Controlador que mantem N replicas de Pods. Gerencia ReplicaSets e realiza rolling updates.', example: 'kubectl create deploy web --image=nginx' },
  { term: 'Service', cat: 'Recursos', def: 'Endereco estavel e IP fixo que roteia trafego para um conjunto de Pods selecionados por labels.', example: 'kubectl expose deploy web --port=80' },
  { term: 'Ingress', cat: 'Recursos', def: 'Regra HTTP/HTTPS que roteia trafego externo para Services baseado em host e path.', example: 'kubectl apply -f ingress.yaml' },
  { term: 'ConfigMap', cat: 'Recursos', def: 'Armazena configuracoes nao sensiveis como arquivos de config ou variaveis de ambiente.', example: 'kubectl create configmap app-config --from-literal=key=value' },
  { term: 'Secret', cat: 'Recursos', def: 'Armazena dados sensiveis (senhas, tokens, certificados) em base64.', example: 'kubectl create secret generic db-pass --from-literal=password=abc123' },
  { term: 'StatefulSet', cat: 'Recursos', def: 'Controlador para aplicacoes com estado (bancos de dados). Garante nomes e ordem estaveis dos Pods.', example: 'kubectl get sts postgres' },
  { term: 'PV / PVC', cat: 'Recursos', def: 'PersistentVolume e storage fisico. PersistentVolumeClaim e o pedido de um Pod para usar esse storage.', example: 'kubectl get pv,pvc' },
  { term: 'Namespace', cat: 'Recursos', def: 'Isolamento logico dentro do cluster. Separa ambientes, equipes ou aplicacoes.', example: 'kubectl create ns production' },
  { term: 'ReplicaSet', cat: 'Recursos', def: 'Garante N Pods rodando. Raramente criado diretamente - o Deployment cria e gerencia.', example: 'kubectl get rs' },
  { term: 'kubectl get', cat: 'Comandos', def: 'Lista recursos. Flags: -A (todos ns), -o wide/yaml/json, -l (labels).', example: 'kubectl get pods -A -o wide' },
  { term: 'kubectl describe', cat: 'Comandos', def: 'Mostra detalhes completos de um recurso incluindo eventos, condicoes e configuracao.', example: 'kubectl describe pod web-0' },
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
var fcIndex = 0, fcCategory = 'Todos', fcFiltered = [], fcFlipped = false;
function filterFlashcards(cat) {
  fcCategory = cat; fcIndex = 0; fcFlipped = false;
  fcFiltered = cat === 'Todos' ? flashcardData.slice() : flashcardData.filter(function(c) { return c.cat === cat; });
  renderFlashcard();
  document.querySelectorAll('.flashcat-btn').forEach(function(b) { b.classList.toggle('active', b.textContent === cat); });
}
function renderFlashcard() {
  if (!fcFiltered.length) return;
  var card = fcFiltered[fcIndex];
  var el = document.getElementById('flashcard');
  el.classList.remove('flipped'); fcFlipped = false;
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
  localStorage.setItem('k8s-fc-' + fcCategory + '-' + fcIndex, known ? 'known' : 'dunno');
  if (fcIndex < fcFiltered.length - 1) { fcIndex++; renderFlashcard(); }
  updateFlashcardProgress();
}
function updateFlashcardProgress() {
  var known = 0;
  fcFiltered.forEach(function(_, i) { if (localStorage.getItem('k8s-fc-' + fcCategory + '-' + i) === 'known') known++; });
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
function createPod(label, version, state) { return { label: label, version: version, state: state }; }
function renderRolloutPods() {
  var area = document.getElementById('rolloutPodsArea');
  if (!area) return;
  area.innerHTML = '';
  var v1Count = 0, v2Count = 0;
  rolloutState.pods.forEach(function(pod) {
    var div = document.createElement('div');
    div.className = 'rollout-pod ' + pod.state;
    var icon = pod.state === 'terminating' ? 'X' : pod.state === 'starting' ? '...' : 'OK';
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
  var step = 0;
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
  var step = 0;
  rolloutState.interval = setInterval(function() {
    step++;
    switch(step) {
      case 1: rolloutLog('Criando Pod v1 (maxSurge=1)...', 'log-info'); rolloutState.pods.push(createPod('web-rb','v1','starting')); break;
      case 2: rolloutLog('Pod web-rb (v1) Ready', 'log-success'); rolloutState.pods[rolloutState.pods.length-1].state='v1'; var vi=-1; rolloutState.pods.forEach(function(p,i){if(p.version==='v2'&&vi===-1&&p.state==='v2')vi=i;}); if(vi>=0)rolloutState.pods[vi].state='terminating'; break;
      case 3: rolloutState.pods=rolloutState.pods.filter(function(p){return p.state!=='terminating';}); rolloutLog('Criando Pod v1 #2...', 'log-info'); rolloutState.pods.push(createPod('web-rb2','v1','starting')); break;
      case 4: rolloutLog('Pod web-rb2 (v1) Ready', 'log-success'); rolloutState.pods[rolloutState.pods.length-1].state='v1'; var vi2=-1; rolloutState.pods.forEach(function(p,i){if(p.version==='v2'&&vi2===-1&&p.state==='v2')vi2=i;}); if(vi2>=0)rolloutState.pods[vi2].state='terminating'; break;
      case 5: rolloutState.pods=rolloutState.pods.filter(function(p){return p.state!=='terminating';}); rolloutLog('Criando Pod v1 #3...', 'log-info'); rolloutState.pods.push(createPod('web-rb3','v1','starting')); break;
      case 6: rolloutLog('Pod web-rb3 (v1) Ready', 'log-success'); rolloutState.pods[rolloutState.pods.length-1].state='v1'; var vi3=-1; rolloutState.pods.forEach(function(p,i){if(p.version==='v2'&&vi3===-1&&p.state==='v2')vi3=i;}); if(vi3>=0)rolloutState.pods[vi3].state='terminating'; break;
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
