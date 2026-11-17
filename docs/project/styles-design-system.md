# Estilos e sistema visual

- Antes de criar estilos, procure `styles.js`, `stylesGlobal.js`, `ThemeContext` e componentes existentes.
- Reutilize cores, tipografia, espaçamento, bordas, raios, sombras e áreas de toque já adotados.
- O tema claro/escuro deve ser obtido pelo `ThemeContext`; não codifique cores incompatíveis.
- Para texto sobre botões primários, use `theme.onPrimary`; para botões de ação destrutiva, use `theme.onDanger`.
- Use `theme.onStatus` sobre badges de status e mantenha os fundos semânticos escuros o bastante para texto legível nos dois temas.
- A escala compartilhada está em `src/stylesGlobal.js`: espaçamentos de 4/8/16/24 px, raios de 8/12/16 px (e pill) e tamanhos de fonte de 12/14/16/20/26 px. Prefira esses tokens a valores novos quando forem apropriados.
- Cartões de conteúdo devem priorizar uma superfície uniforme, borda sutil e raio de 16 px; controles devem manter áreas de toque confortáveis e raios consistentes.
- Preserve contraste, hierarquia, responsividade e consistência entre telas.
- Estados de foco, pressionado, disabled, loading, erro e vazio devem ser visíveis.
- Evite estilos inline repetidos e não crie uma identidade visual paralela.
- Valide visualmente rolagem, overflow, teclado, Safe Area e diferentes larguras.
