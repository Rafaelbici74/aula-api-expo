// Carrega as variáveis de ambiente do arquivo .env.
require('dotenv').config();

// Importa os pacotes necessários para o servidor.
const express = require('express');
const cors = require('cors');
const db = require('./src/dataBase/connection');

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

// Inicializa o servidor na porta configurada.
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
