import { API_BASE_URL, API_TIMEOUT } from '../config/api';

async function request(endpoint, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      signal: controller.signal,
    });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : null;

    if (!response.ok) {
      throw new Error(data?.message || `A API retornou HTTP ${response.status}.`);
    }

    if (!data) {
      throw new Error('A API retornou uma resposta inválida. Reinicie o servidor da API.');
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('A API demorou para responder.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const profileApi = {
  buscar: (id) => request(`/api/usuarios/${id}/perfil`),
  atualizarBio: (id, bio) => request(`/api/usuarios/${id}/bio`, {
    method: 'PUT',
    body: JSON.stringify({ bio }),
  }),
  atualizarLocalizacao: (id, localizacao) => request(`/api/usuarios/${id}/localizacao`, {
    method: 'PUT',
    body: JSON.stringify({ localizacao }),
  }),
};
