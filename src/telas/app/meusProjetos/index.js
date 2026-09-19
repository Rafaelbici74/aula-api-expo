import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import AppHeader from '../../../components/AppHeader';
import { useAuth } from '../../../context/AuthContext';
import { projetosApi } from '../../../services/projetosApi';
import { useTheme } from '../../../theme/ThemeContext';
import styles from './styles';

const statusLabels = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  finalizado: 'Finalizado',
};

export default function MeusProjetos() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProjects = useCallback(async () => {
    if (!user?.id) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await projetosApi.listarDoUsuario(user.id);
      setProjects(response.dados || []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => {
    loadProjects();
  }, [loadProjects]));

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader title="Meus Projetos" />

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.stateText, { color: theme.mutedText }]}>Carregando seus projetos...</Text>
          </View>
        ) : error ? (
          <View style={[styles.stateCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.stateTitle, { color: theme.primaryDark }]}>Não foi possível carregar</Text>
            <Text style={[styles.stateText, { color: theme.mutedText }]}>{error}</Text>
          </View>
        ) : projects.length === 0 ? (
          <View style={[styles.stateCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.stateTitle, { color: theme.primaryDark }]}>Nenhum projeto</Text>
            <Text style={[styles.stateText, { color: theme.mutedText }]}>
              Você ainda não participa de nenhum projeto.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {projects.map((project) => {
              const totalTasks = Number(project.tarefas_total || 0);
              const completedTasks = Number(project.tarefas_concluidas || 0);
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              const members = `${String(project.membros_atuais || 0).padStart(2, '0')}/${String(project.limite_membros || 0).padStart(2, '0')}`;
              const status = String(project.status || '').toLowerCase();
              return (
                <Pressable
                  key={String(project.id)}
                  style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => navigation.navigate('home', {
                    screen: 'Projeto',
                    params: { projeto: project },
                  })}
                >
                  <Text style={[styles.title, { color: theme.primaryDark }]} numberOfLines={2}>
                    {project.titulo || 'Projeto sem nome'}
                  </Text>
                  <View style={[styles.status, { backgroundColor: status === 'finalizado' ? '#6366f1' : status === 'em_andamento' ? '#f59e0b' : '#22c55e' }]}>
                    <Text style={styles.statusText}>{statusLabels[status] || 'Status desconhecido'}</Text>
                  </View>
                  <Text style={[styles.description, { color: theme.mutedText }]} numberOfLines={3}>
                    {project.descricao || 'Sem descrição disponível.'}
                  </Text>
                  <Text style={[styles.detail, { color: theme.text }]}>Membros: {members}</Text>
                  <Text style={[styles.detail, { color: theme.mutedText }]}>
                    {project.funcao_nome || project.funcao || 'Membro da equipe'}
                  </Text>
                  <Text style={[styles.detail, { color: theme.mutedText }]}>
                    Tarefas: {completedTasks}/{totalTasks} ({progress}%)
                  </Text>
                  <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
                    <View style={[styles.progressBar, { backgroundColor: theme.primary, width: `${progress}%` }]} />
                  </View>
                  <View style={styles.actions}>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        navigation.navigate('home', {
                          screen: 'Projeto',
                          params: { projeto: project },
                        });
                      }}
                      style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    >
                      <Text style={styles.actionButtonText}>Abrir projeto</Text>
                    </Pressable>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        navigation.navigate('Tarefas', {
                          projetoId: project.id,
                          tituloProjeto: project.titulo,
                        });
                      }}
                      style={[styles.actionButton, { backgroundColor: theme.inputBackground, borderColor: theme.primary }]}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.primary }]}>Ver tarefas</Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
