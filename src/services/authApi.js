import { API_BASE_URL, API_TIMEOUT } from '../config/api';

export async function login(email, senha) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
      signal: controller.signal,
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : null;

    if (!response.ok) {
      throw new Error(data?.message || 'Não foi possível realizar o login.');
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
