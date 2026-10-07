const bcrypt = require('bcryptjs');
const db = require('../dataBase/connection');

function isBcryptHash(value) {
  return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

async function senhaValida(senhaInformada, senhaArmazenada) {
  if (isBcryptHash(senhaArmazenada)) {
    return bcrypt.compare(senhaInformada, senhaArmazenada);
  }

  // Mantém compatibilidade com dados legados enquanto as senhas não forem migradas para bcrypt.
  return senhaInformada === senhaArmazenada;
}

async function autenticar(email, senha) {
  const [rows] = await db.query(
    'SELECT id, nome AS nome, email, senha, bio, localizacao FROM usuarios WHERE email = ? LIMIT 1',
    [email],
  );

  const usuario = rows[0];
  if (!usuario || !(await senhaValida(senha, usuario.senha))) {
    return null;
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    bio: usuario.bio || '',
    localizacao: usuario.localizacao || '',
  };
}

async function cadastrarUsuario(nome, email, senha) {
  const senhaHash = await bcrypt.hash(senha, 10);
  const [result] = await db.query(
    'INSERT INTO usuarios (nome, email, senha, senha_definida) VALUES (?, ?, ?, 1)',
    [nome, email, senhaHash],
  );

  return {
    id: result.insertId,
    nome,
    email,
  };
}

module.exports = { autenticar, cadastrarUsuario };
