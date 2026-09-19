import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, View, Text, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { projetosApi } from '../../../services/projetosApi';
import { useTheme } from '../../../theme/ThemeContext';
import AppHeader from '../../../components/AppHeader';
import NotificationsButton from '../../../components/NotificationsButton';
import styles from './styles';

// Mapeia os status vindos da API para textos amigáveis na interface.
const statusLabelMap = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  finalizado: 'Finalizado',
};

// Tela principal: carrega projetos da API e apresenta seus estados de carregamento.
// Tela principal de projetos exibidos ao usuário.
export default function Home() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [draftFilter, setDraftFilter] = useState('todos');
  const [filterVisible, setFilterVisible] = useState(false);

  const projetosFiltrados = useMemo(() => projetos.filter((projeto) => {
    const status = String(projeto.status || '').toLowerCase();
    const termo = search.trim().toLowerCase();
    const correspondeStatus = filter === 'todos' || status === filter;
    const correspondeBusca = !termo
      || String(projeto.titulo || '').toLowerCase().includes(termo)
      || String(projeto.descricao || '').toLowerCase().includes(termo);
    return correspondeStatus && correspondeBusca;
  }), [filter, projetos, search]);

  useEffect(() => {
    async function carregarProjetos() {
      try {
        setCarregando(true);
        setErro('');

        const resposta = await projetosApi.listar();
        const dados = resposta?.dados || [];

        setProjetos(dados);
      } catch (error) {
        setErro(error.message || 'Não foi possível carregar os projetos.');
      } finally {
        setCarregando(false);
      }
    }

    carregarProjetos();
  }, []);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <NotificationsButton />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
      {/* Cabeçalho com título da tela e campo de pesquisa. */}
      <AppHeader title="Explore novos projetos">
        <TextInput
          style={[styles.headerInput, {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.text,
          }]}
          placeholder="Procure por um projeto"
          placeholderTextColor={theme.placeholder}
          returnKeyType="search"
          value={search}
          onChangeText={setSearch}
        />
      </AppHeader>

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterButton, { backgroundColor: theme.primary }]}
          onPress={() => {
            setDraftFilter(filter);
            setFilterVisible(true);
          }}
        >
          <Text style={styles.filterButtonText}>Filtros{filter !== 'todos' ? `: ${statusLabelMap[filter]}` : ''}</Text>
        </Pressable>
      </View>

      {/* Área que alterna entre carregamento, erro, lista vazia e resultados. */}
      <View style={styles.projetosSection}>
        <Text style={[styles.titulo, { color: theme.primaryDark }]}>Projetos disponíveis:</Text>

        {carregando ? (
          /* Indicador exibido enquanto a API responde. */
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.mutedText }]}>Carregando projetos...</Text>
          </View>
        ) : erro ? (
          /* Mensagem apresentada quando a consulta falha. */
          <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.emptyTitle, { color: theme.primaryDark }]}>Não foi possível carregar</Text>
            <Text style={[styles.emptyText, { color: theme.mutedText }]}>{erro}</Text>
          </View>
        ) : (
          /* Lista de cartões ou mensagem para ausência de projetos. */
          <View style={styles.projetosContainer}>
            {projetosFiltrados.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.emptyTitle, { color: theme.primaryDark }]}>Nenhum projeto encontrado</Text>
                <Text style={[styles.emptyText, { color: theme.mutedText }]}>
                  {projetos.length === 0 ? 'Ainda não há projetos cadastrados.' : 'Nenhum projeto corresponde aos filtros.'}
                </Text>
              </View>
            ) : (
              projetosFiltrados.map((projeto) => {
                const statusKey = String(projeto.status || 'aberto').toLowerCase();
                const statusText = statusLabelMap[statusKey] || statusKey || 'Status desconhecido';
                const membrosAtuais = Math.max(0, Number(projeto.membros_atuais || 0));
                const limiteMembros = Math.max(0, Number(projeto.limite_membros || 0));
                const membrosFormatados = `${String(membrosAtuais).padStart(2, '0')}/${String(limiteMembros).padStart(2, '0')}`;
                const statusStyle =
                  statusKey === 'finalizado'
                    ? styles.projetoStatusFinalizado
                    : statusKey === 'em_andamento'
                      ? styles.projetoStatusEmAndamento
                      : styles.projetoStatusAberto;

                return (
                  <Pressable
                    key={String(projeto.id)}
                    style={[styles.projetoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => navigation.navigate('Projeto', { projeto })}
                  >
                    <Text style={[styles.projetoTitulo, { color: theme.primaryDark }]}>{projeto.titulo || 'Projeto sem nome'}</Text>
                    <View style={[styles.projetoStatusContainer, statusStyle]}>
                      <Text style={styles.projetoStatus}>{statusText}</Text>
                    </View>
                    <Text style={[styles.projetoDescricao, { color: theme.mutedText }]}>{projeto.descricao || 'Sem descrição disponível.'}</Text>
                    <Text style={[styles.projetoMembros, { color: theme.mutedText }]}>
                      Membros: {membrosFormatados}
                    </Text>
                    {!projeto.aceita_candidaturas ? (
                      <Text style={[styles.projetoCandidaturasIndisponiveis, { color: theme.error }]}>
                        {projeto.motivo_candidatura_indisponivel || 'Candidaturas encerradas'}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })
            )}
          </View>
        )}
      </View>
      <Modal visible={filterVisible} transparent animationType="fade" onRequestClose={() => setFilterVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.filterModal, { backgroundColor: theme.surface }]}>
            <Text style={[styles.filterTitle, { color: theme.text }]}>Filtrar projetos</Text>
            {['todos', 'aberto', 'em_andamento', 'finalizado'].map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.filterOption,
                  { borderColor: theme.border },
                  draftFilter === option && { backgroundColor: theme.primary },
                ]}
                onPress={() => setDraftFilter(option)}
              >
                <Text style={[styles.filterOptionText, { color: draftFilter === option ? '#fff' : theme.text }]}>
                  {option === 'todos' ? 'Todos' : statusLabelMap[option]}
                </Text>
              </Pressable>
            ))}
            <View style={styles.filterActions}>
              <Pressable onPress={() => setFilterVisible(false)}>
                <Text style={[styles.filterCancel, { color: theme.mutedText }]}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={() => { setFilter(draftFilter); setFilterVisible(false); }}>
                <Text style={[styles.filterApply, { color: theme.primary }]}>Aplicar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </View>
  );
}