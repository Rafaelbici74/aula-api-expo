# Autenticação e permissões

- Credenciais e tokens nunca devem ser expostos em código, logs, documentação pública ou respostas.
- Use o fluxo de autenticação e o `AuthContext` existentes.
- O cadastro local é público, cria a conta via API e não define usuário no `AuthContext`; somente o login autentica e inicia a navegação da área logada.
- Toda operação sensível deve validar usuário, projeto, membro ativo e autorização no backend.
- Não considere esconder um botão como controle de permissão.
- Diferencie usuário comum, líder, administrador e membro ativo conforme dados reais do sistema.
- Ao alterar permissões, teste acesso permitido, negado, usuário inexistente, projeto inexistente e vínculo inativo.
