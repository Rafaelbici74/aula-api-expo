# Mobile, Expo e React Native

- O app usa Expo `~54`, React Native `0.81` e JavaScript.
- Preserve a organização em `src/telas`, `src/components`, `src/routes`, `src/services`, `src/context` e `src/theme`.
- O mobile acessa a API por `src/config/api.js`; nunca conecte o app diretamente ao MySQL.
- Considere Android, iOS, Safe Area, teclado, telas pequenas e rolagem.
- Reutilize React Navigation e os stacks/tabs existentes.
- Use componentes e APIs já instalados antes de propor dependências novas.
- Mantenha estados de loading, erro, vazio e sucesso em telas que fazem requisições.
