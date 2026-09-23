# Instruções do agente

Este projeto é uma aplicação mobile Expo/React Native com API Express e banco MySQL. Não trate o projeto como novo: antes de qualquer alteração, analise a arquitetura, os arquivos relacionados e os padrões existentes.

## Regras principais

- Preserve a arquitetura, os padrões visuais, a navegação, os serviços e o comportamento existente.
- Reutilize componentes, hooks, serviços, estilos e soluções já presentes antes de criar novos.
- Não altere arquivos, banco, dependências ou configurações sem análise prévia e aprovação explícita do usuário.
- Não faça refatorações ou melhorias fora do escopo aprovado.
- Não invente tabelas, colunas, relações, endpoints, IDs, regras ou resultados de validação.
- Não exponha credenciais, tokens ou dados sensíveis.
- Ao encontrar problema pré-existente, registre-o separadamente e não o corrija sem autorização quando estiver fora do escopo.

## Fluxo obrigatório

1. Analisar o projeto e os arquivos relacionados.
2. Investigar banco, APIs, integrações, navegação, estado e componentes aplicáveis.
3. Executar verificações somente de leitura quando possível.
4. Identificar problemas pré-existentes.
5. Apresentar plano, arquivos afetados, impactos, riscos e validações.
6. Perguntar se o usuário aprova.
7. Aguardar aprovação explícita.
8. Implementar somente o escopo aprovado.
9. Executar validações adequadas.
10. Revisar lógica, imports, UX, layout e compatibilidade.
11. Relatar alterações, arquivos, banco, validações e problemas encontrados.

## Banco de dados

Antes de qualquer implementação ou alteração relacionada ao banco, consulte a estrutura real: tabelas, colunas, tipos, chaves, relacionamentos, constraints, índices, defaults e obrigatoriedade. É obrigatório seguir `docs/project/database.md`.

Alterações estruturais exigem plano específico, análise de impacto e aprovação antes de executar migrations ou comandos no banco.

## Validação

Use somente ferramentas e scripts já existentes no projeto. O projeto usa JavaScript; valide sintaxe, imports, APIs, navegação, layout e bundle Expo conforme o escopo. Não declare sucesso sem executar a validação.

## Documentação complementar

Consulte os documentos conforme a tarefa:

- Banco: `docs/project/database.md`
- Backend/API: `docs/project/backend-api.md`
- Mobile/Expo: `docs/project/mobile-expo.md`
- Componentes, navegação e estado: `docs/project/components-navigation-state.md`
- Estilos: `docs/project/styles-design-system.md`
- Código: `docs/project/code-standards.md`
- Regras de negócio: `docs/project/business-rules.md`
- Autenticação e permissões: `docs/project/authentication-permissions.md`
- Formulários e estados: `docs/project/forms-feedback-states.md`
- Integrações: `docs/project/integrations.md`
- Testes: `docs/project/testing-validation.md`
- Segurança: `docs/project/security.md`
- Workflow: `docs/project/workflow.md`
- Manutenção e documentação: `docs/project/documentation-maintenance.md`

`docs/TCC` é reservado exclusivamente para instruções acadêmicas e documentação do TCC.
