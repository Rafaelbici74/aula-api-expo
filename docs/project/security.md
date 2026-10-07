# Segurança

- Nunca comite `.env`, senhas, tokens, chaves privadas ou dados pessoais desnecessários.
- Use queries parametrizadas e valide toda entrada externa.
- Faça autorização no servidor e limite dados retornados ao necessário.
- Não registre credenciais, tokens, senhas ou respostas sensíveis.
- Gere no backend hash bcrypt para senhas de novas contas; nunca armazene nem retorne a senha em texto puro.
- A autenticação ainda mantém comparação com senhas legadas em texto puro. Não amplie esse comportamento; migração dessas contas exige plano separado.
- Limite senhas bcrypt a 72 bytes para evitar truncamento silencioso.
- Considere exposição de IDs, enumeração de usuários, CORS, erros e integrações externas em cada alteração.
- Alterações de segurança exigem validação específica e não devem ser reduzidas a controles de interface.
