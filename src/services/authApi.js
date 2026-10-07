import { API_BASE_URL, API_TIMEOUT } from '../config/api';

async function postAuthRequest(path, payload, fallbackMessage) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : null;

    if (!response.ok) {
      throw new Error(data?.message || fallbackMessage);
    }

    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('A API demorou para responder. Verifique se o servidor está ativo.');
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function login(email, senha) {
  return postAuthRequest(
    '/api/login',
    { email, senha },
    'Não foi possível realizar o login.',
  );
}

export function registrarUsuario(nome, email, senha) {
  return postAuthRequest(
    '/api/usuarios',
    { nome, email, senha },
    'Não foi possível realizar o cadastro.',
  );
}
