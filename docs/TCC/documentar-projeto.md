# Documentação do projeto para o TCC

## Objetivo

Use estas instruções quando o usuário solicitar a documentação de uma parte do projeto ou do sistema inteiro. O resultado deve ser retornado em texto Markdown, pronto para copiar e adaptar na documentação do TCC.

## Definição do escopo

Antes de analisar, identifique se o pedido trata de:

- uma funcionalidade;
- uma tela ou fluxo de telas;
- um componente;
- um módulo;
- o backend ou uma API;
- o banco de dados;
- uma integração externa;
- uma regra de negócio;
- testes e validações;
- ou o projeto inteiro.

Se o escopo não estiver claro, faça uma pergunta objetiva antes de produzir a documentação. Não assuma que uma solicitação sobre uma tela representa todo o projeto.

## Investigação obrigatória

Analise somente informações confirmadas no projeto. Conforme o escopo, consulte:

- arquivos de código relacionados;
- `AGENTS.md`;
- arquivos de `docs/project`;
- README e configurações;
- componentes, telas, rotas, serviços e contextos;
- endpoints e fluxo de dados;
- estilos, tema, navegação e estados da interface;
- regras de negócio;
- testes, comandos e validações existentes;
- banco de dados, quando houver persistência ou relacionamento com dados.

Quando a documentação envolver banco de dados, é obrigatório:

1. consultar a estrutura real do banco;
2. verificar tabelas, colunas, tipos, chaves, relacionamentos, constraints, índices, defaults e obrigatoriedade;
3. consultar `docs/project/database.md`;
4. confirmar como o código acessa os dados;
5. não inventar tabelas, campos, relações, queries ou resultados.

## Conteúdo da resposta

Organize a resposta conforme o escopo. Quando aplicável, use esta estrutura:

```md
# Título da seção

## Objetivo

## Contexto

## Funcionamento

## Arquitetura e componentes envolvidos

## Fluxo do usuário

## Dados e banco de dados

## APIs e integrações

## Regras de negócio

## Interface e experiência do usuário

## Validações e testes

## Limitações

## Conclusão
```

Não inclua seções que não tenham relação com o escopo. Para uma funcionalidade específica, concentre-se nos arquivos, dados, fluxos e decisões daquela funcionalidade. Para o projeto inteiro, apresente uma visão integrada da aplicação mobile, API, banco, navegação, integrações e validações.

## Regras de escrita

- Escreva em linguagem técnica, clara e objetiva.
- Retorne Markdown válido e pronto para copiar.
- Explique o que existe no projeto, não o que seria ideal implementar.
- Use nomes reais de arquivos, telas, rotas, tabelas e componentes somente após confirmá-los.
- Explique termos técnicos na primeira vez em que forem usados, quando necessário.
- Diferencie comportamento implementado, comportamento observado e limitação.
- Não invente requisitos acadêmicos, métricas, resultados, usuários, dados ou funcionalidades.
- Não apresente uma hipótese como fato.
- Quando uma informação não puder ser confirmada, escreva claramente que ela não foi localizada ou validada.
- Não exponha senhas, tokens, credenciais ou dados pessoais desnecessários.

## Execução e alterações

Este documento orienta a produção de texto. A solicitação de documentação não autoriza alterar código, banco, dependências ou configurações. Não crie ou modifique capítulos do TCC sem pedido explícito do usuário.

Se for necessário executar uma verificação somente de leitura, informe no resultado quais arquivos, endpoints, consultas ou comandos foram utilizados. Nunca declare uma validação que não foi realizada.

## Resultado final

Ao terminar, informe brevemente:

- escopo documentado;
- fontes analisadas;
- dados ou tabelas consultados, quando aplicável;
- validações realizadas;
- limitações ou informações não confirmadas.
