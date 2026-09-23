import { API_BASE_URL, API_TIMEOUT } from '../config/api';

// Centraliza transporte, timeout e tratamento de respostas da API.
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

// Métodos públicos usados pelas telas para consultar e interagir com projetos.
export const projetosApi = {
  // Busca todos os projetos cadastrados.
  listar: () => request('/api/projetos'),
  listarDoUsuario: (usuarioId) => request(`/api/usuarios/${usuarioId}/projetos`),
  listarTarefas: (projetoId, usuarioId) => request(`/api/projetos/${projetoId}/tarefas?usuario_id=${usuarioId}`),
  moverTarefa: (tarefaId, usuarioId, status) => request(`/api/tarefas/${tarefaId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ usuario_id: usuarioId, status }),
  }),
  assumirTarefa: (tarefaId, usuarioId) => request(`/api/tarefas/${tarefaId}/assumir`, {
    method: 'PATCH',
    body: JSON.stringify({ usuario_id: usuarioId }),
  }),
  delegarTarefa: (tarefaId, usuarioId, novoResponsavelId) => request(`/api/tarefas/${tarefaId}/delegar`, {
    method: 'PATCH',
    body: JSON.stringify({ usuario_id: usuarioId, novo_responsavel_id: novoResponsavelId }),
  }),
  buscarDetalhes: (projetoId) => request(`/api/projetos/${projetoId}/detalhes`),
  listarVagas: (projetoId) => request(`/api/projetos/${projetoId}/vagas`),
  consultarCandidatura: (projetoId, usuarioId) => request(`/api/projetos/${projetoId}/candidatura/${usuarioId}`),
  listarCandidaturas: (projetoId, usuarioId) => request(`/api/projetos/${projetoId}/candidaturas?usuario_id=${usuarioId}`),
  buscarPerfilCandidatura: (candidaturaId, usuarioId) => request(`/api/candidaturas/${candidaturaId}/perfil?usuario_id=${usuarioId}`),
  aceitarCandidatura: (candidaturaId, usuarioId) => request(`/api/candidaturas/${candidaturaId}/aceitar`, {
    method: 'PATCH',
    body: JSON.stringify({ usuario_id: usuarioId }),
  }),
  rejeitarCandidatura: (candidaturaId, usuarioId) => request(`/api/candidaturas/${candidaturaId}/rejeitar`, {
    method: 'PATCH',
    body: JSON.stringify({ usuario_id: usuarioId }),
  }),
  confirmarEntrada: (candidaturaId, usuarioId) => request(`/api/candidaturas/${candidaturaId}/confirmar-entrada`, {
    method: 'PATCH',
    body: JSON.stringify({ usuario_id: usuarioId }),
  }),
  recusarEntrada: (candidaturaId, usuarioId) => request(`/api/candidaturas/${candidaturaId}/recusar-entrada`, {
    method: 'PATCH',
    body: JSON.stringify({ usuario_id: usuarioId }),
  }),
  enviarCandidatura: (candidatura) => request('/api/candidaturas', {
    method: 'POST',
    body: JSON.stringify(candidatura),
  }),
};