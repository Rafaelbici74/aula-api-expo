# Mobile, Expo e React Native

- O app usa Expo `~54`, React Native `0.81` e JavaScript.
- Preserve a organização em `src/telas`, `src/components`, `src/routes`, `src/services`, `src/context` e `src/theme`.
- O mobile acessa a API por `src/config/api.js`; nunca conecte o app diretamente ao MySQL.
- O plugin `plugins/withAndroidCleartextTraffic.js` permite HTTP no build Android de desenvolvimento para acessar a API local pelo emulador (`10.0.2.2:3333`). Para publicar o app, configure a API com HTTPS e remova essa permissão.
- Considere Android, iOS, Safe Area, teclado, telas pequenas e rolagem.
- Reutilize React Navigation e os stacks/tabs existentes.
- Use componentes e APIs já instalados antes de propor dependências novas.
- Mantenha estados de loading, erro, vazio e sucesso em telas que fazem requisições.
- A orientação padrão é retrato. A rota Tarefas acompanha a orientação física do dispositivo em Android e iPhone enquanto estiver em foco e restaura retrato ao sair.
- `expo-screen-orientation` controla a orientação em tempo de execução; a configuração nativa permite ambos os sentidos. No iPad, a multitarefa permanece habilitada e o sistema pode permitir rotação fora da tela Tarefas.
- Em Tarefas, calcule a altura das colunas a partir do espaço real do quadro e mantenha os `ScrollView` internos limitados para permitir rolagem vertical em paisagem. Cancele o gesto e libere o scroll ao mudar a orientação ou sair da rota.