# Aula API Expo

Aplicação mobile para gerenciamento de projetos colaborativos, equipes, candidaturas, notificações, avaliações e tarefas. O projeto é composto por um aplicativo Expo/React Native e uma API Express integrada a um banco de dados MySQL externo.

## Visão geral

O sistema permite que usuários:

- realizem login, cadastro e recuperação de senha;
- mantenham informações de perfil, bio e localização;
- consultem projetos disponíveis;
- pesquisem e filtrem projetos por status;
- solicitem entrada em vagas de projetos;
- acompanhem candidaturas e confirmações de entrada;
- visualizem projetos dos quais participam;
- consultem detalhes, equipe, vagas, habilidades, links e avaliações;
- recebam e gerenciem notificações;
- acompanhem tarefas em formato Kanban;
- assumam tarefas sem responsável;
- movam tarefas entre status conforme suas permissões;
- deleguem tarefas para outros membros ativos;
- alternem entre tema claro e escuro.

## Tecnologias

### Aplicativo mobile

- Expo `~54.0.37`
- React `19.1.0`
- React Native `0.81.5`
- React Navigation
- `@expo/vector-icons`
- AsyncStorage
- JavaScript

### Backend

- Node.js
- Express
- CORS
- `mysql2/promise`
- `bcryptjs`
- `dotenv`

### Banco de dados

- MySQL externo
- Pool de conexões com charset `utf8mb4`
- Credenciais carregadas por variáveis de ambiente

## Arquitetura

```text
Aplicativo Expo/React Native
        |
        | HTTP/JSON
        v
API Express (server.js)
        |
        | mysql2/promise
        v
Banco MySQL externo
```

O aplicativo mobile não acessa o MySQL diretamente. Todas as consultas e alterações passam pela API Express.

## Estrutura do projeto

```text
.
├── App.js
├── index.js
├── server.js
├── app.json
├── package.json
├── .env.example
├── assets/
├── docs/
│   ├── project/
│   └── TCC/
└── src/
    ├── components/
    ├── config/
    ├── context/
    ├── dataBase/
    ├── routes/
    ├── services/
    ├── telas/
    ├── theme/
    └── stylesGlobal.js
```

### Principais diretórios

- `src/telas`: telas de autenticação e aplicação.
- `src/components`: componentes reutilizáveis.
- `src/services`: comunicação com a API e serviços externos.
- `src/routes`: navegação por stacks e abas.
- `src/context`: contextos compartilhados, como autenticação.
- `src/theme`: tema claro/escuro e transições visuais.
- `src/dataBase`: conexão MySQL utilizada pelo backend.
- `docs/project`: instruções técnicas para o agente de desenvolvimento.
- `docs/TCC`: instruções para documentação acadêmica e captura de telas.

## Configuração do ambiente

### Pré-requisitos

- Node.js instalado.
- npm instalado.
- MySQL acessível pela API.
- Expo CLI disponibilizado pelo projeto.
- Emulador Android, dispositivo físico ou Expo Web.

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto. Os nomes utilizados pela conexão são:

```env
BD_SERVIDOR=localhost
BD_PORTA=3306
BD_USUARIO=seu_usuario
BD_SENHA=sua_senha
BD_BANCO=seu_banco
PORT=3333
```

Também podem ser utilizados os nomes alternativos definidos em `src/dataBase/connection.js`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_banco
```

Nunca versione o arquivo `.env` nem exponha credenciais.

### Instalação

```bash
npm install
```

### Executar a API

```bash
npm run server
```

Modo de desenvolvimento:

```bash
npm run server:dev
```

A API utiliza a porta definida por `PORT` ou, por padrão, a porta `3333`.

### Executar o aplicativo

```bash
npm start
```

Comandos disponíveis:

```bash
npm run android
npm run ios
npm run web
```

No emulador Android, a URL padrão da API é:

```text
http://10.0.2.2:3333
```

Em iOS e web, o fallback é:

```text
http://localhost:3333
```

Esse endereço pode ser substituído por `EXPO_PUBLIC_API_URL`.

## Configuração do Expo

O arquivo `app.json` define:

- nome e slug `aula-api-expo`;
- orientação portrait;
- ícone e splash screen;
- suporte a tablets no iOS;
- adaptive icon no Android;
- execução edge-to-edge no Android;
- favicon para web;
- plugin `expo-font`;
- New Architecture habilitada.

## Navegação

O fluxo principal utiliza:

- `RootStack`: autenticação e entrada da aplicação.
- `HomeStackNavigator`: Home e detalhes do projeto.
- `ProjectsStackNavigator`: Meus Projetos e tarefas.
- `TabNavigator`: abas principais.

As abas atuais são:

1. Home
2. Meus Projetos
3. Perfil
4. Configurações

A barra inferior é customizada em `AnimatedTabBar.js`. As abas não selecionadas exibem somente o ícone; a aba ativa exibe também seu nome e um indicador animado.

## Funcionalidades do aplicativo

### Autenticação

O sistema possui:

- login;
- cadastro;
- recuperação de senha;
- validação de credenciais pela API;
- armazenamento do usuário no `AuthContext`.

O backend utiliza `bcryptjs` para senhas e mantém estruturas relacionadas a recuperação e revogação de tokens no banco.

### Perfil

O usuário pode consultar e atualizar:

- nome;
- e-mail;
- bio;
- localização;
- avatar, quando disponível;
- dados profissionais existentes no banco.

A localização pode utilizar a integração com a API do IBGE por meio de `src/services/ibgeApi.js`.

### Projetos

A Home lista projetos cadastrados no banco e apresenta:

- título;
- descrição;
- status;
- quantidade atual e limite de membros;
- disponibilidade de candidaturas;
- busca;
- filtros;
- progresso de tarefas.

Os status de projeto existentes são:

- `aberto`;
- `em_andamento`;
- `finalizado`.

### Meus Projetos

A aba Meus Projetos lista os projetos nos quais o usuário possui vínculo ativo. Cada card apresenta:

- título;
- status;
- descrição;
- quantidade de membros;
- função do usuário;
- progresso das tarefas;
- botão para abrir os detalhes;
- botão para abrir o Kanban de tarefas.

Os cards utilizam layout responsivo, tema atual e botões com áreas de toque ampliadas.

### Detalhes do projeto

A tela de detalhes apresenta, quando disponível:

- dados gerais;
- equipe;
- líder;
- funções;
- vagas;
- habilidades;
- tarefas e progresso;
- atividades;
- links externos;
- avaliações dos membros;
- fluxo de candidatura.

O líder é identificado por `projetos.criador_id`. Membros ativos são identificados por `membros_equipe.status = 'ativo'`.

### Candidaturas e entrada em projetos

O fluxo de candidatura utiliza as tabelas `candidaturas`, `vagas_projeto` e `membros_equipe`.

O fluxo inclui:

1. usuário consulta vagas;
2. usuário envia candidatura;
3. criador do projeto aceita ou rejeita;
4. usuário recebe notificação;
5. usuário confirma ou recusa a entrada;
6. a confirmação cria ou atualiza o vínculo ativo;
7. a quantidade preenchida da vaga é atualizada;
8. o botão de candidatura desaparece para membros ativos.

Status de candidatura:

- `pendente`;
- `aceito`;
- `rejeitado`.

### Notificações

As notificações são consultadas pela API e exibidas em um botão reutilizável.

O recurso possui:

- listagem de notificações;
- indicador visual de não lidas;
- contador de não lidas;
- marcação individual;
- marcação em massa;
- redirecionamento para o projeto relacionado;
- tratamento de respostas inválidas ou não JSON.

### Avaliações

As avaliações são armazenadas em `avaliacoes` e podem ser consultadas:

- por projeto;
- por membro;
- de forma global no perfil do usuário.

Cada avaliação pode conter nota, comentário, avaliador, avaliado, projeto e data.

## Kanban de tarefas

A tela de tarefas apresenta quatro colunas:

- `todo`: A fazer;
- `doing`: Em andamento;
- `review`: Em revisão;
- `done`: Concluídas.

Cada tarefa pode exibir:

- título;
- descrição;
- responsável;
- prioridade;
- data de vencimento;
- dificuldade.

O Kanban possui:

- rolagem horizontal entre colunas;
- rolagem vertical independente em cada coluna;
- cards com contenção de conteúdo;
- suporte a tema claro e escuro;
- arraste entre status;
- botão para assumir tarefa sem responsável;
- menu de delegação para o responsável atual.

### Permissões de tarefas

- O líder pode mover qualquer tarefa do projeto.
- Um membro comum só pode mover tarefas atribuídas a ele.
- Somente membros ativos podem consultar e alterar tarefas.
- Uma tarefa sem responsável pode ser assumida por um membro ativo.
- Somente o responsável atual pode delegar a tarefa.
- A delegação só pode ser feita para outro membro ativo do mesmo projeto.

As validações são aplicadas na API, e não apenas na interface.

## API disponível

As rotas principais implementadas em `server.js` são:

### Saúde e autenticação

```text
GET  /api/health
POST /api/login
```

### Perfil

```text
GET /api/usuarios/:id/perfil
GET /api/usuarios/:id/avaliacao
PUT /api/usuarios/:id/bio
PUT /api/usuarios/:id/localizacao
```

### Notificações

```text
GET   /api/usuarios/:id/notificacoes
PATCH /api/notificacoes/:id/lida
PATCH /api/usuarios/:id/notificacoes/ler-todas
```

### Projetos

```text
GET /api/projetos
GET /api/usuarios/:id/projetos
GET /api/projetos/:id/detalhes
GET /api/projetos/:id/vagas
```

### Candidaturas

```text
GET   /api/projetos/:id/candidatura/:usuarioId
GET   /api/projetos/:id/candidaturas
POST  /api/candidaturas
PATCH /api/candidaturas/:id/aceitar
PATCH /api/candidaturas/:id/rejeitar
PATCH /api/candidaturas/:id/confirmar-entrada
PATCH /api/candidaturas/:id/recusar-entrada
```

### Tarefas

```text
GET   /api/projetos/:id/tarefas?usuario_id=:usuarioId
PATCH /api/tarefas/:id/status
PATCH /api/tarefas/:id/assumir
PATCH /api/tarefas/:id/delegar
```

Todas as rotas que alteram dados devem validar entrada, existência do recurso, vínculo do usuário e permissão da operação.

## Banco de dados

O schema real do projeto está documentado em [docs/project/database.md](docs/project/database.md).

Entre as principais tabelas estão:

- `usuarios`;
- `projetos`;
- `membros_equipe`;
- `vagas_projeto`;
- `candidaturas`;
- `tarefas`;
- `subtarefas`;
- `notificacoes`;
- `avaliacoes`;
- `habilidades`;
- `funcoes`;
- tabelas de integração com GitHub;
- tabelas de eventos, reputação e estatísticas.

Relacionamentos importantes:

- projetos pertencem a um criador em `usuarios`;
- membros relacionam usuários e projetos;
- tarefas pertencem a projetos e podem ter um responsável;
- vagas pertencem a projetos e funções;
- candidaturas relacionam usuários, projetos e vagas;
- subtarefas pertencem a tarefas;
- commits e pull requests relacionam-se a tarefas e projetos.

Antes de qualquer alteração relacionada ao banco, consulte obrigatoriamente o schema real, as queries existentes e [docs/project/database.md](docs/project/database.md).

## Tema e estilos

O tema é centralizado em `src/theme/ThemeContext.js` e possui:

- tema claro;
- tema escuro;
- persistência da preferência com AsyncStorage;
- animação de transição;
- cores para fundo, superfície, texto, bordas, cabeçalho, erro e elementos primários.

As telas mantêm seus estilos em arquivos `styles.js` próximos aos componentes. Novas interfaces devem reutilizar o tema e o sistema visual existente.

## Integrações

### IBGE

Utilizada para consulta de dados de localização por meio de `src/services/ibgeApi.js`.

### GitHub

O banco possui estruturas para:

- repositórios;
- branches;
- commits;
- pull requests;
- webhooks;
- status de integração;
- atividades relacionadas a tarefas.

As estruturas de GitHub existentes devem ser consultadas antes de implementar qualquer novo fluxo de integração.

## Scripts

```bash
npm start
npm run android
npm run ios
npm run web
npm run server
npm run server:dev
```

Para gerar o bundle Android:

```bash
npx expo export --platform android
```

## Validações realizadas

Durante o desenvolvimento foram realizadas as seguintes verificações:

- validação de sintaxe de `server.js` com `node --check`;
- consultas aos endpoints da API com o banco real;
- verificação de projetos, membros, candidaturas e tarefas;
- validação de autorização para operações de tarefas;
- teste de retorno HTTP 403 para usuário sem permissão;
- geração do bundle Android com `npx expo export --platform android`;
- conferência das colunas e relacionamentos do banco MySQL.

## Documentação complementar

As instruções de desenvolvimento estão em [docs/project/](docs/project/).

As instruções de documentação do TCC estão em [docs/TCC/](docs/TCC/), incluindo:

- [documentar-projeto.md](docs/TCC/documentar-projeto.md);
- [capturar-telas.md](docs/TCC/capturar-telas.md).

## Segurança e manutenção

- Não versione `.env`.
- Não exponha senhas, tokens ou credenciais.
- Use queries parametrizadas.
- Valide permissões no backend.
- Não altere o banco sem consultar o schema e aprovar o plano.
- Preserve componentes e estilos existentes.
- Registre problemas pré-existentes separadamente.
- Atualize a documentação quando funcionalidades ou regras importantes forem modificadas.

## Estado atual

O projeto possui implementados:

- autenticação básica;
- perfil e localização;
- tema claro/escuro;
- navegação por abas;
- listagem e detalhes de projetos;
- candidaturas e entrada em equipes;
- avaliações;
- notificações;
- aba Meus Projetos;
- Kanban de tarefas com permissões;
- assumir, mover e delegar tarefas;
- documentação técnica em `docs/project`;
- instruções para documentação do TCC em `docs/TCC`.

O README descreve o estado observado no momento da documentação. Novas funcionalidades, alterações no banco ou mudanças de arquitetura devem ser refletidas neste arquivo após serem implementadas e validadas.
