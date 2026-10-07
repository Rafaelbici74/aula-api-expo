# Formulários, validações e feedback

- Valide entradas no mobile para UX e novamente no backend para segurança.
- Mostre mensagens claras para campos inválidos, falhas de API e ações concluídas.
- Não descarte erros silenciosamente.
- Toda operação assíncrona deve considerar loading, sucesso, erro e prevenção de toques duplicados.
- Trate estados vazios explicitamente e ofereça ação útil quando aplicável.
- Preserve o padrão de modais, alertas e confirmações já usado pelo projeto.
- No cadastro, mostre progresso durante a requisição e só confirme a criação após resposta bem-sucedida da API; apresente erros de validação, conexão ou e-mail duplicado sem limpar os campos.
- Após o cadastro bem-sucedido, encaminhe o usuário ao login; não simule autenticação local.
- No Kanban, o usuário deve segurar uma tarefa que pode mover por 2,5 segundos; somente uma barra animada indica a contagem. Após esse tempo, uma cópia visual da tarefa acompanha o dedo acima das colunas e listas, e o quadro rola horizontalmente ao alcançar suas bordas. Antes de completar a contagem, movimentos cancelam o arraste e permanecem disponíveis para rolagem normal.
