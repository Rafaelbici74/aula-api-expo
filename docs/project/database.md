# Banco de dados

## Regra obrigatória

Antes de qualquer implementação, correção ou alteração relacionada ao banco, consulte a estrutura real, incluindo tabelas, colunas, tipos, chaves, relacionamentos, constraints, índices, defaults e campos obrigatórios. Nunca invente nomes, IDs, queries, relações ou schemas.

Analise também migrations, serviços e queries existentes. Só crie ou altere estrutura após plano de impacto e aprovação explícita.

## Acesso atual

- O backend acessa MySQL por `src/dataBase/connection.js`.
- O pool usa `mysql2/promise`, `.env`, charset `utf8mb4` e limite de conexões.
- O mobile não acessa o banco diretamente; usa a API Express.

## Schema consultado

As tabelas existentes e suas colunas são:

- `avaliacoes`: `id`, `avaliador_id`, `avaliado_id`, `projeto_id`, `nota`, `comentario`, `criado_em`.
- `candidaturas`: `id`, `usuario_id`, `projeto_id`, `vaga_id`, `status`, `mensagem`, `criado_em`.
- `codigos_recuperacao`: `id`, `usuario_id`, `email`, `codigo`, `token_reset`, `expira_em`, `utilizado`, `criado_em`.
- `conquistas`: `id`, `titulo`, `descricao`, `icone`.
- `conquistas_usuario`: `usuario_id`, `conquista_id`, `conquistado_em`.
- `estatisticas_usuario`: `usuario_id`, `media_notas`, `total_avaliacoes`, `projetos_concluidos`, `nivel`, `xp`, `xp_para_proximo`.
- `eventos_projeto`: `id`, `projeto_id`, `usuario_id`, `tipo`, `entidade_tipo`, `entidade_id`, `titulo`, `metadados`, `criado_em`.
- `eventos_xp`: `id`, `usuario_id`, `tarefa_id`, `tipo`, `xp`, `chave_idempotencia`, `criado_em`.
- `funcoes`: `id`, `nome`.
- `funcoes_usuario`: `usuario_id`, `funcao_id`, `nivel_interesse`.
- `github_commits`: `id`, `tarefa_id`, `projeto_id`, `repository_id`, `sha`, `message`, `author_github_id`, `author_login`, `author_name`, `author_email`, `branch`, `commit_url`, `committed_at`, `recebido_em`.
- `github_pull_requests`: `id`, `tarefa_id`, `projeto_id`, `repository_id`, `github_pr_id`, `numero`, `titulo`, `url`, `head_branch`, `base_branch`, `author_github_id`, `author_login`, `estado`, `aberto_em`, `fechado_em`, `mergeado_em`, `atualizado_em`.
- `github_webhook_deliveries`: `id`, `delivery_id`, `event_name`, `action_name`, `repository_id`, `processado`, `erro`, `recebido_em`, `processado_em`.
- `habilidades`: `id`, `nome`.
- `habilidades_projeto`: `projeto_id`, `habilidade_id`.
- `habilidades_tarefa`: `tarefa_id`, `habilidade_id`.
- `habilidades_usuario`: `usuario_id`, `habilidade_id`, `nivel`.
- `historico_responsaveis_tarefa`: `id`, `tarefa_id`, `usuario_id`, `acao`, `realizado_por`, `criado_em`.
- `membros_equipe`: `id`, `usuario_id`, `projeto_id`, `funcao`, `vaga_id`, `funcao_id`, `status`, `saiu_em`, `entrou_em`.
- `mensagens`: `id`, `remetente_id`, `projeto_id`, `destinatario_id`, `conteudo`, `criado_em`.
- `notificacoes`: `id`, `usuario_id`, `tipo`, `titulo`, `descricao`, `link`, `lida`, `criado_em`.
- `projetos`: `id`, `criador_id`, `titulo`, `descricao`, `status`, `limite_membros`, `criado_em`, `repositorio_url`, `figma_url`, `discord_url`, `documentacao_url`, `github_repository_id`, `github_repository_full_name`, `github_installation_id`, `github_default_branch`, `github_connected_at`, `visibilidade`, `permitir_portfolio_publico`.
- `reputacao_tecnica_usuario`: `usuario_id`, `score`, `tasks_verificadas`, `prs_mergeados`, `commits_validos`, `projetos_com_entrega`, `atualizado_em`.
- `solicitacoes_projeto`: `id`, `projeto_id`, `usuario_id`, `status`, `criado_em`.
- `subtarefas`: `id`, `tarefa_id`, `titulo`, `concluida`, `criado_em`.
- `tarefas`: `id`, `projeto_id`, `responsavel_id`, `titulo`, `descricao`, `status`, `prioridade`, `data_vencimento`, `criado_em`, `github_branch`, `github_pr_number`, `github_pr_id`, `github_pr_url`, `github_pr_status`, `github_last_activity_at`, `concluida_via`, `concluida_em`, `assumida_em`, `dificuldade`, `excluida_em`.
- `tokens_revogados`: `jti`, `revogado_em`.
- `usuarios`: `id`, `nome`, `email`, `senha`, `bio`, `localizacao`, `avatar_url`, `tipo`, `criado_em`, `github_user_id`, `github_login`, `github_avatar_url`, `github_connected_at`, `cadastro_origem`, `senha_definida`, `disponibilidade_horas_semana`, `objetivo_profissional`, `perfil_completo`, `token_versao`.
- `vagas_projeto`: `id`, `projeto_id`, `funcao_id`, `quantidade`, `preenchidas`, `descricao`, `nivel_desejado`, `status`, `criado_em`.

## Relacionamentos confirmados

As relações confirmadas incluem usuários com projetos, membros, tarefas, candidaturas, mensagens, notificações, avaliações, funções, habilidades e estatísticas; projetos com membros, vagas, tarefas, candidaturas, avaliações, eventos e GitHub; e tarefas com projetos, responsáveis, subtarefas, habilidades, histórico, commits, pull requests e eventos de XP.

Use `information_schema.KEY_COLUMN_USAGE` ou equivalente para confirmar relações antes de qualquer nova query.
