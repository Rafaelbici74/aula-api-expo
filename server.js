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
          FROM candidaturas c
          WHERE c.projeto_id = projetos.id
            AND c.status = 'aceito'
        ) AS membros_atuais,
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
    const [projetos] = await db.query('SELECT id, status FROM projetos WHERE id = ? LIMIT 1', [projetoId]);
    if (!projetos[0]) return res.status(404).json({ sucesso: false, message: 'Projeto não encontrado.' });
    if (String(projetos[0].status).toLowerCase() !== 'aberto') {
      return res.status(409).json({ sucesso: false, message: 'Este projeto não está aceitando candidaturas.' });
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
