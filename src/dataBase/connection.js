// Importa o driver de conexão com MySQL para Node.js.
const mysql = require('mysql2/promise');

// Carrega as variáveis de ambiente do arquivo .env.
require('dotenv').config();

// Configuração do pool de conexões do banco.
const config = {
  // Usa as variáveis do projeto ou valores padrão se não existirem.
  host: process.env.BD_SERVIDOR || process.env.DB_HOST || 'localhost',
  port: Number(process.env.BD_PORTA || process.env.DB_PORT || 3306),
  user: process.env.BD_USUARIO || process.env.DB_USER || 'root',
  password: process.env.BD_SENHA || process.env.DB_PASSWORD || '',
  database: process.env.BD_BANCO || process.env.DB_NAME || 'aula_api_expo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Cria um pool de conexões para reutilizar conexões do banco.
const connection = mysql.createPool(config);

// Faz uma verificação inicial sem impedir que o servidor seja iniciado.
// Testa a conexão ao iniciar o servidor para identificar falhas cedo.
connection
  .getConnection()
  .then(() => {
    console.log('Conexão MySQL estabelecida com sucesso!');
  })
  .catch((error) => {
    console.error('Erro ao conectar ao MySQL:', error.message);
  });

module.exports = connection;