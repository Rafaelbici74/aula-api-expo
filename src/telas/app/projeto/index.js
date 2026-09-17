import { Alert, Modal, ScrollView, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';

import styles from './styles';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { projetosApi } from '../../../services/projetosApi';

// Exibe os dados recebidos da home para consulta detalhada de um projeto.
// Tela de detalhes do projeto.
export default function Projeto() {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [vacancies, setVacancies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [message, setMessage] = useState('');
  const projeto = route.params?.projeto || {};

  const statusLabel = {
    aberto: 'Aberto',
    em_andamento: 'Em andamento',
    finalizado: 'Finalizado',
  };

  const statusTexto =
    statusLabel[String(projeto.status || 'aberto').toLowerCase()] || 'Status desconhecido';
  const projetoAberto = String(projeto.status || '').toLowerCase() === 'aberto';
  const membrosAtuais = Math.max(0, Number(projeto.membros_atuais || 0));
  const limiteMembros = Math.max(0, Number(projeto.limite_membros || 0));
  const membrosFormatados = `${String(membrosAtuais).padStart(2, '0')}/${String(limiteMembros).padStart(2, '0')}`;
  const pendingApplication = applications.find((application) => application.status === 'pendente');
  const acceptedApplication = applications.find((application) => application.status === 'aceito');
  const hasAvailableVacancy = vacancies.length > 0;

  useEffect(() => {
    let active = true;
    async function loadApplicationData() {
      if (!projeto.id || !user?.id) {
        setLoadingApplications(false);
        return;
      }
      try {
        const [vacanciesResponse, applicationsResponse] = await Promise.all([
          projetosApi.listarVagas(projeto.id),
          projetosApi.consultarCandidatura(projeto.id, user.id),
        ]);
        if (active) {
          setVacancies(vacanciesResponse?.dados || []);
          setApplications(applicationsResponse?.dados || []);
        }
      } catch (error) {
        if (active) Alert.alert('Não foi possível carregar as vagas', error.message);
      } finally {
        if (active) setLoadingApplications(false);
      }
    }
    loadApplicationData();
    return () => { active = false; };
  }, [projeto.id, user?.id]);

  async function enviarCandidatura() {
    if (!projetoAberto || !user?.id || !selectedVacancy || requesting) return;
    setRequesting(true);
    try {
      const response = await projetosApi.enviarCandidatura({
        usuario_id: user.id,
        projeto_id: projeto.id,
        vaga_id: selectedVacancy.id,
        mensagem: message,
      });
      setApplications((current) => [...current, { status: 'pendente', vaga_id: selectedVacancy.id }]);
      setApplicationModalVisible(false);
      setMessage('');
      setSelectedVacancy(null);
      Alert.alert('Candidatura enviada', response.message);
    } catch (error) {
      Alert.alert('Não foi possível solicitar entrada', error.message);
    } finally {
      setRequesting(false);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>

        {/* Cartão com título, status, descrição e data de criação. */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.primaryDark }]}>
          <Text style={[styles.title, { color: theme.primaryDark }]}>{projeto.titulo || 'Projeto sem nome'}</Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{statusTexto}</Text>
          </View>

          <Text style={[styles.description, { color: theme.text }]}>
            {projeto.descricao || 'Sem descrição disponível.'}
          </Text>
          <Text style={[styles.membersText, { color: theme.mutedText }]}>
            Membros: {membrosFormatados}
          </Text>

          {/* A data só aparece quando foi enviada pela API. */}
          {projeto.criado_em ? (
            <Text style={[styles.dateText, { color: theme.mutedText }]}>
              Criado em: {new Date(projeto.criado_em).toLocaleDateString('pt-BR')}
            </Text>
          ) : null}
          <Pressable
            style={[styles.joinButton, { backgroundColor: projetoAberto && hasAvailableVacancy && !pendingApplication ? theme.primary : theme.border }]}
            onPress={() => setApplicationModalVisible(true)}
            disabled={!projetoAberto || !hasAvailableVacancy || !!pendingApplication || requesting || loadingApplications}
          >
            <Text style={styles.joinButtonText}>
              {loadingApplications ? 'Carregando vagas...' : acceptedApplication ? 'Candidatura aceita' : pendingApplication ? 'Candidatura pendente' : 'Pedir para entrar no projeto'}
            </Text>
          </Pressable>
          {!projetoAberto || !hasAvailableVacancy ? (
            <Text style={[styles.joinHint, { color: theme.mutedText }]}>
              {!projetoAberto
                ? 'Este projeto não está aceitando novas candidaturas.'
                : 'Não há vagas disponíveis para candidatura.'}
            </Text>
          ) : null}
        </View>
      </View>
      <Modal
        visible={applicationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setApplicationModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.applicationModal, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Escolha uma vaga</Text>
            {vacancies.map((vacancy) => (
              <Pressable
                key={String(vacancy.id)}
                style={[
                  styles.vacancyOption,
                  { borderColor: theme.border },
                  selectedVacancy?.id === vacancy.id && { backgroundColor: theme.primary },
                ]}
                onPress={() => setSelectedVacancy(vacancy)}
              >
                <Text style={[styles.vacancyTitle, { color: selectedVacancy?.id === vacancy.id ? '#fff' : theme.text }]}>
                  Função {vacancy.funcao_id} - {vacancy.nivel_desejado}
                </Text>
                <Text style={[styles.vacancyDescription, { color: selectedVacancy?.id === vacancy.id ? '#fff' : theme.mutedText }]}>
                  {vacancy.descricao || 'Sem descrição'} | Disponíveis: {vacancy.disponiveis}/{vacancy.quantidade}
                </Text>
              </Pressable>
            ))}
            <TextInput
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
              placeholder="Mensagem (opcional)"
              placeholderTextColor={theme.placeholder}
              style={[styles.messageInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBackground }]}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setApplicationModalVisible(false)} disabled={requesting}>
                <Text style={[styles.cancelText, { color: theme.mutedText }]}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={enviarCandidatura} disabled={!selectedVacancy || requesting}>
                {requesting ? <ActivityIndicator color={theme.primary} /> : (
                  <Text style={[styles.saveText, { color: theme.primary }]}>Enviar candidatura</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
