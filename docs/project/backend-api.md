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

## Candidaturas e análise de perfil

- `POST /api/candidaturas` cria uma candidatura pendente e gera uma notificação do tipo `application` para o criador do projeto.
- `GET /api/projetos/:id/candidaturas?usuario_id=:criadorId` lista candidaturas pendentes somente para o criador do projeto.
- `GET /api/candidaturas/:id/perfil?usuario_id=:criadorId` retorna os dados públicos do candidato, avaliação, funções, habilidades e mensagem da candidatura; o acesso é restrito ao criador do projeto.
- `PATCH /api/candidaturas/:id/aceitar` e `PATCH /api/candidaturas/:id/rejeitar` exigem o ID do criador no body e notificam o candidato sobre o resultado.
- Ao aceitar uma candidatura, a notificação de decisão do líder é convertida em uma mensagem informativa de que o candidato foi aceito e aguarda confirmação; os botões de análise, aceite e rejeição deixam de aparecer.
- Ao confirmar a entrada, o sistema notifica o líder sobre a entrada efetiva do novo membro.
- Antes de criar uma candidatura, valide projeto aberto, vaga disponível, ausência de membro ativo e ausência de candidatura duplicada.
