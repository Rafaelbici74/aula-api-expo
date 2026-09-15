import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { projetosApi } from '../../../services/projetosApi';
import { useTheme } from '../../../theme/ThemeContext';
import AppHeader from '../../../components/AppHeader';
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
        />
      </AppHeader>

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
            {projetos.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.emptyTitle, { color: theme.primaryDark }]}>Nenhum projeto encontrado</Text>
                <Text style={[styles.emptyText, { color: theme.mutedText }]}>Ainda não há projetos cadastrados.</Text>
              </View>
            ) : (
              projetos.map((projeto) => {
                const statusKey = String(projeto.status || 'aberto').toLowerCase();
                const statusText = statusLabelMap[statusKey] || statusKey || 'Status desconhecido';
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
                  </Pressable>
                );
              })
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}