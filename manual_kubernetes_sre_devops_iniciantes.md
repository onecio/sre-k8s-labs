# Manual Profissional de Kubernetes para Iniciantes em SRE/DevOps

Do zero a uma infraestrutura funcional com K3s, kubectl, Traefik, Cloudflare, volumes, banco de dados, CI/CD e troubleshooting.

**Versão 2.0 — Manual didático e operacional**

> **Objetivo:** formar uma base prática para que um iniciante entenda, instale, publique, diagnostique e evolua ambientes Kubernetes com segurança e critério técnico.

# Sumario executivo

Este manual foi estruturado como uma referencia progressiva. Ele comeca pelos conceitos basicos, passa pela instalacao de um cluster K3s, explica rede, Services, Ingress, Traefik, Cloudflare, volumes, Secrets, aplicacoes fullstack, CI/CD, GitOps e finaliza com troubleshooting e checklists operacionais.

## Como usar este manual

1. Leia os capitulos 1 a 6 para entender a base conceitual.
2. Execute os capitulos 7 a 11 em laboratorio para instalar e publicar sua primeira aplicacao.
3. Use os capitulos 12 a 17 para evoluir para aplicacoes reais com banco, volumes, Secrets e CI/CD.
4. Consulte os capitulos 18 a 22 sempre que precisar diagnosticar problemas.

## Mapa de conteudo

| Parte | Tema | Resultado esperado |
| --- | --- | --- |
| 1 | Fundamentos | Entender containers, imagens, registries, Pods e Deployments |
| 2 | Arquitetura Kubernetes | Compreender control plane, workers, kubelet, kube-proxy, CNI e etcd |
| 3 | Instalacao K3s | Subir cluster leve com servidor e worker |
| 4 | Rede e exposicao | Escolher ClusterIP, NodePort, LoadBalancer, HostPort, Ingress e MetalLB |
| 5 | Storage | Usar PVC, StorageClass, local-path, NFS, Longhorn, Ceph e outros |
| 6 | Aplicacoes | Publicar frontend, backend, banco e pagina estatica segura |
| 7 | CI/CD e GitOps | Automatizar build, registry e deploy |
| 8 | Troubleshooting | Diagnosticar falhas de Pods, Services, Ingress, TLS e Cloudflare |

# 1. Fundamentos para leigos

## 1.1 O que e um container

Um container e uma forma de empacotar uma aplicacao com suas dependencias para que ela rode de maneira previsivel. Ele nao e uma maquina virtual completa; normalmente e um processo isolado que compartilha o kernel do sistema operacional.

Analogia: pense em uma marmita lacrada. Ela ja contem tudo que voce precisa para aquela refeicao. A imagem do container e a receita pronta; o container em execucao e a marmita sendo consumida.

## 1.2 O que e uma imagem

Imagem e o pacote imutavel a partir do qual containers sao criados. Kubernetes nao compila sua aplicacao. Ele baixa uma imagem de um registry e executa essa imagem em um Pod.

```yaml
containers:
  - name: backend
    image: ghcr.io/minha-org/backend:v1.0.0
```

> **Boa pratica:** evite usar a tag latest em producao. Prefira tags versionadas ou digest de imagem para garantir previsibilidade e rollback confiavel.

## 1.3 O que e um registry

Registry e um repositorio de imagens. Ele armazena e distribui as imagens usadas no Kubernetes.

| Registry | Quando usar |
| --- | --- |
| Docker Hub | Aprendizado, imagens publicas e inicio rapido |
| GitHub Container Registry | Projetos versionados no GitHub |
| GitLab Container Registry | Projetos versionados no GitLab |
| Harbor | Registry privado corporativo ou on-premises |
| AWS ECR | Ambientes AWS |
| Azure Container Registry | Ambientes Azure |
| Google Artifact Registry | Ambientes Google Cloud |

## 1.4 O que e Kubernetes

Kubernetes e uma plataforma de orquestracao. Ele recebe declaracoes do estado desejado e tenta manter o ambiente de acordo com esse estado. Em vez de entrar no servidor e iniciar processos manualmente, voce declara recursos como Deployment, Service e Ingress.

## 1.5 O que e K3s

K3s e uma distribuicao Kubernetes leve. Ele e muito usado em laboratorios, edge, VMs pequenas, homelabs e cenarios em que voce quer simplicidade operacional. Ele reduz complexidade e vem com padroes prontos, mas continua sendo Kubernetes.

## 1.6 Glossario rapido

| Termo | Significado | Explicacao simples |
| --- | --- | --- |
| k8s | Kubernetes | Abreviacao: k + 8 letras + s |
| k3s | Kubernetes leve | Distribuicao simplificada e economica |
| kubectl | Cliente CLI | Ferramenta para falar com o cluster |
| Pod | Menor unidade implantavel | Onde o container roda |
| Deployment | Controlador de Pods | Mantem replicas da aplicacao |
| svc | Service | Endereco estavel para acessar Pods |
| Ingress | Regra HTTP/HTTPS | Publica aplicacoes por dominio/path |
| Secret | Dado sensivel | Senha, token, certificado |
| ConfigMap | Configuracao nao sensivel | Parametros e arquivos de config |
| PVC | Pedido de volume | Solicitacao de armazenamento |
| StorageClass | Classe de storage | Como o volume sera provisionado |

# 2. Arquitetura do Kubernetes

## 2.1 Visao geral

```text
Usuario
  -> DNS / CDN / Load Balancer
  -> Ingress Controller
  -> Service
  -> Pod
  -> Container da aplicacao
```

## 2.2 Control plane

O control plane e o cerebro do cluster. Ele recebe comandos, guarda o estado desejado, agenda Pods e executa controladores que corrigem desvios.

| Componente | Funcao | Analogia |
| --- | --- | --- |
| kube-apiserver | API central do cluster | Portaria da empresa |
| etcd | Banco de estado do cluster | Arquivo mestre de registros |
| kube-scheduler | Escolhe onde o Pod vai rodar | Despachante de tarefas |
| kube-controller-manager | Reconciliacao do estado | Supervisor que confere tudo |
| cloud-controller-manager | Integra com provedor cloud | Tradutor com a nuvem |

## 2.3 Worker node

| Componente | Funcao |
| --- | --- |
| kubelet | Agente que executa e monitora Pods no node |
| kube-proxy | Implementa regras de rede para Services |
| containerd | Runtime que executa containers |
| CNI | Plugin de rede dos Pods |
| CSI | Interface de storage |

## 2.4 Ciclo de vida de um Pod

```bash
kubectl apply -f app.yaml
  -> kube-apiserver recebe
  -> etcd armazena
  -> scheduler escolhe node
  -> kubelet cria Pod
  -> containerd executa container
  -> Service e Ingress passam a rotear trafego
```

## 2.5 Estados comuns de Pods

| Estado | O que significa | Acao inicial |
| --- | --- | --- |
| Pending | Pod ainda nao foi agendado ou falta recurso/volume | kubectl describe pod |
| Running | Pod foi iniciado | verificar readiness/logs |
| CrashLoopBackOff | Container inicia e cai repetidamente | kubectl logs |
| ImagePullBackOff | Erro ao baixar imagem | verificar nome/tag/credencial |
| Terminating | Pod sendo encerrado | aguardar ou investigar finalizers |
| Completed | Job terminou com sucesso | normal para Jobs |

# 3. Recursos basicos: Pod, Deployment, ReplicaSet, StatefulSet, DaemonSet e Jobs

## 3.1 Pod

Pod e a menor unidade implantavel. Ele normalmente contem um container principal, mas pode conter sidecars, como um agente de log ou proxy local.

## 3.2 Deployment

Deployment e usado para aplicacoes sem estado. Ele cria ReplicaSets, que criam Pods. Quando voce atualiza a imagem, o Deployment realiza rollout gradual.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: applications
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: nginx:alpine
          ports:
            - containerPort: 80
```

## 3.3 ReplicaSet

ReplicaSet garante que exista um numero desejado de Pods. Voce raramente cria ReplicaSet diretamente; o Deployment cria e gerencia para voce.

## 3.4 StatefulSet

StatefulSet e para aplicacoes com identidade e estado persistente, como bancos de dados. Ele cria Pods com nomes previsiveis, por exemplo postgres-0, postgres-1.

## 3.5 DaemonSet

DaemonSet garante que um Pod rode em todos os nodes ou em um conjunto de nodes. E usado para agentes de monitoramento, logs e seguranca.

## 3.6 Job e CronJob

Job executa uma tarefa ate terminar. CronJob executa tarefas em agenda, como backup todo dia as 02h.

# 4. kubectl: operacao diaria

kubectl e a ferramenta de linha de comando para conversar com o cluster. Ela usa um arquivo kubeconfig para saber qual cluster acessar e com quais credenciais.

## 4.1 Comandos de inventario

```bash
kubectl get nodes -o wide
kubectl get pods -A -o wide
kubectl get svc -A
kubectl get ingress -A
kubectl get storageclass
kubectl get events -A --sort-by=.lastTimestamp
```

## 4.2 Comandos de diagnostico

```bash
kubectl describe pod NOME -n NAMESPACE
kubectl logs NOME -n NAMESPACE
kubectl logs deploy/NOME -n NAMESPACE
kubectl exec -it POD -n NAMESPACE -- sh
kubectl get endpoints -n NAMESPACE
kubectl get ingress NOME -n NAMESPACE -o yaml
```

## 4.3 Comandos de rollout

```bash
kubectl rollout status deployment/NOME -n NAMESPACE
kubectl rollout restart deployment/NOME -n NAMESPACE
kubectl rollout history deployment/NOME -n NAMESPACE
kubectl rollout undo deployment/NOME -n NAMESPACE
```

## 4.4 Comandos declarativos

```bash
kubectl apply -f arquivo.yaml
kubectl diff -f arquivo.yaml
kubectl delete -f arquivo.yaml
```

> **Conceito-chave:** no Kubernetes profissional, prefira manifests versionados no Git. O cluster deve ser reproduzivel a partir dos arquivos.

# 5. Instalando Kubernetes com K3s

## 5.1 Preparacao da VM

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl vim nano htop net-tools ca-certificates
```

Esses comandos atualizam o sistema e instalam ferramentas basicas para operar e diagnosticar problemas.

## 5.2 Hostname unico

```text
hostnamectl
sudo hostnamectl set-hostname worker0
```

Cada node deve ter nome unico. Hostnames duplicados causam erros de registro no cluster.

## 5.3 Instalar K3s como servidor

```bash
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="server --disable traefik --disable servicelb" sh -
```

| Parametro | Significado | Por que usar |
| --- | --- | --- |
| server | Instala como control plane | Este node controla o cluster |
| --disable traefik | Remove Traefik embutido | Instalaremos Traefik manualmente via Helm |
| --disable servicelb | Remove ServiceLB nativo | Usaremos HostPort/estrategia propria no laboratorio |

## 5.4 Configurar kubectl sem sudo

```bash
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $USER:$USER ~/.kube/config
chmod 600 ~/.kube/config
echo 'export KUBECONFIG=$HOME/.kube/config' >> ~/.bashrc
export KUBECONFIG=$HOME/.kube/config
```

## 5.5 Obter token do cluster

```bash
sudo cat /var/lib/rancher/k3s/server/node-token
```

## 5.6 Adicionar worker

```bash
curl -sfL https://get.k3s.io | K3S_URL=https://IP_PRIVADO_DO_SERVER:6443 K3S_TOKEN=TOKEN_DO_CLUSTER INSTALL_K3S_EXEC="agent --node-name worker01" sh -
```

## 5.7 Validacao

```bash
kubectl get nodes -o wide
kubectl get pods -A -o wide
```

# 6. Rede no Kubernetes: Services, portas e kube-proxy

## 6.1 Por que Service existe

Pods mudam de IP. Service cria um endereco estavel. O Service usa labels para descobrir quais Pods devem receber trafego.

## 6.2 ClusterIP

ClusterIP e o tipo padrao. Ele so funciona dentro do cluster.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: applications
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
    - port: 8080
      targetPort: 8080
```

## 6.3 NodePort

NodePort abre uma porta alta em todos os nodes. E simples para laboratorios, mas geralmente nao e a forma mais elegante de expor producao.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: applications
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
```

## 6.4 LoadBalancer

LoadBalancer pede um IP externo/balanceador ao provedor. Em clouds gerenciadas isso geralmente cria um balanceador real. Em bare metal, voce precisa de MetalLB, kube-vip ou balanceador externo.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: traefik
  namespace: traefik
spec:
  type: LoadBalancer
  selector:
    app.kubernetes.io/name: traefik
  ports:
    - port: 443
      targetPort: 8443
```

## 6.5 HostPort

HostPort mapeia uma porta do node diretamente para o Pod. No seu laboratorio, o Traefik usa hostPort 80 e 443 para receber trafego publico.

```yaml
ports:
  web:
    port: 8000
    hostPort: 80
  websecure:
    port: 8443
    hostPort: 443
```

## 6.6 hostNetwork

hostNetwork faz o Pod usar a rede do host. E poderoso, mas reduz isolamento e aumenta risco de conflitos. Use apenas quando souber exatamente o motivo.

## 6.7 Diferenca entre port, targetPort, nodePort, hostPort e containerPort

| Campo | Onde existe | Explicacao |
| --- | --- | --- |
| containerPort | Container/Pod | Porta em que a aplicacao escuta dentro do container |
| targetPort | Service | Porta do Pod para onde o Service envia trafego |
| port | Service | Porta do Service acessada pelos clientes internos |
| nodePort | Node | Porta aberta no node para acesso externo |
| hostPort | Pod/Host | Porta do host mapeada diretamente para o Pod |

## 6.8 kube-proxy

kube-proxy cria regras de rede para que Services encaminhem trafego aos Pods corretos. Em muitos clusters, ele usa iptables ou IPVS para implementar esse encaminhamento.

```text
Cliente -> Service ClusterIP -> kube-proxy -> Pod A ou Pod B
```

## 6.9 CNI

CNI e a camada que permite que Pods tenham IP e conversem entre si. Exemplos: Flannel, Calico, Cilium, Weave e Antrea.

| CNI | Caracteristica | Quando considerar |
| --- | --- | --- |
| Flannel | Simples e leve | K3s, laboratorio, ambientes pequenos |
| Calico | NetworkPolicy forte | Ambientes com controle de rede |
| Cilium | eBPF e observabilidade | Ambientes avancados e alta performance |
| Antrea | Open vSwitch | Ambientes VMware/on-premises |

# 7. Ingress, proxies e borda: Traefik, NGINX, HAProxy, Envoy e Cloudflare

## 7.1 O que e Ingress

Ingress e a regra que diz: quando chegar uma requisicao HTTP/HTTPS para determinado host/path, encaminhe para determinado Service.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app
  namespace: applications
spec:
  ingressClassName: traefik
  rules:
    - host: app.ecomnix.com.br
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
```

## 7.2 Ingress Controller

Ingress sozinho e apenas uma declaracao. Quem realmente escuta portas e aplica regras e o Ingress Controller, como Traefik, NGINX Ingress, HAProxy ou Envoy.

| Opcao | Vantagens | Quando usar |
| --- | --- | --- |
| Traefik | Simples, integrado a Kubernetes, bom com CRDs | K3s, laboratorio, edge, pequenas/medias producoes |
| NGINX Ingress | Muito maduro, ampla comunidade | Ambientes corporativos e padronizados |
| HAProxy | Forte em balanceamento e performance | Ambientes que ja usam HAProxy |
| Envoy/Contour | Moderno, base para service mesh | Trafego avancado e Gateway API |
| Istio Gateway | mTLS, mesh, politicas avancadas | Ambientes grandes e maduros |

## 7.3 Com Cloudflare

```text
Usuario
  -> Cloudflare
  -> IP publico Oracle
  -> Traefik HostPort 80/443
  -> Ingress
  -> Service
  -> Pod
```

Cloudflare pode fornecer DNS, proxy, TLS na borda, WAF, cache e protecao DDoS. No modo Full Strict, a Cloudflare exige HTTPS valido no origin.

## 7.4 Sem Cloudflare

```text
Usuario
  -> DNS direto para IP publico
  -> Traefik/NGINX
  -> Kubernetes
  -> Aplicacao
```

Sem CDN, o origin fica diretamente exposto. Voce ganha simplicidade, mas assume maior responsabilidade por firewall, certificados, WAF e rate limit.

## 7.5 MetalLB e balanceamento on-premises

MetalLB e uma opcao muito usada para permitir Service type LoadBalancer em ambientes bare metal ou homelab. Ele atribui IPs da sua rede local aos Services.

```text
Service traefik type LoadBalancer
  -> MetalLB atribui 192.168.1.240
  -> DNS aponta app.local para 192.168.1.240
```

## 7.6 kube-vip e HAProxy externo

kube-vip pode fornecer IP virtual para control plane e Services. HAProxy externo pode ficar fora do cluster e encaminhar trafego para NodePorts. Essas alternativas sao comuns em on-premises.

# 8. Instalando Traefik via Helm

## 8.1 Instalar Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
helm version
```

## 8.2 Adicionar repositorio Traefik

```bash
helm repo add traefik https://traefik.github.io/charts
helm repo update
helm search repo traefik
```

## 8.3 Namespace

```bash
kubectl create namespace traefik
```

## 8.4 CRDs

```bash
helm template traefik-crds traefik/traefik-crds   --namespace traefik   | kubectl apply -f -
```

## 8.5 Secret TLS da Cloudflare Origin

```bash
kubectl create secret tls cloudflare-origin-tls   --cert=/home/ubuntu/cloudflare.crt   --key=/home/ubuntu/cloudflare.key   -n traefik
```

## 8.6 TLSStore

```yaml
apiVersion: traefik.io/v1alpha1
kind: TLSStore
metadata:
  name: default
  namespace: traefik
spec:
  defaultCertificate:
    secretName: cloudflare-origin-tls
```

## 8.7 values.yaml final com HostPort

```yaml
deployment:
  replicas: 1

nodeSelector:
  kubernetes.io/hostname: worker0

service:
  enabled: false

ingressClass:
  enabled: true
  isDefaultClass: true

providers:
  kubernetesCRD:
    enabled: true
  kubernetesIngress:
    enabled: true

ports:
  web:
    port: 8000
    expose:
      default: false
    hostPort: 80
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    port: 8443
    expose:
      default: false
    hostPort: 443
    http:
      tls:
        enabled: true

resources:
  requests:
    cpu: 100m
    memory: 64Mi
  limits:
    cpu: 300m
    memory: 160Mi

log:
  level: INFO

accessLog:
  enabled: true
```

## 8.8 Instalar

```bash
helm install traefik traefik/traefik   --namespace traefik   -f ~/k8s/traefik/values.yaml   --timeout 10m
```

## 8.9 Validar

```bash
kubectl get pods -n traefik -o wide
kubectl describe deployment traefik -n traefik
sudo ss -tulpn | grep -E ':(80|443)\b'
curl -vk https://IP_PUBLICO -H "Host: app.ecomnix.com.br"
```

# 9. Armazenamento: volumes, PVC, StorageClass, Longhorn, NFS e Ceph

## 9.1 Por que volume e necessario

Containers sao efemeros. Se voce salvar dados apenas dentro do container, pode perde-los quando o Pod for recriado. Por isso bancos e arquivos precisam de volumes persistentes.

## 9.2 emptyDir, ConfigMap, Secret e hostPath

| Tipo | Persistente? | Uso recomendado |
| --- | --- | --- |
| emptyDir | Nao | Cache temporario dentro do ciclo de vida do Pod |
| configMap | Nao e storage de dados | Montar arquivos de configuracao |
| secret | Nao e storage de dados | Montar senhas/certificados/tokens |
| hostPath | Depende do node | Laboratorio ou casos especificos; cuidado em producao |

## 9.3 PV, PVC e StorageClass

```text
Aplicacao cria PVC
  -> StorageClass provisiona volume
  -> PV e criado
  -> Pod monta o volume
```

## 9.4 Exemplo de PVC

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
  namespace: applications
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

## 9.5 local-path

local-path e comum no K3s. Ele grava no disco local do node. E simples, leve e bom para laboratorio, mas nao oferece alta disponibilidade de dados.

## 9.6 Longhorn

Longhorn oferece storage distribuido para Kubernetes, com replicacao, snapshots, backups e interface web. E excelente para homelab, edge e clusters pequenos/medios com multiplos nodes.

| Use Longhorn quando | Tenha cuidado quando |
| --- | --- |
| Precisa de replicacao de volumes | Nodes tem pouca memoria |
| Quer snapshots e backups | Rede entre nodes e instavel |
| Tem mais de um node | Discos sao muito lentos |
| Quer painel visual de storage | Ambiente e minimo/free tier com recursos apertados |

## 9.7 NFS

NFS e simples para ReadWriteMany, quando varios Pods precisam montar o mesmo volume. E comum em laboratorios e ambientes on-premises com NAS.

## 9.8 Ceph/Rook e OpenEBS

Rook/Ceph e robusto para producao, mas complexo. OpenEBS e alternativa cloud-native. Escolha conforme maturidade, recursos disponiveis e requisitos de resiliencia.

## 9.9 Access Modes

| Modo | Significado | Uso comum |
| --- | --- | --- |
| ReadWriteOnce | Um node monta para escrita | Banco comum |
| ReadOnlyMany | Muitos leem | Conteudo estatico compartilhado |
| ReadWriteMany | Muitos leem e escrevem | NFS, compartilhamento |
| ReadWriteOncePod | Apenas um Pod escreve | Controle restrito de banco |

# 10. Como construir artefatos de deployment adequados e completos

## 10.1 O que e um manifesto profissional

Um manifesto profissional nao e apenas um Deployment minimo. Ele declara recursos, limites, probes, seguranca, configuracao, secrets, services e ingress de forma organizada, previsivel e versionavel.

## 10.2 Estrutura recomendada de diretorios

```text
k8s/
  apps/
    minha-aplicacao/
      namespace.yaml
      configmap.yaml
      secret.yaml
      deployment.yaml
      service.yaml
      ingress.yaml
      pvc.yaml
      hpa.yaml
      pdb.yaml
  traefik/
    values.yaml
    tlsstore.yaml
```

## 10.3 Labels padronizadas

```yaml
labels:
  app.kubernetes.io/name: backend
  app.kubernetes.io/part-of: ecomnix
  app.kubernetes.io/component: api
  app.kubernetes.io/version: v1.0.0
```

## 10.4 Deployment profissional

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: applications
  labels:
    app.kubernetes.io/name: backend
    app.kubernetes.io/part-of: ecomnix
spec:
  replicas: 2
  revisionHistoryLimit: 5
  selector:
    matchLabels:
      app.kubernetes.io/name: backend
  template:
    metadata:
      labels:
        app.kubernetes.io/name: backend
    spec:
      securityContext:
        runAsNonRoot: true
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: backend
          image: ghcr.io/ecomnix/backend:v1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 8080
          envFrom:
            - configMapRef:
                name: backend-config
            - secretRef:
                name: backend-secret
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          readinessProbe:
            httpGet:
              path: /health
              port: http
          livenessProbe:
            httpGet:
              path: /health
              port: http
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
```

## 10.5 Por que cada campo existe

| Campo | Motivo |
| --- | --- |
| replicas | Define disponibilidade e capacidade basica |
| selector/matchLabels | Liga Deployment aos Pods corretos |
| image | Define o artefato que sera executado |
| ports | Documenta portas do container |
| envFrom | Carrega configuracoes e segredos |
| resources | Evita consumir o node inteiro e ajuda o scheduler |
| readinessProbe | So recebe trafego quando pronto |
| livenessProbe | Reinicia se travar |
| securityContext | Reduz privilegios do container |

# 11. Implementando uma aplicacao fullstack

## 11.1 Arquitetura

```text
app.ecomnix.com.br
  -> Frontend
  -> /api
  -> Backend
  -> PostgreSQL
  -> Volume persistente
```

## 11.2 ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: applications
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
  DB_HOST: "postgres"
  DB_PORT: "5432"
  DB_NAME: "appdb"
```

## 11.3 Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
  namespace: applications
type: Opaque
stringData:
  DB_USER: "appuser"
  DB_PASSWORD: "troque-esta-senha"
  JWT_SECRET: "troque-este-token"
```

## 11.4 PostgreSQL com StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: applications
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              value: appdb
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: backend-secret
                  key: DB_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: backend-secret
                  key: DB_PASSWORD
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 10Gi
```

## 11.5 Service do banco

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: applications
spec:
  type: ClusterIP
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
```

## 11.6 Backend e Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: applications
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: ghcr.io/ecomnix/backend:v1.0.0
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef:
                name: backend-config
            - secretRef:
                name: backend-secret
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: applications
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
    - port: 8080
      targetPort: 8080
```

## 11.7 Frontend e Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ecomnix
  namespace: applications
spec:
  ingressClassName: traefik
  rules:
    - host: app.ecomnix.com.br
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 8080
```

# 12. Seguranca operacional

## 12.1 Segredos

Nunca coloque senha em ConfigMap, Dockerfile ou codigo. Use Secret, preferencialmente integrado a um cofre externo em ambientes maiores.

| Ferramenta | Uso |
| --- | --- |
| Kubernetes Secret | Basico e nativo |
| Sealed Secrets | Secret criptografado no Git |
| External Secrets Operator | Sincroniza com Vault, AWS Secrets Manager, etc. |
| HashiCorp Vault | Cofre corporativo completo |

## 12.2 RBAC

RBAC controla quem pode fazer o que no cluster. Evite usar cluster-admin para aplicacoes e pipelines.

## 12.3 NetworkPolicy

NetworkPolicy restringe comunicacao entre Pods. Para funcionar, o CNI precisa suportar politicas, como Calico ou Cilium.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-backend-to-postgres
  namespace: applications
spec:
  podSelector:
    matchLabels:
      app: postgres
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: backend
      ports:
        - protocol: TCP
          port: 5432
```

## 12.4 Boas praticas de Pod Security

- Executar como usuario nao-root.
- Desabilitar escalada de privilegios.
- Remover capabilities desnecessarias.
- Usar filesystem somente leitura quando possivel.
- Definir requests e limits.
- Evitar imagens desconhecidas e tags latest.

# 13. Observabilidade: logs, metricas e tracing

## 13.1 Pilares

| Pilar | Ferramentas comuns | Pergunta que responde |
| --- | --- | --- |
| Metricas | Prometheus, Grafana | O sistema esta saudavel? |
| Logs | Loki, Fluent Bit, Elasticsearch | O que aconteceu? |
| Traces | OpenTelemetry, Tempo, Jaeger | Onde a requisicao ficou lenta? |

## 13.2 Comandos basicos

```bash
kubectl top nodes
kubectl top pods -A
kubectl logs deploy/backend -n applications
kubectl get events -A --sort-by=.lastTimestamp
```

## 13.3 Health checks

readinessProbe diz se o Pod pode receber trafego. livenessProbe diz se o Pod deve ser reiniciado. startupProbe ajuda aplicacoes que demoram a iniciar.

# 14. CI/CD, registries, Helm, Kustomize e GitOps

## 14.1 Fluxo recomendado

```text
Commit no Git
  -> Pipeline executa testes
  -> Build da imagem
  -> Push no registry
  -> Atualizacao do manifesto/Helm
  -> Deploy no Kubernetes
  -> Rollout e validacao
```

## 14.2 GitHub Actions

```yaml
name: Build and Push

on:
  push:
    branches: [main]

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Login GHCR
        run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
      - name: Build
        run: docker build -t ghcr.io/minha-org/backend:${{ github.sha }} .
      - name: Push
        run: docker push ghcr.io/minha-org/backend:${{ github.sha }}
```

## 14.3 GitLab CI

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  script:
    - docker build -t registry.gitlab.com/grupo/app:$CI_COMMIT_SHA .
    - docker push registry.gitlab.com/grupo/app:$CI_COMMIT_SHA
```

## 14.4 Deploy com kubectl

```bash
kubectl set image deployment/backend backend=ghcr.io/minha-org/backend:v1.0.1 -n applications
kubectl rollout status deployment/backend -n applications
```

## 14.5 Deploy com Helm

```bash
helm upgrade backend ./charts/backend   -n applications   --set image.tag=v1.0.1
```

## 14.6 GitOps com Argo CD ou Flux

GitOps usa o Git como fonte da verdade. O cluster observa um repositorio e aplica automaticamente o estado declarado. Isso melhora auditoria, rollback e padronizacao.

```text
Pipeline publica imagem
  -> Pipeline atualiza repo de manifests
  -> Argo CD/Flux detecta alteracao
  -> Cluster aplica automaticamente
```

## 14.7 Terraform, Ansible, Helm e Kustomize

| Ferramenta | Funcao | Quando usar |
| --- | --- | --- |
| Terraform | Infraestrutura como codigo | Criar VMs, redes, firewalls, DNS, cloud resources |
| Ansible | Configuracao de servidores | Pacotes, arquivos, hardening |
| Helm | Pacotes Kubernetes parametrizados | Aplicacoes reutilizaveis |
| Kustomize | Variacoes por ambiente | dev/hml/prod sem templates complexos |
| Argo CD | GitOps visual e forte | Deploy continuo declarativo |
| Flux CD | GitOps CNCF | Automacao GitOps leve |

# 15. Troubleshooting: metodologia SRE para achar falhas

## 15.1 Cadeia de diagnostico

```text
DNS
  -> CDN/Cloudflare
  -> Firewall/Security List
  -> Porta 80/443 no node
  -> Traefik/Ingress Controller
  -> Ingress
  -> Service
  -> Endpoints
  -> Pod
  -> Container
  -> Logs da aplicacao
```

## 15.2 Pod Pending

```bash
kubectl describe pod NOME -n applications
kubectl get events -n applications --sort-by=.lastTimestamp
```

| Causa | Como identificar | Como corrigir |
| --- | --- | --- |
| Falta de recurso | Eventos mostram Insufficient cpu/memory | Reduzir replicas/requests ou aumentar node |
| Volume pendente | PVC Pending | Verificar StorageClass |
| nodeSelector errado | 0/2 nodes are available | Ajustar labels ou nodeSelector |
| Taint sem toleration | Eventos citam taint | Adicionar toleration ou remover taint |

## 15.3 CrashLoopBackOff

```bash
kubectl logs POD -n applications
kubectl logs POD -n applications --previous
kubectl describe pod POD -n applications
```

## 15.4 ImagePullBackOff

Verifique nome da imagem, tag, registry privado e imagePullSecrets.

## 15.5 Erro 404 no Traefik

- Host do Ingress nao corresponde ao dominio acessado.
- ingressClassName incorreto.
- Service errado.
- Path incorreto.

## 15.6 Erro 502 ou Bad Gateway

- Service existe, mas endpoints estao vazios.
- targetPort errado.
- Pod nao esta Ready.
- Aplicacao nao responde na porta esperada.

## 15.7 Cloudflare 521

Cloudflare nao conseguiu conectar ao origin. Verifique se 80/443 estao abertos no servidor e no firewall cloud.

```bash
sudo ss -tulpn | grep -E ':(80|443)\b'
curl -vk https://IP_PUBLICO -H "Host: app.ecomnix.com.br"
```

## 15.8 Cloudflare 526

Certificado invalido no origin em Full Strict. Verifique Secret TLS, TLSStore e certificado Cloudflare Origin.

```bash
kubectl get secret -n traefik
kubectl get tlsstore -n traefik
openssl x509 -in cloudflare.crt -text -noout
```

# 16. Como escolher a arquitetura certa

| Cenario | Arquitetura recomendada |
| --- | --- |
| Laboratorio pequeno | K3s + Traefik HostPort + Cloudflare + local-path |
| Homelab com varios nodes | K3s + MetalLB + Longhorn + Traefik/NGINX |
| Producao cloud | Cluster gerenciado + LoadBalancer cloud + CSI + GitOps |
| On-premises empresarial | RKE2/Kubernetes + MetalLB/kube-vip + Longhorn/Ceph + observabilidade |
| Ambiente altamente regulado | RBAC forte + NetworkPolicy + registry privado + GitOps + auditoria |

## 16.1 Regra pratica

```text
Terraform cria infraestrutura.
Ansible configura servidores.
Kubernetes roda aplicacoes.
Helm/Kustomize organizam manifests.
GitOps aplica continuamente.
kubectl diagnostica e corrige.
```

# 17. Exercicios de aprendizagem

## 17.1 Nivel 1 - publicar pagina estatica

1. Criar namespace applications.
2. Criar ConfigMap com index.html.
3. Criar Deployment nginx.
4. Criar Service ClusterIP.
5. Criar Ingress para teste.ecomnix.com.br.
6. Testar com curl e navegador.

## 17.2 Nivel 2 - publicar API

1. Criar imagem Docker de uma API simples.
2. Publicar no registry.
3. Criar Deployment com readiness e liveness.
4. Criar Service.
5. Publicar em api.ecomnix.com.br.

## 17.3 Nivel 3 - banco com volume

1. Criar Secret com usuario/senha.
2. Criar StatefulSet PostgreSQL.
3. Criar PVC.
4. Conectar backend ao banco.
5. Reiniciar Pod e validar persistencia.

## 17.4 Nivel 4 - CI/CD

1. Criar pipeline que faz build da imagem.
2. Publicar imagem no registry.
3. Atualizar tag no manifesto.
4. Aplicar no cluster.
5. Validar rollout.

# 18. Checklists operacionais

## 18.1 Checklist antes de publicar uma aplicacao

- A imagem existe no registry?
- A tag esta versionada?
- O Deployment tem labels padronizadas?
- O Service seleciona os Pods corretos?
- O targetPort corresponde ao containerPort?
- O Ingress aponta para o Service correto?
- O DNS aponta para a borda correta?
- O TLS esta valido?
- readinessProbe e livenessProbe existem?
- resources requests/limits foram definidos?
- Secrets nao estao em ConfigMap?
- A aplicacao nao expõe dados internos?

## 18.2 Checklist de producao minima

- Backup dos dados persistentes.
- Monitoramento de metricas.
- Coleta centralizada de logs.
- Politicas de acesso RBAC.
- Controle de imagens e registries.
- Certificados renovaveis.
- Pipeline CI/CD versionado.
- Plano de rollback.
- Procedimento de troubleshooting documentado.

# 19. Formula mental definitiva

```text
Deployment cria Pods.
Service encontra Pods.
Ingress publica Services.
Traefik executa o Ingress.
DNS leva o usuario ate a borda.
TLS protege a conexao.
Secret protege credenciais.
PVC preserva dados.
kubectl diagnostica.
Helm empacota.
CI/CD automatiza.
GitOps governa.
```

Se voce memorizar essa cadeia, conseguira raciocinar sobre a maioria dos problemas reais em Kubernetes.

# 20. Referencias oficiais para estudo continuo

- [Kubernetes - Components](https://kubernetes.io/docs/concepts/overview/components/)
- [Kubernetes - Services](https://kubernetes.io/docs/concepts/services-networking/service/)
- [Kubernetes - Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [Kubernetes - Volumes](https://kubernetes.io/docs/concepts/storage/volumes/)
- [Kubernetes - StorageClasses](https://kubernetes.io/docs/concepts/storage/storage-classes/)
- [K3s Quick Start](https://docs.k3s.io/quick-start)
- [Helm Charts](https://helm.sh/docs/topics/charts/)
- [Traefik Kubernetes](https://doc.traefik.io/traefik/providers/kubernetes-ingress/)
- [MetalLB](https://metallb.io/)
- [Longhorn](https://longhorn.io/docs/latest/)
- [cert-manager](https://cert-manager.io/docs/)
- [GitHub Actions](https://docs.github.com/actions)
- [Terraform](https://developer.hashicorp.com/terraform/docs)
- [Argo CD](https://argo-cd.readthedocs.io/)
- [Flux CD](https://fluxcd.io/flux/)
