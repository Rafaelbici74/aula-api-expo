// Carrega as variáveis de ambiente do arquivo .env.
require('dotenv').config();

// Importa os pacotes necessários para o servidor.
const express = require('express');
const cors = require('cors');
const db = require('./src/dataBase/connection');
const { autenticar } = require('./src/services/authService');
const {
  buscarPerfil,
  atualizarBio,
  atualizarLocalizacao,
} = require('./src/services/profileService');

// Cria a aplicação Express.
const app = express();
const PORT = process.env.PORT || 3333;

// Habilita CORS para que o app mobile possa acessar a API.
app.use(cors());

// Permite receber JSON no body das requisições.
app.use(express.json());

// Endpoint simples para testar se a API está online.
app.get('/api/health', async (req, res) => {
  res.json({ ok: true, message: 'API online' });
});

app.get('/api/usuarios/:id/perfil', async (req, res) => {
  try {
    const perfil = await buscarPerfil(req.params.id);
    if (!perfil) {
      return res.status(404).json({ sucesso: false, message: 'Usuário não encontrado.' });
    }
    return res.json({ sucesso: true, dados: perfil });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível carregar o perfil.' });
  }
});

app.get('/api/usuarios/:id/avaliacao', async (req, res) => {
  const usuarioId = Number(req.params.id);
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return res.status(400).json({ sucesso: false, message: 'Usuário inválido.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) AS total, ROUND(AVG(nota), 2) AS media
      FROM avaliacoes
      WHERE avaliado_id = ?
    `, [usuarioId]);

    return res.json({ sucesso: true, dados: rows[0] });
  } catch (error) {
    console.error('Erro ao buscar avaliação do usuário:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível carregar a avaliação.' });
  }
});

app.get('/api/usuarios/:id/notificacoes', async (req, res) => {
  const usuarioId = Number(req.params.id);
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return res.status(400).json({ sucesso: false, message: 'Usuário inválido.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT id, usuario_id, tipo, titulo, descricao, link, lida, criado_em
      FROM notificacoes
      WHERE usuario_id = ?
      ORDER BY lida ASC, criado_em DESC
      LIMIT 50
    `, [usuarioId]);
    const [unreadRows] = await db.query(`
      SELECT COUNT(*) AS total
      FROM notificacoes
      WHERE usuario_id = ? AND lida = 0
    `, [usuarioId]);

    return res.json({
      sucesso: true,
      dados: rows,
      nao_lidas: Number(unreadRows[0]?.total || 0),
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível carregar as notificações.' });
  }
});

app.patch('/api/notificacoes/:id/lida', async (req, res) => {
  const notificacaoId = Number(req.params.id);
  const usuarioId = Number(req.body?.usuario_id);
  if (!Number.isInteger(notificacaoId) || !Number.isInteger(usuarioId) || notificacaoId <= 0 || usuarioId <= 0) {
    return res.status(400).json({ sucesso: false, message: 'Notificação ou usuário inválido.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE notificacoes SET lida = 1 WHERE id = ? AND usuario_id = ?',
      [notificacaoId, usuarioId],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ sucesso: false, message: 'Notificação não encontrada.' });
    }
    return res.json({ sucesso: true, message: 'Notificação marcada como lida.' });
  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível atualizar a notificação.' });
  }
});

app.patch('/api/usuarios/:id/notificacoes/ler-todas', async (req, res) => {
  const usuarioId = Number(req.params.id);
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return res.status(400).json({ sucesso: false, message: 'Usuário inválido.' });
  }

  try {
    await db.query('UPDATE notificacoes SET lida = 1 WHERE usuario_id = ? AND lida = 0', [usuarioId]);
    return res.json({ sucesso: true, message: 'Notificações marcadas como lidas.' });
  } catch (error) {
    console.error('Erro ao marcar notificações:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível atualizar as notificações.' });
  }
});

app.put('/api/usuarios/:id/bio', async (req, res) => {
  const bio = typeof req.body?.bio === 'string' ? req.body.bio.trim() : '';
  if (bio.length > 1000) {
    return res.status(400).json({ sucesso: false, message: 'A bio deve ter no máximo 1000 caracteres.' });
  }
  try {
    const perfil = await atualizarBio(req.params.id, bio);
    return res.json({ sucesso: true, dados: perfil });
  } catch (error) {
    console.error('Erro ao atualizar bio:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível salvar a bio.' });
  }
});

app.put('/api/usuarios/:id/localizacao', async (req, res) => {
  const localizacao = typeof req.body?.localizacao === 'string' ? req.body.localizacao.trim() : '';
  if (localizacao.length > 255) {
    return res.status(400).json({ sucesso: false, message: 'A localização é muito longa.' });
  }
  try {
    const perfil = await atualizarLocalizacao(req.params.id, localizacao);
    return res.json({ sucesso: true, dados: perfil });
  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível salvar a localização.' });
  }
});

app.post('/api/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const senha = typeof req.body?.senha === 'string' ? req.body.senha : '';

  if (!email || !senha) {
    return res.status(400).json({
      sucesso: false,
      message: 'Informe o e-mail e a senha.',
    });

  }

  try {
    const usuario = await autenticar(email, senha);

    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        message: 'E-mail ou senha inválidos.',
      });
    }

    return res.status(200).json({
      sucesso: true,
      message: 'Login realizado com sucesso.',
      usuario,
    });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return res.status(500).json({
      sucesso: false,
      message: 'Não foi possível realizar o login.',
    });
  }
});

// Lista todos os projetos do banco.
app.get('/api/projetos', async (req, res) => {
  try {
    // Executa a query no banco e retorna os dados em formato JSON.
    const [rows] = await db.query(`
      SELECT
        id,
        titulo,
        descricao,
        status,
        limite_membros,
        (
          SELECT COUNT(*)
          FROM membros_equipe me
          WHERE me.projeto_id = projetos.id
            AND me.status = 'ativo'
        ) AS membros_atuais,
        CASE
          WHEN status <> 'aberto' THEN 0
          WHEN (
            SELECT COUNT(*)
            FROM membros_equipe me
            WHERE me.projeto_id = projetos.id
              AND me.status = 'ativo'
          ) >= limite_membros THEN 0
          WHEN NOT EXISTS (
            SELECT 1
            FROM vagas_projeto vp
            WHERE vp.projeto_id = projetos.id
              AND vp.status = 'aberta'
              AND vp.preenchidas < vp.quantidade
          ) THEN 0
          ELSE 1
        END AS aceita_candidaturas,
        CASE
          WHEN status <> 'aberto' THEN 'Projeto não está aberto'
          WHEN (
            SELECT COUNT(*)
            FROM membros_equipe me
            WHERE me.projeto_id = projetos.id
              AND me.status = 'ativo'
          ) >= limite_membros THEN 'Limite de membros atingido'
          WHEN NOT EXISTS (
            SELECT 1
            FROM vagas_projeto vp
            WHERE vp.projeto_id = projetos.id
              AND vp.status = 'aberta'
              AND vp.preenchidas < vp.quantidade
          ) THEN 'Não há vagas disponíveis'
          ELSE NULL
        END AS motivo_candidatura_indisponivel,
        criado_em
      FROM projetos
      ORDER BY criado_em DESC
    `);

    return res.status(200).json({
      sucesso: true,
      message: 'Lista de projetos',
      nItens: rows.length,
      dados: rows,
    });
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    return res.status(500).json({
      sucesso: false,
      message: 'Erro na listagem de projetos',
      dados: null,
    });
  }
});

app.get('/api/usuarios/:id/projetos', async (req, res) => {
  const usuarioId = Number(req.params.id);
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    return res.status(400).json({ sucesso: false, message: 'Usuário inválido.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT
        p.id, p.titulo, p.descricao, p.status, p.limite_membros, p.criado_em,
        p.repositorio_url, p.figma_url, p.discord_url, p.documentacao_url,
        me.funcao, me.funcao_id, f.nome AS funcao_nome, me.entrou_em,
        (
          SELECT COUNT(*)
          FROM membros_equipe membros
          WHERE membros.projeto_id = p.id AND membros.status = 'ativo'
        ) AS membros_atuais,
        (
          SELECT COUNT(*)
          FROM tarefas t
          WHERE t.projeto_id = p.id AND t.excluida_em IS NULL
        ) AS tarefas_total,
        (
          SELECT COUNT(*)
          FROM tarefas t
          WHERE t.projeto_id = p.id AND t.status = 'done' AND t.excluida_em IS NULL
        ) AS tarefas_concluidas,
        (
          SELECT COUNT(*)
          FROM avaliacoes a
          WHERE a.projeto_id = p.id
        ) AS avaliacoes_total,
        (
          SELECT ROUND(AVG(a.nota), 2)
          FROM avaliacoes a
          WHERE a.projeto_id = p.id
        ) AS avaliacao_media
      FROM membros_equipe me
      INNER JOIN projetos p ON p.id = me.projeto_id
      LEFT JOIN funcoes f ON f.id = me.funcao_id
      WHERE me.usuario_id = ? AND me.status = 'ativo'
      ORDER BY me.entrou_em DESC
    `, [usuarioId]);

    return res.json({ sucesso: true, dados: rows });
  } catch (error) {
    console.error('Erro ao listar projetos do usuário:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível carregar seus projetos.' });
  }
});

app.get('/api/projetos/:id/tarefas', async (req, res) => {
  const projetoId = Number(req.params.id);
  const usuarioId = Number(req.query.usuario_id);
  if (![projetoId, usuarioId].every((value) => Number.isInteger(value) && value > 0)) {
    return res.status(400).json({ sucesso: false, message: 'Projeto ou usuário inválido.' });
  }

  try {
    const [members] = await db.query(
      `SELECT membros.id, projetos.criador_id
       FROM membros_equipe membros
       INNER JOIN projetos ON projetos.id = membros.projeto_id
       WHERE membros.projeto_id = ? AND membros.usuario_id = ? AND membros.status = 'ativo'
       LIMIT 1`,
      [projetoId, usuarioId],
    );
    if (!members[0]) {
      return res.status(403).json({ sucesso: false, message: 'Somente membros ativos podem consultar as tarefas.' });
    }

    const [rows] = await db.query(`
      SELECT t.id, t.projeto_id, t.titulo, t.descricao, t.status, t.prioridade,
             t.data_vencimento, t.responsavel_id, t.dificuldade, t.criado_em,
             u.nome AS responsavel_nome
      FROM tarefas t
      LEFT JOIN usuarios u ON u.id = t.responsavel_id
      WHERE t.projeto_id = ? AND t.excluida_em IS NULL
      ORDER BY FIELD(t.status, 'todo', 'doing', 'review', 'done'), t.criado_em DESC
    `, [projetoId]);
    const [membersInProject] = await db.query(`
      SELECT me.usuario_id, u.nome
      FROM membros_equipe me
      INNER JOIN usuarios u ON u.id = me.usuario_id
      WHERE me.projeto_id = ? AND me.status = 'ativo'
      ORDER BY u.nome ASC
    `, [projetoId]);
    return res.json({
      sucesso: true,
      dados: rows,
      membros: membersInProject,
      usuario_e_lider: Number(members[0].criador_id) === usuarioId,
    });
  } catch (error) {
    console.error('Erro ao listar tarefas do projeto:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível carregar as tarefas.' });
  }
});

async function buscarPermissaoTarefa(tarefaId, usuarioId) {
  const [rows] = await db.query(`
    SELECT t.id, t.projeto_id, t.responsavel_id, t.status, p.criador_id,
           membro.status AS membro_status
    FROM tarefas t
    INNER JOIN projetos p ON p.id = t.projeto_id
    LEFT JOIN membros_equipe membro
      ON membro.projeto_id = t.projeto_id AND membro.usuario_id = ? AND membro.status = 'ativo'
    WHERE t.id = ? AND t.excluida_em IS NULL
    LIMIT 1
  `, [usuarioId, tarefaId]);
  return rows[0];
}

app.patch('/api/tarefas/:id/status', async (req, res) => {
  const tarefaId = Number(req.params.id);
  const usuarioId = Number(req.body?.usuario_id);
  const status = req.body?.status;
  const validStatuses = ['todo', 'doing', 'review', 'done'];
  if (!Number.isInteger(tarefaId) || !Number.isInteger(usuarioId) || !validStatuses.includes(status)) {
    return res.status(400).json({ sucesso: false, message: 'Tarefa, usuário ou status inválido.' });
  }

  try {
    const task = await buscarPermissaoTarefa(tarefaId, usuarioId);
    if (!task) return res.status(404).json({ sucesso: false, message: 'Tarefa não encontrada.' });
    if (task.membro_status !== 'ativo') {
      return res.status(403).json({ sucesso: false, message: 'Somente membros ativos podem mover tarefas.' });
    }
    const podeMover = Number(task.criador_id) === usuarioId || Number(task.responsavel_id) === usuarioId;
    if (!podeMover) {
      return res.status(403).json({ sucesso: false, message: 'Você só pode mover tarefas atribuídas a você.' });
    }
    await db.query('UPDATE tarefas SET status = ? WHERE id = ? AND excluida_em IS NULL', [status, tarefaId]);
    return res.json({ sucesso: true, message: 'Tarefa movida com sucesso.' });
  } catch (error) {
    console.error('Erro ao mover tarefa:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível mover a tarefa.' });
  }
});

app.patch('/api/tarefas/:id/assumir', async (req, res) => {
  const tarefaId = Number(req.params.id);
  const usuarioId = Number(req.body?.usuario_id);
  if (!Number.isInteger(tarefaId) || !Number.isInteger(usuarioId)) {
    return res.status(400).json({ sucesso: false, message: 'Tarefa ou usuário inválido.' });
  }

  try {
    const task = await buscarPermissaoTarefa(tarefaId, usuarioId);
    if (!task) return res.status(404).json({ sucesso: false, message: 'Tarefa não encontrada.' });
    if (task.membro_status !== 'ativo') {
      return res.status(403).json({ sucesso: false, message: 'Somente membros ativos podem assumir tarefas.' });
    }
    if (task.responsavel_id) {
      return res.status(409).json({ sucesso: false, message: 'Esta tarefa já possui responsável.' });
    }
    await db.query('UPDATE tarefas SET responsavel_id = ?, assumida_em = NOW() WHERE id = ? AND responsavel_id IS NULL', [usuarioId, tarefaId]);
    return res.json({ sucesso: true, message: 'Tarefa assumida com sucesso.' });
  } catch (error) {
    console.error('Erro ao assumir tarefa:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível assumir a tarefa.' });
  }
});

app.patch('/api/tarefas/:id/delegar', async (req, res) => {
  const tarefaId = Number(req.params.id);
  const usuarioId = Number(req.body?.usuario_id);
  const novoResponsavelId = Number(req.body?.novo_responsavel_id);
  if (![tarefaId, usuarioId, novoResponsavelId].every(Number.isInteger)) {
    return res.status(400).json({ sucesso: false, message: 'Tarefa ou usuário inválido.' });
  }

  try {
    const task = await buscarPermissaoTarefa(tarefaId, usuarioId);
    if (!task) return res.status(404).json({ sucesso: false, message: 'Tarefa não encontrada.' });
    if (task.membro_status !== 'ativo' || Number(task.responsavel_id) !== usuarioId) {
      return res.status(403).json({ sucesso: false, message: 'Somente o responsável atual pode delegar a tarefa.' });
    }
    const [members] = await db.query(
      `SELECT id FROM membros_equipe
       WHERE projeto_id = ? AND usuario_id = ? AND status = 'ativo'
       LIMIT 1`,
      [task.projeto_id, novoResponsavelId],
    );
    if (!members[0] || novoResponsavelId === usuarioId) {
      return res.status(400).json({ sucesso: false, message: 'Escolha outro membro ativo do projeto.' });
    }
    await db.query('UPDATE tarefas SET responsavel_id = ?, assumida_em = NOW() WHERE id = ?', [novoResponsavelId, tarefaId]);
    return res.json({ sucesso: true, message: 'Tarefa delegada com sucesso.' });
  } catch (error) {
    console.error('Erro ao delegar tarefa:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível delegar a tarefa.' });
  }
});

app.get('/api/projetos/:id/detalhes', async (req, res) => {
  const projetoId = Number(req.params.id);
  if (!Number.isInteger(projetoId) || projetoId <= 0) {
    return res.status(400).json({ sucesso: false, message: 'Projeto inválido.' });
  }

  try {
    const [projetos] = await db.query(`
      SELECT id, criador_id, titulo, descricao, status, limite_membros, criado_em,
             repositorio_url, figma_url, discord_url, documentacao_url,
             visibilidade, permitir_portfolio_publico
      FROM projetos
      WHERE id = ?
      LIMIT 1
    `, [projetoId]);
    const projeto = projetos[0];
    if (!projeto) {
      return res.status(404).json({ sucesso: false, message: 'Projeto não encontrado.' });
    }

    const [membros] = await db.query(`
      SELECT me.id, me.usuario_id, u.nome, u.avatar_url, me.funcao, me.funcao_id,
             f.nome AS funcao_nome, me.vaga_id, me.entrou_em,
             CASE WHEN me.usuario_id = p.criador_id THEN 1 ELSE 0 END AS is_lider,
             (
               SELECT COUNT(*)
               FROM avaliacoes a
               WHERE a.avaliado_id = me.usuario_id AND a.projeto_id = ?
             ) AS avaliacao_total,
             (
               SELECT ROUND(AVG(a.nota), 2)
               FROM avaliacoes a
               WHERE a.avaliado_id = me.usuario_id AND a.projeto_id = ?
             ) AS avaliacao_media
      FROM membros_equipe me
      INNER JOIN usuarios u ON u.id = me.usuario_id
      INNER JOIN projetos p ON p.id = me.projeto_id
      LEFT JOIN funcoes f ON f.id = me.funcao_id
      WHERE me.projeto_id = ? AND me.status = 'ativo'
      ORDER BY me.entrou_em ASC
    `, [projetoId, projetoId, projetoId]);

    const [habilidades] = await db.query(`
      SELECT h.id, h.nome
      FROM habilidades_projeto hp
      INNER JOIN habilidades h ON h.id = hp.habilidade_id
      WHERE hp.projeto_id = ?
      ORDER BY h.nome ASC
    `, [projetoId]);

    const [vagas] = await db.query(`
      SELECT vp.id, vp.projeto_id, vp.funcao_id, f.nome AS funcao_nome,
             vp.quantidade, vp.preenchidas, vp.descricao, vp.nivel_desejado,
             vp.status, vp.criado_em,
             GREATEST(vp.quantidade - vp.preenchidas, 0) AS disponiveis
      FROM vagas_projeto vp
      INNER JOIN funcoes f ON f.id = vp.funcao_id
      WHERE vp.projeto_id = ?
      ORDER BY vp.status ASC, vp.criado_em ASC
    `, [projetoId]);

    const [tarefas] = await db.query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(status = 'todo'), 0) AS pendentes,
        COALESCE(SUM(status = 'doing'), 0) AS em_andamento,
        COALESCE(SUM(status = 'review'), 0) AS revisao,
        COALESCE(SUM(status = 'done'), 0) AS concluidas
      FROM tarefas
      WHERE projeto_id = ? AND excluida_em IS NULL
    `, [projetoId]);

    const [atividades] = await db.query(`
      SELECT ep.id, ep.tipo, ep.titulo, ep.entidade_tipo, ep.entidade_id,
             ep.metadados, ep.criado_em, u.nome AS usuario_nome
      FROM eventos_projeto ep
      LEFT JOIN usuarios u ON u.id = ep.usuario_id
      WHERE ep.projeto_id = ?
      ORDER BY ep.criado_em DESC
      LIMIT 10
    `, [projetoId]);

    const [avaliacao] = await db.query(`
      SELECT COUNT(*) AS total, ROUND(AVG(nota), 2) AS media
      FROM avaliacoes
      WHERE projeto_id = ?
    `, [projetoId]);

    return res.json({
      sucesso: true,
      dados: {
        projeto,
        membros,
        habilidades,
        vagas,
        tarefas: tarefas[0],
        atividades,
        avaliacao: avaliacao[0],
      },
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do projeto:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível carregar os detalhes do projeto.' });
  }
});

app.get('/api/projetos/:id/vagas', async (req, res) => {
  const projetoId = Number(req.params.id);
  if (!Number.isInteger(projetoId) || projetoId <= 0) {
    return res.status(400).json({ sucesso: false, message: 'Projeto inválido.' });
  }

  try {
    const [vagas] = await db.query(`
      SELECT id, projeto_id, funcao_id, quantidade, preenchidas, descricao, nivel_desejado, status, criado_em,
             GREATEST(quantidade - preenchidas, 0) AS disponiveis
      FROM vagas_projeto
      WHERE projeto_id = ? AND status = 'aberta' AND preenchidas < quantidade
      ORDER BY criado_em ASC
    `, [projetoId]);
    return res.json({ sucesso: true, dados: vagas });
  } catch (error) {
    console.error('Erro ao listar vagas do projeto:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível carregar as vagas.' });
  }
});

app.get('/api/projetos/:id/candidatura/:usuarioId', async (req, res) => {
  const projetoId = Number(req.params.id);
  const usuarioId = Number(req.params.usuarioId);
  if (!Number.isInteger(projetoId) || !Number.isInteger(usuarioId) || projetoId <= 0 || usuarioId <= 0) {
    return res.status(400).json({ sucesso: false, message: 'Projeto ou usuário inválido.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, usuario_id, projeto_id, vaga_id, status, mensagem, criado_em
       FROM candidaturas
       WHERE projeto_id = ? AND usuario_id = ?
       ORDER BY criado_em DESC`,
      [projetoId, usuarioId],
    );
    return res.json({ sucesso: true, dados: rows });
  } catch (error) {
    console.error('Erro ao consultar candidatura:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível consultar a candidatura.' });
  }
});

app.get('/api/projetos/:id/candidaturas', async (req, res) => {
  const projetoId = Number(req.params.id);
  const usuarioId = Number(req.query.usuario_id);
  if (![projetoId, usuarioId].every((value) => Number.isInteger(value) && value > 0)) {
    return res.status(400).json({ sucesso: false, message: 'Projeto ou usuário inválido.' });
  }

  try {
    const [projetos] = await db.query(
      'SELECT id FROM projetos WHERE id = ? AND criador_id = ? LIMIT 1',
      [projetoId, usuarioId],
    );
    if (!projetos[0]) {
      return res.status(403).json({ sucesso: false, message: 'Somente o criador pode gerenciar candidaturas.' });
    }

    const [rows] = await db.query(`
      SELECT c.id, c.usuario_id, c.projeto_id, c.vaga_id, c.status, c.mensagem, c.criado_em,
             u.nome AS usuario_nome, u.email AS usuario_email,
             f.nome AS funcao_nome
      FROM candidaturas c
      INNER JOIN usuarios u ON u.id = c.usuario_id
      LEFT JOIN vagas_projeto v ON v.id = c.vaga_id
      LEFT JOIN funcoes f ON f.id = v.funcao_id
      WHERE c.projeto_id = ? AND c.status = 'pendente'
      ORDER BY c.criado_em ASC
    `, [projetoId]);
    return res.json({ sucesso: true, dados: rows });
  } catch (error) {
    console.error('Erro ao listar candidaturas:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível carregar as candidaturas.' });
  }
});

app.get('/api/candidaturas/:id/perfil', async (req, res) => {
  const candidaturaId = Number(req.params.id);
  const responsavelId = Number(req.query.usuario_id);
  if (![candidaturaId, responsavelId].every((value) => Number.isInteger(value) && value > 0)) {
    return res.status(400).json({ sucesso: false, message: 'Candidatura ou usuário inválido.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT c.id AS candidatura_id, c.usuario_id, c.projeto_id, c.vaga_id,
             c.status AS candidatura_status, c.mensagem, c.criado_em AS candidatura_criada_em,
             p.titulo AS projeto_titulo, u.nome, u.email, u.bio, u.localizacao, u.avatar_url,
             ROUND(AVG(a.nota), 2) AS avaliacao_media, COUNT(a.id) AS avaliacao_total
      FROM candidaturas c
      INNER JOIN projetos p ON p.id = c.projeto_id AND p.criador_id = ?
      INNER JOIN usuarios u ON u.id = c.usuario_id
      LEFT JOIN avaliacoes a ON a.avaliado_id = c.usuario_id
      WHERE c.id = ?
      GROUP BY c.id, c.usuario_id, c.projeto_id, c.vaga_id, c.status, c.mensagem,
               c.criado_em, p.titulo, u.nome, u.email, u.bio, u.localizacao, u.avatar_url
      LIMIT 1
    `, [responsavelId, candidaturaId]);
    const profile = rows[0];
    if (!profile) {
      return res.status(404).json({ sucesso: false, message: 'Candidatura não encontrada.' });
    }

    const [functions] = await db.query(`
      SELECT f.id, f.nome, fu.nivel_interesse
      FROM funcoes_usuario fu
      INNER JOIN funcoes f ON f.id = fu.funcao_id
      WHERE fu.usuario_id = ?
      ORDER BY f.nome ASC
    `, [profile.usuario_id]);
    const [skills] = await db.query(`
      SELECT h.id, h.nome, hu.nivel
      FROM habilidades_usuario hu
      INNER JOIN habilidades h ON h.id = hu.habilidade_id
      WHERE hu.usuario_id = ?
      ORDER BY h.nome ASC
    `, [profile.usuario_id]);

    return res.json({
      sucesso: true,
      dados: { ...profile, funcoes: functions, habilidades: skills },
    });
  } catch (error) {
    console.error('Erro ao buscar perfil da candidatura:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível carregar o perfil do candidato.' });
  }
});

app.patch('/api/candidaturas/:id/aceitar', async (req, res) => {
  const candidaturaId = Number(req.params.id);
  const responsavelId = Number(req.body?.usuario_id);
  if (![candidaturaId, responsavelId].every((value) => Number.isInteger(value) && value > 0)) {
    return res.status(400).json({ sucesso: false, message: 'Candidatura ou usuário inválido.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT c.id, c.usuario_id, c.projeto_id, c.vaga_id, c.status, p.titulo,
             p.criador_id, v.status AS vaga_status, v.preenchidas, v.quantidade
      FROM candidaturas c
      INNER JOIN projetos p ON p.id = c.projeto_id
      INNER JOIN vagas_projeto v ON v.id = c.vaga_id
      WHERE c.id = ?
      LIMIT 1
    `, [candidaturaId]);
    const candidatura = rows[0];
    if (!candidatura) return res.status(404).json({ sucesso: false, message: 'Candidatura não encontrada.' });
    if (Number(candidatura.criador_id) !== responsavelId) {
      return res.status(403).json({ sucesso: false, message: 'Somente o criador pode aceitar candidaturas.' });
    }
    if (candidatura.status !== 'pendente') {
      return res.status(409).json({ sucesso: false, message: 'Esta candidatura já foi processada.' });
    }
    if (candidatura.vaga_status !== 'aberta' || Number(candidatura.preenchidas) >= Number(candidatura.quantidade)) {
      return res.status(409).json({ sucesso: false, message: 'A vaga não está mais disponível.' });
    }

    await db.query('UPDATE candidaturas SET status = ? WHERE id = ?', ['aceito', candidaturaId]);
    const [updatedNotifications] = await db.query(`
      UPDATE notificacoes
      SET tipo = 'system',
          titulo = 'Candidato aceito, aguardando resposta do usuário',
          descricao = ?,
          link = ?,
          lida = 0
      WHERE usuario_id = ? AND tipo = 'application' AND link = ?
    `, [
      `A candidatura para o projeto "${candidatura.titulo}" foi aceita. Aguarde o candidato confirmar a entrada.`,
      `/projetos/${candidatura.projeto_id}`,
      candidatura.criador_id,
      `/candidaturas/${candidaturaId}/projetos/${candidatura.projeto_id}`,
    ]);
    if (updatedNotifications.affectedRows === 0) {
      await db.query(`
        INSERT INTO notificacoes (usuario_id, tipo, titulo, descricao, link, lida)
        VALUES (?, 'system', 'Candidato aceito, aguardando resposta do usuário', ?, ?, 0)
      `, [
        candidatura.criador_id,
        `A candidatura para o projeto "${candidatura.titulo}" foi aceita. Aguarde o candidato confirmar a entrada.`,
        `/projetos/${candidatura.projeto_id}`,
      ]);
    }
    await db.query(`
      INSERT INTO notificacoes (usuario_id, tipo, titulo, descricao, link, lida)
      VALUES (?, 'approved', 'Candidatura aceita', ?, ?, 0)
    `, [
      candidatura.usuario_id,
      `Sua candidatura para o projeto "${candidatura.titulo}" foi aceita.`,
      `/projetos/${candidatura.projeto_id}`,
    ]);
    return res.json({ sucesso: true, message: 'Candidatura aceita. Aguardando confirmação do candidato.' });
  } catch (error) {
    console.error('Erro ao aceitar candidatura:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível aceitar a candidatura.' });
  }
});

app.patch('/api/candidaturas/:id/rejeitar', async (req, res) => {
  const candidaturaId = Number(req.params.id);
  const responsavelId = Number(req.body?.usuario_id);
  if (![candidaturaId, responsavelId].every((value) => Number.isInteger(value) && value > 0)) {
    return res.status(400).json({ sucesso: false, message: 'Candidatura ou usuário inválido.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT c.id, c.usuario_id, c.projeto_id, c.status, p.titulo, p.criador_id
      FROM candidaturas c
      INNER JOIN projetos p ON p.id = c.projeto_id
      WHERE c.id = ?
      LIMIT 1
    `, [candidaturaId]);
    const candidatura = rows[0];
    if (!candidatura) return res.status(404).json({ sucesso: false, message: 'Candidatura não encontrada.' });
    if (Number(candidatura.criador_id) !== responsavelId) {
      return res.status(403).json({ sucesso: false, message: 'Somente o criador pode rejeitar candidaturas.' });
    }
    if (candidatura.status !== 'pendente') {
      return res.status(409).json({ sucesso: false, message: 'Esta candidatura já foi processada.' });
    }

    await db.query('UPDATE candidaturas SET status = ? WHERE id = ?', ['rejeitado', candidaturaId]);
    await db.query(`
      INSERT INTO notificacoes (usuario_id, tipo, titulo, descricao, link, lida)
      VALUES (?, 'system', 'Candidatura não aprovada', ?, ?, 0)
    `, [
      candidatura.usuario_id,
      `Sua candidatura para o projeto "${candidatura.titulo}" não foi aprovada.`,
      `/projetos/${candidatura.projeto_id}`,
    ]);
    return res.json({ sucesso: true, message: 'Candidatura rejeitada.' });
  } catch (error) {
    console.error('Erro ao rejeitar candidatura:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível rejeitar a candidatura.' });
  }
});

app.patch('/api/candidaturas/:id/confirmar-entrada', async (req, res) => {
  const candidaturaId = Number(req.params.id);
  const usuarioId = Number(req.body?.usuario_id);
  if (![candidaturaId, usuarioId].every((value) => Number.isInteger(value) && value > 0)) {
    return res.status(400).json({ sucesso: false, message: 'Candidatura ou usuário inválido.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(`
      SELECT c.id, c.usuario_id, c.projeto_id, c.vaga_id, c.status,
             p.criador_id,
             p.titulo, p.limite_membros, v.funcao_id, v.preenchidas, v.quantidade, v.status AS vaga_status,
             (SELECT COUNT(*) FROM membros_equipe me WHERE me.projeto_id = c.projeto_id AND me.status = 'ativo') AS membros_atuais
      FROM candidaturas c
      INNER JOIN projetos p ON p.id = c.projeto_id
      INNER JOIN vagas_projeto v ON v.id = c.vaga_id
      WHERE c.id = ?
      FOR UPDATE
    `, [candidaturaId]);
    const candidatura = rows[0];
    if (!candidatura || Number(candidatura.usuario_id) !== usuarioId) {
      throw Object.assign(new Error('Candidatura não encontrada.'), { statusCode: 404 });
    }
    if (candidatura.status !== 'aceito') {
      throw Object.assign(new Error('Esta candidatura não está aguardando confirmação.'), { statusCode: 409 });
    }
    if (Number(candidatura.membros_atuais) >= Number(candidatura.limite_membros)
      || candidatura.vaga_status !== 'aberta'
      || Number(candidatura.preenchidas) >= Number(candidatura.quantidade)) {
      throw Object.assign(new Error('Não há mais espaço disponível neste projeto.'), { statusCode: 409 });
    }

    const [existingMember] = await connection.query(
      'SELECT id FROM membros_equipe WHERE usuario_id = ? AND projeto_id = ? AND status = ? LIMIT 1',
      [usuarioId, candidatura.projeto_id, 'ativo'],
    );
    if (existingMember[0]) {
      throw Object.assign(new Error('Você já faz parte deste projeto.'), { statusCode: 409 });
    }

    await connection.query(`
      INSERT INTO membros_equipe (usuario_id, projeto_id, vaga_id, funcao_id, status)
      VALUES (?, ?, ?, ?, 'ativo')
    `, [usuarioId, candidatura.projeto_id, candidatura.vaga_id, candidatura.funcao_id]);
    await connection.query(
      'UPDATE vagas_projeto SET preenchidas = preenchidas + 1 WHERE id = ?',
      [candidatura.vaga_id],
    );
    await connection.query('UPDATE candidaturas SET status = ? WHERE id = ?', ['aceito', candidaturaId]);
    await connection.query(`
      INSERT INTO notificacoes (usuario_id, tipo, titulo, descricao, link, lida)
      VALUES (?, 'system', 'Novo membro no projeto', ?, ?, 0)
    `, [
      candidatura.criador_id,
      `O usuário confirmou a entrada no projeto "${candidatura.titulo}".`,
      `/projetos/${candidatura.projeto_id}`,
    ]);
    await connection.commit();
    return res.json({ sucesso: true, message: 'Você agora faz parte do projeto.' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao confirmar entrada no projeto:', error);
    return res.status(error.statusCode || 500).json({
      sucesso: false,
      message: error.statusCode ? error.message : 'Não foi possível confirmar sua entrada.',
    });
  } finally {
    connection.release();
  }
});

app.patch('/api/candidaturas/:id/recusar-entrada', async (req, res) => {
  const candidaturaId = Number(req.params.id);
  const usuarioId = Number(req.body?.usuario_id);
  if (![candidaturaId, usuarioId].every((value) => Number.isInteger(value) && value > 0)) {
    return res.status(400).json({ sucesso: false, message: 'Candidatura ou usuário inválido.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT c.id, c.usuario_id, c.projeto_id, c.status, p.titulo, p.criador_id
      FROM candidaturas c
      INNER JOIN projetos p ON p.id = c.projeto_id
      WHERE c.id = ? AND c.usuario_id = ?
      LIMIT 1
    `, [candidaturaId, usuarioId]);
    const candidatura = rows[0];
    if (!candidatura) return res.status(404).json({ sucesso: false, message: 'Candidatura não encontrada.' });
    if (candidatura.status !== 'aceito') {
      return res.status(409).json({ sucesso: false, message: 'Esta candidatura não está aguardando confirmação.' });
    }

    await db.query('UPDATE candidaturas SET status = ? WHERE id = ?', ['rejeitado', candidaturaId]);
    await db.query(`
      INSERT INTO notificacoes (usuario_id, tipo, titulo, descricao, link, lida)
      VALUES (?, 'system', 'Entrada recusada', ?, ?, 0)
    `, [
      candidatura.criador_id,
      `O usuário recusou a entrada no projeto "${candidatura.titulo}".`,
      `/projetos/${candidatura.projeto_id}`,
    ]);
    return res.json({ sucesso: true, message: 'Entrada no projeto recusada.' });
  } catch (error) {
    console.error('Erro ao recusar entrada no projeto:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível recusar a entrada.' });
  }
});

app.post('/api/candidaturas', async (req, res) => {
  const usuarioId = Number(req.body?.usuario_id);
  const projetoId = Number(req.body?.projeto_id);
  const vagaId = Number(req.body?.vaga_id);
  const mensagem = typeof req.body?.mensagem === 'string' ? req.body.mensagem.trim() : '';

  if (![usuarioId, projetoId, vagaId].every((value) => Number.isInteger(value) && value > 0)) {
    return res.status(400).json({ sucesso: false, message: 'Usuário, projeto ou vaga inválidos.' });
  }
  if (mensagem.length > 1000) {
    return res.status(400).json({ sucesso: false, message: 'A mensagem deve ter no máximo 1000 caracteres.' });
  }

  try {
    const [projetos] = await db.query(`
      SELECT p.id, p.status, p.limite_membros,
             (SELECT COUNT(*) FROM membros_equipe me
              WHERE me.projeto_id = p.id AND me.status = 'ativo') AS membros_atuais
      FROM projetos p
      WHERE p.id = ?
      LIMIT 1
    `, [projetoId]);
    if (!projetos[0]) return res.status(404).json({ sucesso: false, message: 'Projeto não encontrado.' });
    if (String(projetos[0].status).toLowerCase() !== 'aberto') {
      return res.status(409).json({ sucesso: false, message: 'Este projeto não está aceitando candidaturas.' });
    }
    if (Number(projetos[0].membros_atuais) >= Number(projetos[0].limite_membros)) {
      return res.status(409).json({ sucesso: false, message: 'O limite de membros deste projeto foi atingido.' });
    }

    const [activeMembers] = await db.query(
      `SELECT id FROM membros_equipe
       WHERE usuario_id = ? AND projeto_id = ? AND status = 'ativo'
       LIMIT 1`,
      [usuarioId, projetoId],
    );
    if (activeMembers[0]) {
      return res.status(409).json({ sucesso: false, message: 'Você já faz parte deste projeto.' });
    }

    const [vagas] = await db.query(
      `SELECT id FROM vagas_projeto
       WHERE id = ? AND projeto_id = ? AND status = 'aberta' AND preenchidas < quantidade
       LIMIT 1`,
      [vagaId, projetoId],
    );
    if (!vagas[0]) return res.status(409).json({ sucesso: false, message: 'Esta vaga não está disponível.' });

    const [existentes] = await db.query(
      `SELECT id FROM candidaturas
       WHERE usuario_id = ? AND projeto_id = ? AND vaga_id = ?
       LIMIT 1`,
      [usuarioId, projetoId, vagaId],
    );
    if (existentes.length > 0) {
      return res.status(409).json({ sucesso: false, message: 'Você já se candidatou a esta vaga.' });
    }

    await db.query(
      `INSERT INTO candidaturas (usuario_id, projeto_id, vaga_id, status, mensagem)
       VALUES (?, ?, ?, 'pendente', ?)`,
      [usuarioId, projetoId, vagaId, mensagem],
    );
    const [created] = await db.query(
      `SELECT c.id, p.criador_id, p.titulo
       FROM candidaturas c
       INNER JOIN projetos p ON p.id = c.projeto_id
       WHERE c.usuario_id = ? AND c.projeto_id = ? AND c.vaga_id = ?
       ORDER BY c.id DESC
       LIMIT 1`,
      [usuarioId, projetoId, vagaId],
    );
    if (created[0]) {
      await db.query(`
        INSERT INTO notificacoes (usuario_id, tipo, titulo, descricao, link, lida)
        VALUES (?, 'application', 'Nova solicitação para entrar no projeto', ?, ?, 0)
      `, [
        created[0].criador_id,
        `Um usuário enviou uma candidatura para o projeto "${created[0].titulo}".`,
        `/candidaturas/${created[0].id}/projetos/${projetoId}`,
      ]);
    }
    return res.status(201).json({ sucesso: true, message: 'Candidatura enviada com sucesso.' });
  } catch (error) {
    console.error('Erro ao enviar candidatura:', error);
    return res.status(500).json({ sucesso: false, message: 'Não foi possível enviar a candidatura.' });
  }
});

// Inicializa o servidor na porta configurada.
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
