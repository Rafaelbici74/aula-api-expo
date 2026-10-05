# Banco de dados

## Regra obrigatória

Antes de qualquer implementação, correção ou alteração relacionada ao banco, consulte a estrutura real, incluindo tabelas, colunas, tipos, chaves, relacionamentos, constraints, índices, defaults e campos obrigatórios. Nunca invente nomes, IDs, queries, relações ou schemas.

Analise também migrations, serviços e queries existentes. Só crie ou altere estrutura após plano de impacto e aprovação explícita.

## Acesso atual

- O backend acessa MySQL por `src/dataBase/connection.js`.
- O pool usa `mysql2/promise`, variáveis do `.env`, charset `utf8mb4` e limite de 10 conexões.
- O mobile não acessa o banco diretamente; usa a API Express.

## Schema consultado

Inventário consultado no MySQL em **2026-10-02**, pelas views `information_schema.TABLES`, `COLUMNS`, `KEY_COLUMN_USAGE`, `STATISTICS` e `REFERENTIAL_CONSTRAINTS`. O schema consultado contém **17 tabelas base**, sem views ou triggers. Todas as tabelas usam InnoDB e collation `utf8mb4_unicode_ci`.

Nesta referência, `NULL`/`NOT NULL` descreve a nulabilidade; defaults são explicitados. Índices `PRIMARY` são chaves primárias. `KEY` indica índice não único e `UNIQUE` indica índice único. Colunas `AUTO_INCREMENT` são indicadas junto ao tipo.

### `avaliacoes`

- `id`: `int(11)`, NOT NULL, AUTO_INCREMENT.
- `avaliador_id`, `avaliado_id`, `projeto_id`, `nota`: `int(11)`, NULL, DEFAULT NULL.
- `comentario`: `text`, NULL, DEFAULT NULL.
- `criado_em`: `timestamp`, NULL, DEFAULT CURRENT_TIMESTAMP.
- Índices: PRIMARY (`id`); KEY `avaliador_id` (`avaliador_id`); KEY `avaliado_id` (`avaliado_id`); KEY `projeto_id` (`projeto_id`).
- FKs: `avaliador_id` → `usuarios.id` ON DELETE CASCADE; `avaliado_id` → `usuarios.id` ON DELETE CASCADE; `projeto_id` → `projetos.id` ON DELETE CASCADE.

### `candidaturas`

- `id`: `int(11)`, NOT NULL, AUTO_INCREMENT.
- `usuario_id`, `projeto_id`, `vaga_id`: `int(11)`, NULL, DEFAULT NULL.
- `status`: `enum('pendente','aceito','rejeitado')`, NULL, DEFAULT `'pendente'`.
- `mensagem`: `text`, NULL, DEFAULT NULL.
- `criado_em`: `timestamp`, NULL, DEFAULT CURRENT_TIMESTAMP.
- Índices: PRIMARY (`id`); KEY `projeto_id` (`projeto_id`); KEY `usuario_id` (`usuario_id`); KEY `fk_candidaturas_vaga` (`vaga_id`).
- FKs: `usuario_id` → `usuarios.id` ON DELETE CASCADE; `projeto_id` → `projetos.id` ON DELETE CASCADE; `vaga_id` → `vagas_projeto.id` ON DELETE SET NULL.

### `conquistas`

- `id`: `int(11)`, NOT NULL, AUTO_INCREMENT.
- `titulo`: `varchar(100)`, NOT NULL.
- `descricao`: `varchar(255)`, NOT NULL.
- `icone`: `enum('trophy','star','flame','rocket','users','code')`, NOT NULL, DEFAULT `'trophy'`.
- Índices: PRIMARY (`id`).

### `conquistas_usuario`

- `usuario_id`, `conquista_id`: `int(11)`, NOT NULL.
- `conquistado_em`: `timestamp`, NULL, DEFAULT CURRENT_TIMESTAMP.
- Índices: PRIMARY (`usuario_id`, `conquista_id`); KEY `conquista_id` (`conquista_id`).
- FKs: `usuario_id` → `usuarios.id` ON DELETE CASCADE; `conquista_id` → `conquistas.id` ON DELETE CASCADE.

### `eventos_projeto`

- `id`: `bigint(20)`, NOT NULL, AUTO_INCREMENT.
- `projeto_id`: `int(11)`, NOT NULL.
- `usuario_id`: `int(11)`, NULL, DEFAULT NULL.
- `tipo`: `varchar(100)`, NOT NULL.
- `entidade_tipo`: `varchar(50)`, NULL, DEFAULT NULL.
- `entidade_id`: `varchar(100)`, NULL, DEFAULT NULL.
- `titulo`: `varchar(255)`, NOT NULL.
- `metadados`: `longtext`, NULL, DEFAULT NULL.
- `criado_em`: `timestamp`, NULL, DEFAULT CURRENT_TIMESTAMP.
- Índices: PRIMARY (`id`); KEY `projeto_id` (`projeto_id`); KEY `usuario_id` (`usuario_id`).
- FKs: `projeto_id` → `projetos.id` ON DELETE CASCADE; `usuario_id` → `usuarios.id` ON DELETE SET NULL.

### `eventos_xp`

- `id`: `bigint(20)`, NOT NULL, AUTO_INCREMENT.
- `usuario_id`: `int(11)`, NOT NULL.
- `tarefa_id`: `int(11)`, NULL, DEFAULT NULL.
- `tipo`: `varchar(100)`, NOT NULL.
- `xp`: `int(11)`, NOT NULL.
- `chave_idempotencia`: `varchar(255)`, NOT NULL.
- `criado_em`: `timestamp`, NULL, DEFAULT CURRENT_TIMESTAMP.
- Índices: PRIMARY (`id`); UNIQUE `uq_eventos_xp_chave` (`chave_idempotencia`); KEY `usuario_id` (`usuario_id`); KEY `tarefa_id` (`tarefa_id`).
- FKs: `usuario_id` → `usuarios.id` ON DELETE CASCADE; `tarefa_id` → `tarefas.id` ON DELETE CASCADE.

### `funcoes`

- `id`: `int(11)`, NOT NULL, AUTO_INCREMENT.
- `nome`: `varchar(100)`, NOT NULL.
- Índices: PRIMARY (`id`); UNIQUE `nome` (`nome`).

### `habilidades`

- `id`: `int(11)`, NOT NULL, AUTO_INCREMENT.
- `nome`: `varchar(100)`, NOT NULL.
- Índices: PRIMARY (`id`).

### `habilidades_projeto`

- `projeto_id`, `habilidade_id`: `int(11)`, NOT NULL.
- Índices: PRIMARY (`projeto_id`, `habilidade_id`); KEY `habilidade_id` (`habilidade_id`).
- FKs: `projeto_id` → `projetos.id` ON DELETE CASCADE; `habilidade_id` → `habilidades.id` ON DELETE CASCADE.

### `habilidades_usuario`

- `usuario_id`, `habilidade_id`: `int(11)`, NOT NULL.
- `nivel`: `enum('iniciante','intermediario','avancado')`, NULL, DEFAULT NULL.
- Índices: PRIMARY (`usuario_id`, `habilidade_id`); KEY `habilidade_id` (`habilidade_id`).
- FKs: `usuario_id` → `usuarios.id` ON DELETE CASCADE; `habilidade_id` → `habilidades.id` ON DELETE CASCADE.

### `membros_equipe`

- `id`: `int(11)`, NOT NULL, AUTO_INCREMENT.
- `usuario_id`, `projeto_id`, `vaga_id`, `funcao_id`: `int(11)`, NULL, DEFAULT NULL.
- `funcao`: `varchar(100)`, NULL, DEFAULT NULL.
- `status`: `enum('ativo','saiu','removido')`, NULL, DEFAULT `'ativo'`.
- `saiu_em`: `datetime`, NULL, DEFAULT NULL.
- `entrou_em`: `timestamp`, NULL, DEFAULT CURRENT_TIMESTAMP.
- Índices: PRIMARY (`id`); KEY `idx_membros_usuario_status` (`usuario_id`, `status`); KEY `projeto_id` (`projeto_id`); KEY `fk_membros_equipe_vaga` (`vaga_id`); KEY `fk_membros_equipe_funcao` (`funcao_id`).
- FKs: `usuario_id` → `usuarios.id` ON DELETE CASCADE; `projeto_id` → `projetos.id` ON DELETE CASCADE; `vaga_id` → `vagas_projeto.id` ON DELETE SET NULL; `funcao_id` → `funcoes.id` ON DELETE SET NULL.

### `mensagens`

- `id`: `int(11)`, NOT NULL, AUTO_INCREMENT.
- `remetente_id`, `projeto_id`, `destinatario_id`: `int(11)`, NULL, DEFAULT NULL.
- `conteudo`: `text`, NULL, DEFAULT NULL.
- `criado_em`: `timestamp`, NULL, DEFAULT CURRENT_TIMESTAMP.
- Índices: PRIMARY (`id`); KEY `remetente_id` (`remetente_id`); KEY `destinatario_id` (`destinatario_id`); KEY `idx_mensagens_projeto_criado` (`projeto_id`, `criado_em`).
- FKs: `remetente_id` → `usuarios.id` ON DELETE CASCADE; `projeto_id` → `projetos.id` ON DELETE CASCADE; `destinatario_id` → `usuarios.id` ON DELETE CASCADE.

### `notificacoes`

- `id`: `int(11)`, NOT NULL, AUTO_INCREMENT.
- `usuario_id`: `int(11)`, NOT NULL.
- `tipo`: `enum('application','message','task','system','approved')`, NULL, DEFAULT `'system'`.
- `titulo`: `varchar(150)`, NULL, DEFAULT NULL.
- `descricao`: `text`, NULL, DEFAULT NULL.
- `link`: `varchar(255)`, NULL, DEFAULT NULL.
- `lida`: `tinyint(1)`, NULL, DEFAULT `0`.
- `criado_em`: `timestamp`, NULL, DEFAULT CURRENT_TIMESTAMP.
- Índices: PRIMARY (`id`); KEY `idx_notificacoes_usuario_lida` (`usuario_id`, `lida`).
- FK: `usuario_id` → `usuarios.id` ON DELETE CASCADE.

### `projetos`

- `id`: `int(11)`, NOT NULL, AUTO_INCREMENT.
- `criador_id`: `int(11)`, NULL, DEFAULT NULL.
- `titulo`: `varchar(150)`, NOT NULL.
- `descricao`: `text`, NULL, DEFAULT NULL.
- `status`: `enum('aberto','em_andamento','finalizado')`, NULL, DEFAULT `'aberto'`.
- `limite_membros`: `int(11)`, NOT NULL, DEFAULT `5`.
- `criado_em`: `timestamp`, NULL, DEFAULT CURRENT_TIMESTAMP.
- `repositorio_url`, `figma_url`, `discord_url`, `documentacao_url`: `varchar(255)`, NULL, DEFAULT NULL.
- `visibilidade`: `enum('publico','privado')`, NULL, DEFAULT `'publico'`.
- `permitir_portfolio_publico`: `tinyint(1)`, NULL, DEFAULT `1`.
- Índices: PRIMARY (`id`); KEY `criador_id` (`criador_id`).
- FK: `criador_id` → `usuarios.id` ON DELETE CASCADE.

### `tarefas`

- `id`: `int(11)`, NOT NULL, AUTO_INCREMENT.
- `projeto_id`: `int(11)`, NOT NULL.
- `responsavel_id`: `int(11)`, NULL, DEFAULT NULL.
- `titulo`: `varchar(255)`, NOT NULL.
- `descricao`: `text`, NULL, DEFAULT NULL.
- `status`: `enum('todo','doing','review','done')`, NOT NULL, DEFAULT `'todo'`.
- `prioridade`: `enum('low','medium','high')`, NOT NULL, DEFAULT `'medium'`.
- `data_vencimento`: `date`, NULL, DEFAULT NULL.
- `criado_em`: `timestamp`, NULL, DEFAULT CURRENT_TIMESTAMP.
- `concluida_em`, `assumida_em`: `datetime`, NULL, DEFAULT NULL.
- `dificuldade`: `enum('iniciante','intermediaria','avancada')`, NULL, DEFAULT `'intermediaria'`.
- `habilidades`, `subtasks`: `longtext`, NULL, DEFAULT NULL.
- `excluida_em`: `datetime`, NULL, DEFAULT NULL.
- Índices: PRIMARY (`id`); KEY `idx_tarefas_projeto_id` (`projeto_id`); KEY `responsavel_id` (`responsavel_id`).
- FKs: `projeto_id` → `projetos.id` ON DELETE CASCADE; `responsavel_id` → `usuarios.id` ON DELETE SET NULL.

### `usuarios`

- `id`: `int(11)`, NOT NULL, AUTO_INCREMENT.
- `nome`: `varchar(100)`, NOT NULL.
- `email`: `varchar(150)`, NOT NULL.
- `senha`: `varchar(255)`, NOT NULL.
- `bio`: `text`, NULL, DEFAULT NULL.
- `localizacao`: `varchar(100)`, NULL, DEFAULT NULL.
- `avatar_url`: `varchar(500)`, NULL, DEFAULT NULL.
- `tipo`: `enum('membro','adm')`, NOT NULL, DEFAULT `'membro'`.
- `criado_em`: `timestamp`, NULL, DEFAULT CURRENT_TIMESTAMP.
- `github_user_id`: `bigint(20)`, NULL, DEFAULT NULL.
- `github_login`: `varchar(100)`, NULL, DEFAULT NULL.
- `github_avatar_url`: `varchar(500)`, NULL, DEFAULT NULL.
- `github_connected_at`: `datetime`, NULL, DEFAULT NULL.
- `cadastro_origem`: `enum('local','github')`, NOT NULL, DEFAULT `'local'`.
- `senha_definida`: `tinyint(1)`, NOT NULL, DEFAULT `0`.
- `disponibilidade_horas_semana`: `int(11)`, NULL, DEFAULT NULL.
- `objetivo_profissional`: `varchar(255)`, NULL, DEFAULT NULL.
- `perfil_completo`: `tinyint(1)`, NULL, DEFAULT `0`.
- `token_versao`: `int(11)`, NOT NULL, DEFAULT `0`.
- `reset_codigo`: `varchar(10)`, NULL, DEFAULT NULL.
- `reset_token`: `varchar(500)`, NULL, DEFAULT NULL.
- `reset_expira_em`: `datetime`, NULL, DEFAULT NULL.
- `reset_utilizado`: `tinyint(1)`, NULL, DEFAULT `0`.
- `funcoes_interesse`: `longtext`, NULL, DEFAULT NULL.
- `nivel`: `int(11)`, NOT NULL, DEFAULT `1`.
- `xp`: `int(11)`, NOT NULL, DEFAULT `0`.
- `xp_para_proximo`: `int(11)`, NOT NULL, DEFAULT `250`.
- `media_notas`: `decimal(3,2)`, NULL, DEFAULT `0.00`.
- `total_avaliacoes`: `int(11)`, NULL, DEFAULT `0`.
- `projetos_concluidos`: `int(11)`, NULL, DEFAULT `0`.
- Índices: PRIMARY (`id`); UNIQUE `email` (`email`); UNIQUE `uq_usuarios_github_user_id` (`github_user_id`).
- Não foram encontrados FKs definidos nesta tabela.

### `vagas_projeto`

- `id`: `int(11)`, NOT NULL, AUTO_INCREMENT.
- `projeto_id`, `funcao_id`: `int(11)`, NOT NULL.
- `quantidade`: `int(11)`, NOT NULL, DEFAULT `1`.
- `preenchidas`: `int(11)`, NOT NULL, DEFAULT `0`.
- `descricao`: `text`, NULL, DEFAULT NULL.
- `nivel_desejado`: `enum('iniciante','intermediario','avancado','qualquer')`, NULL, DEFAULT `'qualquer'`.
- `status`: `enum('aberta','fechada')`, NULL, DEFAULT `'aberta'`.
- `criado_em`: `timestamp`, NULL, DEFAULT CURRENT_TIMESTAMP.
- Índices: PRIMARY (`id`); KEY `projeto_id` (`projeto_id`); KEY `funcao_id` (`funcao_id`).
- FKs: `projeto_id` → `projetos.id` ON DELETE CASCADE; `funcao_id` → `funcoes.id` ON DELETE RESTRICT.

## Divergências corrigidas nesta referência

O documento anterior listava 29 tabelas; 12 delas não existem no schema consultado: `codigos_recuperacao`, `estatisticas_usuario`, `funcoes_usuario`, `github_commits`, `github_pull_requests`, `github_webhook_deliveries`, `habilidades_tarefa`, `historico_responsaveis_tarefa`, `reputacao_tecnica_usuario`, `solicitacoes_projeto`, `subtarefas` e `tokens_revogados`.

Também foram alinhadas as colunas: os campos `github_*` de repositório e PR antes atribuídos a `projetos`/`tarefas` não existem no schema consultado; `tarefas` possui `habilidades` e `subtasks`; e campos de recuperação, interesse em funções, XP e estatísticas estão em `usuarios`, não nas tabelas separadas anteriormente listadas. Os campos de GitHub observados no banco estão em `usuarios`: `github_user_id`, `github_login`, `github_avatar_url`, `github_connected_at` e `cadastro_origem`.

## Limitação de funções de interesse

Não existe tabela de vínculo entre usuários e funções no schema consultado. `usuarios.funcoes_interesse` existe, mas estava NULL nos 24 usuários consultados em 2026-10-02, e seu formato não foi confirmado. A rota de perfil da candidatura não consulta uma tabela inexistente e retorna `funcoes` como lista vazia até que o modelo e o fluxo de persistência das funções de interesse sejam definidos.

## Observações sobre atualização

- Este documento registra um snapshot do banco em 2026-10-02, não uma migration nem uma especificação para recriar o schema.
- Não foram encontrados arquivos `.sql` nem diretório de migrations no projeto durante a consulta.
- Todas as FKs listadas têm `ON UPDATE RESTRICT`; as regras `ON DELETE` estão descritas junto de cada relacionamento.
- Antes de qualquer alteração estrutural, consulte novamente o banco vivo e apresente plano de impacto para aprovação explícita.
