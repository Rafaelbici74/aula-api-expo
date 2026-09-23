# Captura de telas para o TCC

## Objetivo

Use estas instruções quando o usuário solicitar prints ou capturas de uma ou mais telas do aplicativo para utilização na documentação do TCC.

## Definição do escopo

Antes de capturar, identifique:

- quais telas foram solicitadas;
- se o pedido representa uma tela isolada ou um fluxo completo;
- se deve capturar tema claro, tema escuro ou ambos;
- se deve registrar estado normal, loading, vazio, erro ou sucesso;
- se a captura deve mostrar uma ação específica;
- onde os arquivos devem ser armazenados, caso o usuário tenha informado um destino.

Se a solicitação estiver ambígua, faça uma pergunta antes de iniciar. Não capture o projeto inteiro quando o usuário pediu uma tela específica.

## Preparação

Verifique se o aplicativo está acessível em um ambiente executável, como:

- emulador Android;
- dispositivo físico;
- Expo Web;
- navegador ou outra ferramenta disponível no ambiente.

Antes de capturar:

1. confirme que o backend necessário está disponível;
2. confirme que a tela pode ser alcançada;
3. use dados de teste ou dados autorizados;
4. remova ou oculte informações sensíveis quando possível;
5. configure o estado solicitado;
6. aguarde o carregamento terminar, salvo quando o estado de loading for o objetivo.

Não invente capturas, não use imagens de outra tela e não declare uma captura realizada sem verificar o arquivo gerado.

## Captura e organização

Capture somente as telas solicitadas e preserve enquadramento, legibilidade e resolução adequados para documentação.

Use nomes ordenados e descritivos, por exemplo:

- `01-login.png`
- `02-home.png`
- `03-meus-projetos.png`
- `04-detalhes-projeto.png`
- `05-tarefas-kanban.png`

Quando houver estados diferentes, inclua o estado no nome:

- `05-tarefas-kanban-vazio.png`
- `05-tarefas-kanban-loading.png`
- `05-tarefas-kanban-erro.png`
- `05-tarefas-kanban-tema-escuro.png`

Não substitua capturas existentes sem autorização. Se o destino não for informado, mantenha os arquivos em um local de trabalho apropriado e informe onde foram salvos.

## Proteção de dados

- Não deixe senhas, tokens, chaves, credenciais ou dados pessoais desnecessários visíveis.
- Não utilize contas ou dados de terceiros sem autorização.
- Evite capturar informações reais que não sejam necessárias para explicar a funcionalidade.
- Se não for possível ocultar um dado sensível, interrompa e informe o usuário.

## Registro da captura

Para cada arquivo, informe:

- nome do arquivo;
- tela ou fluxo representado;
- estado capturado;
- ambiente utilizado;
- caminho em que foi salvo;
- observações relevantes.

Exemplo:

```md
| Arquivo | Tela | Estado | Ambiente |
|---|---|---|---|
| `05-tarefas-kanban.png` | Tarefas do projeto | Com tarefas | Emulador Android |
```

## Limitações

Se o ambiente não permitir captura direta, informe a limitação de forma explícita. Explique se faltou emulador, dispositivo, servidor, dados, autenticação ou ferramenta de captura. Não produza uma imagem substituta e não afirme que o print foi realizado.

Se o usuário fornecer uma imagem externa, trate-a como referência ou material fornecido pelo usuário; não a apresente como captura realizada pelo agente.

## Alterações no projeto

Capturar telas não autoriza alterar código, banco, dependências ou configurações. Caso seja necessário modificar a aplicação para tornar uma tela capturável, pare, analise a necessidade e solicite aprovação separadamente.

## Resultado final

Ao terminar, informe:

- quais telas foram capturadas;
- quais estados foram registrados;
- quais arquivos foram gerados;
- onde foram salvos;
- validações realizadas;
- capturas que não puderam ser realizadas e o motivo.
