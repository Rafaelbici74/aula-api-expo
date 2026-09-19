const db = require('../dataBase/connection');

async function buscarPerfil(id) {
  const [rows] = await db.query(
    'SELECT id, nome AS nome, email, bio, localizacao FROM usuarios WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] || null;
}

async function atualizarBio(id, bio) {
  await db.query('UPDATE usuarios SET bio = ? WHERE id = ?', [bio, id]);
  return buscarPerfil(id);
}

async function atualizarLocalizacao(id, localizacao) {
  await db.query('UPDATE usuarios SET localizacao = ? WHERE id = ?', [localizacao, id]);
  return buscarPerfil(id);
}

module.exports = { buscarPerfil, atualizarBio, atualizarLocalizacao };
