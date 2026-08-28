# Lab 04 - Gateway API

## Objetivo

Substituir o modelo mental de Ingress por Gateway API, separando infraestrutura, listener e rota.

## Pré-requisitos

Instale os CRDs e um controlador compatível. O manifesto usa a `GatewayClass` informada pela variável `GATEWAY_CLASS`.

## Execução

```bash
export GATEWAY_CLASS=example
envsubst < starter/gateway.yaml | kubectl apply -f -
kubectl apply -f starter/route.yaml
bash scripts/validate.sh
```

## Critério de saída

Gateway e HTTPRoute aceitos pelo controlador, backend resolvido e rota acessível.

## Limpeza

Remova HTTPRoute e Gateway com `kubectl delete`.
