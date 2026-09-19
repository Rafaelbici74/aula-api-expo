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
      throw new Error(
        data?.message
          || (response.status === 404
            ? 'A API ainda não possui o módulo de notificações. Reinicie o servidor.'
            : `A API retornou HTTP ${response.status}.`),
      );
    }
    if (!data) {
      throw new Error('A API retornou uma resposta inválida para notificações.');
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

export const notificacoesApi = {
  listar: (usuarioId) => request(`/api/usuarios/${usuarioId}/notificacoes`),
  marcarComoLida: (notificacaoId, usuarioId) => request(`/api/notificacoes/${notificacaoId}/lida`, {
    method: 'PATCH',
    body: JSON.stringify({ usuario_id: usuarioId }),
  }),
  marcarTodasComoLidas: (usuarioId) => request(`/api/usuarios/${usuarioId}/notificacoes/ler-todas`, {
    method: 'PATCH',
  }),
};
