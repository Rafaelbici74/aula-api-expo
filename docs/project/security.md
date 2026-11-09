# Segurança

- Nunca comite `.env`, senhas, tokens, chaves privadas ou dados pessoais desnecessários.
- Use queries parametrizadas e valide toda entrada externa.
- Faça autorização no servidor e limite dados retornados ao necessário.
- Não registre credenciais, tokens, senhas ou respostas sensíveis.
- Gere no backend hash bcrypt para senhas de novas contas; nunca armazene nem retorne a senha em texto puro.
- A autenticação ainda mantém comparação com senhas legadas em texto puro. Não amplie esse comportamento; migração dessas contas exige plano separado.
- Limite senhas bcrypt a 72 bytes para evitar truncamento silencioso.
- Códigos de recuperação devem ser aleatórios, armazenados como HMAC-SHA256 usando `RESET_CODE_SECRET`, expirar em 15 minutos e ser invalidados após o uso.
- A resposta ao pedido de recuperação não deve confirmar se o e-mail existe; nunca exponha códigos, hashes de recuperação ou credenciais SMTP em respostas ou logs.
- Os limites atuais de recuperação são por IP e em memória por instância; produção com múltiplas instâncias deve usar rate limiting compartilhado e confiável.
- O envio SMTP pelo Nodemailer ocorre em segundo plano, serializado por usuário e em memória no processo da API; uma interrupção do processo pode perder o envio pendente, portanto produção com requisitos de entrega deve adotar fila persistente.
- Considere exposição de IDs, enumeração de usuários, CORS, erros e integrações externas em cada alteração.
- O plugin `plugins/withAndroidCleartextTraffic.js` permite conexões HTTP sem criptografia no app para desenvolvimento local no emulador. Remova-o da configuração de produção e sirva a API por HTTPS.
- Alterações de segurança exigem validação específica e não devem ser reduzidas a controles de interface.
