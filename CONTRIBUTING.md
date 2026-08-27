# Contribuindo

## Princípios

- Preserve a progressão Foundations, Operator e Operations and SRE.
- Toda prática deve informar pré-requisitos, objetivo, passos, validação, limpeza e evidências.
- Use APIs Kubernetes estáveis sempre que possível.
- Nunca inclua segredos, tokens ou credenciais reais.
- Use traço simples em textos. Traços duplos permanecem apenas quando fizerem parte de comandos ou sintaxe.

## Fluxo

1. Crie uma issue com o problema educacional ou técnico.
2. Desenvolva uma alteração pequena e verificável.
3. Execute `npm run validate` e `npm run build`.
4. Abra um pull request descrevendo impacto, testes e riscos.

Mudanças em laboratórios devem incluir um caminho de limpeza e um script `scripts/validate.sh` idempotente.
