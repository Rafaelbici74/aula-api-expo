const IBGE_BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades';

async function request(endpoint) {
  const response = await fetch(`${IBGE_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error('Não foi possível carregar os dados de localização.');
  }

  return response.json();
}

export const ibgeApi = {
  listarEstados: async () => {
    const estados = await request('/estados');
    return estados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  },
  listarCidades: async (estadoId) => {
    const cidades = await request(`/estados/${estadoId}/municipios`);
    return cidades.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  },
};
