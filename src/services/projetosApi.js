import { API_BASE_URL, API_TIMEOUT } from '../config/api';

// Função genérica para centralizar todas as chamadas HTTP da aplicação.
// Ela trata headers, timeout e resposta JSON/erro de forma padronizada.
async function request(endpoint, options = {}) {
  // Controla a requisição para poder cancelar em caso de timeout.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Chamando API:', url);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
      signal: controller.signal,
    });

    // Verifica se a resposta vem em JSON para converter automaticamente.
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    // Se a API responder com erro HTTP, lança uma mensagem amigável.
    if (!response.ok) {
      const message = isJson && data && data.message ? data.message : 'Erro ao consultar a API';
      throw new Error(message);
    }

    return data;
  } catch (error) {
    // Se a requisição for abortada por timeout, mostra uma mensagem clara para depuração.
    if (error && error.name === 'AbortError') {
      throw new Error(`A API não respondeu em ${API_TIMEOUT / 1000}s. Verifique se o backend está rodando em ${API_BASE_URL}.`);
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// Objeto que expõe os métodos de comunicação com os endpoints de projetos.
export const projetosApi = {
  // Busca todos os projetos cadastrados.
  listar: () => request('/api/projetos'),

  // Busca um projeto específico pelo id.
  buscarPorId: (id) => request(`/api/projetos/${id}`),

  // pedir para entrar em um projeto específico pelo id.
    entrar: (id) => request(`/api/projetos/${id}/entrar`, { method: 'POST' })
};
