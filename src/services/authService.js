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
    'SELECT email, senha FROM usuarios WHERE email = ? LIMIT 1',
    [email],
  );

  const usuario = rows[0];
  if (!usuario || !(await senhaValida(senha, usuario.senha))) {
    return null;
  }

  return { email: usuario.email };
}

module.exports = { autenticar };
