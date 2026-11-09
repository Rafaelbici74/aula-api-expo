const nodemailer = require('nodemailer');

const SMTP_TIMEOUT_MS = 10000;
let transporter;

function getSmtpConfiguration() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT);
  const secureValue = process.env.SMTP_SECURE?.trim().toLowerCase();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM?.trim();

  if (
    !host
    || !Number.isInteger(port)
    || port < 1
    || port > 65535
    || (secureValue !== 'true' && secureValue !== 'false')
    || !user
    || !password
    || !from
  ) {
    return null;
  }

  return {
    host,
    port,
    secure: secureValue === 'true',
    user,
    password,
    from,
  };
}

function isEmailServiceConfigured() {
  return getSmtpConfiguration() !== null;
}

function getTransporter(configuration) {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: configuration.host,
      port: configuration.port,
      secure: configuration.secure,
      auth: {
        user: configuration.user,
        pass: configuration.password,
      },
      connectionTimeout: SMTP_TIMEOUT_MS,
      greetingTimeout: SMTP_TIMEOUT_MS,
      socketTimeout: SMTP_TIMEOUT_MS,
    });
  }

  return transporter;
}

async function enviarCodigoRecuperacao(email, nome, codigo) {
  const configuration = getSmtpConfiguration();
  if (!configuration) {
    throw new Error('SMTP email service is not configured.');
  }

  await getTransporter(configuration).sendMail({
    from: configuration.from,
    to: email,
    subject: 'Código para redefinir sua senha',
    text: `Olá${nome ? `, ${nome}` : ''}.\n\nSeu código de recuperação é: ${codigo}\nEle expira em 15 minutos e pode ser usado uma única vez.\n\nSe você não solicitou esta alteração, ignore esta mensagem.`,
  });
}

module.exports = { enviarCodigoRecuperacao, isEmailServiceConfigured };
