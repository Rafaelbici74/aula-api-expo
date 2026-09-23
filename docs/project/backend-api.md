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
