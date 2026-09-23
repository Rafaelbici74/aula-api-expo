# Regras de negócio

- Preserve as regras confirmadas no banco e no backend; não derive regras apenas da interface.
- Membros ativos são identificados por `membros_equipe.status = 'ativo'`.
- O líder do projeto é identificado pela relação entre `projetos.criador_id` e o usuário.
- Tarefas usam os status `todo`, `doing`, `review` e `done`.
- Candidaturas usam `pendente`, `aceito` e `rejeitado`; vagas usam `aberta` e `fechada`.
- Valide limites, duplicidade, disponibilidade, status do projeto e autorização no servidor.
- Antes de alterar regra de negócio, descreva comportamento atual, novo comportamento e impacto nos dados.
