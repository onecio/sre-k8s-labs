# Lab 09 - K3s multi-VM

## Objetivo

Construir um cluster K3s com um servidor e dois agentes, usando endereços privados e token protegido.

## Topologia mínima

| Função | Quantidade | Recursos por VM |
|---|---:|---:|
| Server | 1 | 2 vCPU, 4 GB RAM |
| Agent | 2 | 2 vCPU, 2 GB RAM |

## Execução

1. Defina DNS, NTP, firewall e endereçamento estável.
2. Instale o server com `curl -sfL https://get.k3s.io | sh -` em rede controlada.
3. Armazene o token em um canal secreto e conecte os agentes com `K3S_URL` e `K3S_TOKEN`.
4. Copie o kubeconfig com permissões `600` e execute `bash scripts/validate.sh`.

## Critério de saída

Três nós Ready, rede entre Pods, DNS interno e resiliência a reinício de um agente.

## Limpeza

Use os scripts oficiais `k3s-uninstall.sh` e `k3s-agent-uninstall.sh` somente nas VMs dedicadas ao laboratório.
