# Componentes, navegação e estado

- Procure componentes equivalentes antes de criar um novo.
- Reutilize `AppHeader`, `NotificationsButton`, `AnimatedTabBar` e o tema quando aplicável.
- Preserve os stacks e tabs existentes e seus nomes de rota.
- Passe parâmetros de navegação com tipos e nomes compatíveis com as telas atuais.
- Use contextos existentes, especialmente autenticação e tema, antes de criar estado global.
- Limite estado local ao componente quando não houver necessidade de compartilhamento.
- Evite colocar chamadas de API diretamente em componentes reutilizáveis.
