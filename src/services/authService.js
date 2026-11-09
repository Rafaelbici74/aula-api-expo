const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const db = require('../dataBase/connection');

const RECOVERY_CODE_LIFETIME_MINUTES = 15;
const RECOVERY_CODE_DIGITS = 8;

function isRecoveryConfigured() {
  return Buffer.byteLength((process.env.RESET_CODE_SECRET || '').trim(), 'utf8') >= 32;
}

function hashRecoveryCode(userId, code) {
  const secret = (process.env.RESET_CODE_SECRET || '').trim();
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('Recovery code secret is not configured.');
  }

  return crypto
    .createHmac('sha256', secret)
    .update(`${userId}:${code}`)
    .digest('hex');
}

function recoveryCodeMatches(userId, code, storedHash) {
  const expectedHash = hashRecoveryCode(userId, code);
  const storedBuffer = Buffer.from(storedHash || '', 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  return storedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(storedBuffer, expectedBuffer);
}

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

async function criarCodigoRecuperacao(email) {
  const [rows] = await db.query(
    'SELECT id, nome, email FROM usuarios WHERE email = ? LIMIT 1',
    [email],
  );
  const usuario = rows[0];
  if (!usuario) return null;

  const codigo = crypto
    .randomInt(0, 10 ** RECOVERY_CODE_DIGITS)
    .toString()
    .padStart(RECOVERY_CODE_DIGITS, '0');
  const tokenHash = hashRecoveryCode(usuario.id, codigo);

  await db.query(
    `UPDATE usuarios
     SET reset_codigo = NULL,
         reset_token = ?,
         reset_expira_em = DATE_ADD(UTC_TIMESTAMP(), INTERVAL ${RECOVERY_CODE_LIFETIME_MINUTES} MINUTE),
         reset_utilizado = 0
     WHERE id = ?`,
    [tokenHash, usuario.id],
  );

  return {
    usuarioId: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    codigo,
    tokenHash,
  };
}

async function invalidarCodigoRecuperacao(usuarioId, tokenHash) {
  await db.query(
    `UPDATE usuarios
     SET reset_codigo = NULL,
         reset_token = NULL,
         reset_expira_em = NULL,
         reset_utilizado = 1
     WHERE id = ? AND reset_token = ?`,
    [usuarioId, tokenHash],
  );
}

async function redefinirSenha(email, codigo, novaSenha) {
  const [rows] = await db.query(
    `SELECT id, reset_token
     FROM usuarios
     WHERE email = ?
       AND reset_token IS NOT NULL
       AND reset_utilizado = 0
       AND reset_expira_em > UTC_TIMESTAMP()
     LIMIT 1`,
    [email],
  );
  const usuario = rows[0];
  if (!usuario || !recoveryCodeMatches(usuario.id, codigo, usuario.reset_token)) {
    return false;
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);
  const [result] = await db.query(
    `UPDATE usuarios
     SET senha = ?,
         senha_definida = 1,
         reset_codigo = NULL,
         reset_token = NULL,
         reset_expira_em = NULL,
         reset_utilizado = 1
     WHERE id = ?
       AND reset_token = ?
       AND reset_utilizado = 0
       AND reset_expira_em > UTC_TIMESTAMP()`,
    [senhaHash, usuario.id, usuario.reset_token],
  );

  return result.affectedRows === 1;
}

module.exports = {
  autenticar,
  cadastrarUsuario,
  criarCodigoRecuperacao,
  invalidarCodigoRecuperacao,
  isRecoveryConfigured,
  redefinirSenha,
};
