# Segurança

- Nunca comite `.env`, senhas, tokens, chaves privadas ou dados pessoais desnecessários.
- Use queries parametrizadas e valide toda entrada externa.
- Faça autorização no servidor e limite dados retornados ao necessário.
- Não registre credenciais, tokens, senhas ou respostas sensíveis.
- Preserve hashing de senhas e mecanismos existentes de revogação.
- Considere exposição de IDs, enumeração de usuários, CORS, erros e integrações externas em cada alteração.
- Alterações de segurança exigem validação específica e não devem ser reduzidas a controles de interface.
