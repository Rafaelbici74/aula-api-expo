# Regras de negócio

- Preserve as regras confirmadas no banco e no backend; não derive regras apenas da interface.
- Membros ativos são identificados por `membros_equipe.status = 'ativo'`.
- O líder do projeto é identificado pela relação entre `projetos.criador_id` e o usuário.
- Tarefas usam os status `todo`, `doing`, `review` e `done`.
- Qualquer membro ativo pode criar tarefas; o responsável é opcional e, quando definido, deve ser membro ativo do mesmo projeto.
- Somente o líder do projeto ou o responsável atual pode editar título/prioridade, excluir logicamente ou finalizar uma tarefa.
- Excluir tarefa define `excluida_em` sem apagar o registro; finalizar define status `done` e `concluida_em`.
- O Kanban mantém `concluida_em` coerente ao mover uma tarefa para `done` ou reabri-la em outro status.
- Candidaturas usam `pendente`, `aceito` e `rejeitado`; vagas usam `aberta` e `fechada`.
- Valide limites, duplicidade, disponibilidade, status do projeto e autorização no servidor.
- Antes de alterar regra de negócio, descreva comportamento atual, novo comportamento e impacto nos dados.
