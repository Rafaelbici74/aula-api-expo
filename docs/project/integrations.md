# Integrações externas

- Integrações confirmadas incluem IBGE e GitHub, MySQL externo e envio de e-mail por SMTP com Nodemailer para recuperação de senha.
- Centralize chamadas externas nos serviços existentes.
- Use variáveis de ambiente para URLs, credenciais e configurações.
- Valide timeout, status HTTP, formato da resposta e indisponibilidade do serviço.
- Não exponha tokens ou segredos no mobile.
- Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` e `RESET_CODE_SECRET` somente no ambiente do backend. Use os dados de conexão e um remetente autorizado pelo provedor SMTP. Gere o segredo de recuperação com fonte criptograficamente segura e mantenha-o com pelo menos 32 bytes.
- O envio de recuperação usa um transporte SMTP reutilizável do Nodemailer com timeouts de conexão, saudação e socket; falhas são registradas apenas pelo código do erro, sem dados do destinatário ou do código, e o hash pendente é invalidado.
- Antes de adicionar uma integração, verifique se já existe serviço ou fluxo equivalente.
