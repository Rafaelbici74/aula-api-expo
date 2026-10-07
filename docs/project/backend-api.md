# Backend e API

- O backend está em `server.js` e usa Express, CORS, JSON e `mysql2/promise`.
- Mantenha rotas REST agrupadas por recurso e respostas JSON consistentes.
- Valide IDs, parâmetros, body e enums antes das queries.
- Use queries parametrizadas; nunca concatene entrada do usuário.
- Retorne status HTTP coerentes e mensagens compreensíveis.
- Registre erros no servidor sem expor credenciais ou detalhes sensíveis ao cliente.
- Reutilize `src/services` e padrões existentes antes de criar serviços novos.
- Ao criar ou alterar endpoint, atualize o cliente correspondente e documente impacto.
- Verifique autorização no backend; não confie apenas em controles visuais do mobile.

## Cadastro de usuários

- `POST /api/usuarios` recebe nome, e-mail e senha, valida os dados no servidor e cria a conta na tabela `usuarios`.
- O e-mail é normalizado para minúsculas; nome e e-mail respeitam os limites do schema, e o e-mail deve ser válido.
- A senha mantém a política do formulário (mínimo de 6 caracteres e uma letra maiúscula), tem limite de 72 bytes para bcrypt, é armazenada como hash bcrypt e nunca é retornada.
- A rota responde `201` ao cadastrar, `409` quando o e-mail já existe, `400` para dados inválidos e `500` em falha inesperada.
- O cadastro não cria sessão: o usuário segue para o login após a criação da conta.

## Candidaturas e análise de perfil

- `POST /api/candidaturas` cria uma candidatura pendente e gera uma notificação do tipo `application` para o criador do projeto.
- `GET /api/projetos/:id/candidaturas?usuario_id=:criadorId` lista candidaturas pendentes somente para o criador do projeto.
- `GET /api/candidaturas/:id/perfil?usuario_id=:criadorId` retorna os dados públicos do candidato, avaliação, habilidades e mensagem da candidatura; o acesso é restrito ao criador do projeto. A propriedade `funcoes` é mantida como lista vazia por compatibilidade, pois não existe tabela de vínculo entre usuários e funções no schema atual.
- `PATCH /api/candidaturas/:id/aceitar` e `PATCH /api/candidaturas/:id/rejeitar` exigem o ID do criador no body e notificam o candidato sobre o resultado.
- Ao aceitar uma candidatura, a notificação de decisão do líder é convertida em uma mensagem informativa de que o candidato foi aceito e aguarda confirmação; os botões de análise, aceite e rejeição deixam de aparecer.
- Ao confirmar a entrada, o sistema notifica o líder sobre a entrada efetiva do novo membro.
- Antes de criar uma candidatura, valide projeto aberto, vaga disponível, ausência de membro ativo e ausência de candidatura duplicada.

## Tarefas do projeto

- `GET /api/projetos/:id/tarefas?usuario_id=:id` lista tarefas não excluídas e membros ativos do projeto.
- `POST /api/projetos/:id/tarefas` permite que qualquer membro ativo crie uma tarefa com título, prioridade e responsável opcional. O responsável informado deve ser membro ativo do mesmo projeto; o status inicial é `todo`.
- `PATCH /api/tarefas/:id` altera título e prioridade, somente para o líder do projeto ou responsável atual.
- `PATCH /api/tarefas/:id/concluir` finaliza a tarefa, definindo status `done` e preenchendo `concluida_em`; somente líder ou responsável pode executar.
- `DELETE /api/tarefas/:id` realiza exclusão lógica por `excluida_em`, somente para líder ou responsável.
- `PATCH /api/tarefas/:id/status` mantém o fluxo do Kanban e atualiza `concluida_em` ao entrar ou sair de `done`.
- A API valida membro ativo, IDs, título (1 a 255 caracteres), prioridades (`low`, `medium`, `high`) e responsável. Não há alteração de schema para essas operações.
