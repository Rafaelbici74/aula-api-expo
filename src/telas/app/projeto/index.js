import { Alert, Linking, Modal, ScrollView, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';

import styles from './styles';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { projetosApi } from '../../../services/projetosApi';
import NotificationsButton from '../../../components/NotificationsButton';

// Exibe os dados recebidos da home para consulta detalhada de um projeto.
// Tela de detalhes do projeto.
export default function Projeto() {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [details, setDetails] = useState(null);
  const [vacancies, setVacancies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [message, setMessage] = useState('');
  const [pendingCandidates, setPendingCandidates] = useState([]);
  const [processingCandidate, setProcessingCandidate] = useState(null);
  const [confirmingEntry, setConfirmingEntry] = useState(false);
  const projeto = route.params?.projeto || {};
  const projectData = { ...projeto, ...(details?.projeto || {}) };

  const statusLabel = {
    aberto: 'Aberto',
    em_andamento: 'Em andamento',
    finalizado: 'Finalizado',
  };

  const statusTexto =
    statusLabel[String(projectData.status || 'aberto').toLowerCase()] || 'Status desconhecido';
  const projetoAberto = String(projectData.status || '').toLowerCase() === 'aberto';
  const aceitaCandidaturas = projectData.aceita_candidaturas === 1
    || projectData.aceita_candidaturas === true
    || (projectData.aceita_candidaturas === undefined && projetoAberto);
  const membrosAtuais = Math.max(0, Number(projectData.membros_atuais || details?.membros?.length || 0));
  const limiteMembros = Math.max(0, Number(projectData.limite_membros || 0));
  const membrosFormatados = `${String(membrosAtuais).padStart(2, '0')}/${String(limiteMembros).padStart(2, '0')}`;
  const pendingApplication = applications.find((application) => application.status === 'pendente');
  const acceptedApplication = applications.find((application) => application.status === 'aceito');
  const isProjectCreator = Number(projectData.criador_id) === Number(user?.id);
  const isMember = Boolean(details?.membros?.some((member) => (
    Number(member.usuario_id) === Number(user?.id)
  )));
  const hasAvailableVacancy = vacancies.length > 0;
  const candidaturaDisponivel = aceitaCandidaturas && hasAvailableVacancy;

  useEffect(() => {
    let active = true;
    async function loadApplicationData() {
      if (!projeto.id) {
        setLoadingApplications(false);
        return;
      }
      try {
        const detailsResponse = await projetosApi.buscarDetalhes(projeto.id);
        const applicationsResponse = user?.id
          ? await projetosApi.consultarCandidatura(projeto.id, user.id)
          : { dados: [] };
        const projectDetails = detailsResponse?.dados;
        const candidatesResponse = user?.id && Number(projectDetails?.projeto?.criador_id) === Number(user.id)
          ? await projetosApi.listarCandidaturas(projeto.id, user.id)
          : { dados: [] };
        if (active) {
          setDetails(projectDetails || null);
          setVacancies((projectDetails?.vagas || []).filter((vacancy) => (
            vacancy.status === 'aberta' && Number(vacancy.disponiveis) > 0
          )));
          setApplications(applicationsResponse?.dados || []);
          setPendingCandidates(candidatesResponse?.dados || []);
        }
      } catch (error) {
        if (active) Alert.alert('Não foi possível carregar as vagas', error.message);
      } finally {
        if (active) setLoadingDetails(false);
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
        projeto_id: projectData.id,
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

  async function processCandidate(candidate, action) {
    if (processingCandidate) return;
    setProcessingCandidate(candidate.id);
    try {
      const response = action === 'accept'
        ? await projetosApi.aceitarCandidatura(candidate.id, user.id)
        : await projetosApi.rejeitarCandidatura(candidate.id, user.id);
      setPendingCandidates((current) => current.filter((item) => item.id !== candidate.id));
      Alert.alert(action === 'accept' ? 'Candidatura aceita' : 'Candidatura rejeitada', response.message);
    } catch (error) {
      Alert.alert('Não foi possível processar a candidatura', error.message);
    } finally {
      setProcessingCandidate(null);
    }
  }

  async function confirmEntry() {
    if (!acceptedApplication || confirmingEntry) return;
    setConfirmingEntry(true);
    try {
      const response = await projetosApi.confirmarEntrada(acceptedApplication.id, user.id);
      setApplications((current) => current.filter((application) => application.id !== acceptedApplication.id));
      Alert.alert('Entrada confirmada', response.message);
      const detailsResponse = await projetosApi.buscarDetalhes(projectData.id);
      setDetails(detailsResponse?.dados || null);
    } catch (error) {
      Alert.alert('Não foi possível confirmar a entrada', error.message);
    } finally {
      setConfirmingEntry(false);
    }
  }

  async function rejectEntry() {
    if (!acceptedApplication || confirmingEntry) return;
    setConfirmingEntry(true);
    try {
      const response = await projetosApi.recusarEntrada(acceptedApplication.id, user.id);
      setApplications((current) => current.filter((application) => application.id !== acceptedApplication.id));
      Alert.alert('Entrada recusada', response.message);
    } catch (error) {
      Alert.alert('Não foi possível recusar a entrada', error.message);
    } finally {
      setConfirmingEntry(false);
    }
  }

  async function abrirLink(url) {
    if (!/^https?:\/\//i.test(url)) {
      Alert.alert('Link inválido', 'Este link não possui um endereço web válido.');
      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Não foi possível abrir o link', 'Verifique se existe um aplicativo compatível instalado.');
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <NotificationsButton />
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>

        {/* Cartão com título, status, descrição e data de criação. */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.primaryDark }]}>
          <Text style={[styles.title, { color: theme.primaryDark }]}>{projectData.titulo || 'Projeto sem nome'}</Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{statusTexto}</Text>
          </View>

          <Text style={[styles.description, { color: theme.text }]}>
            {projectData.descricao || 'Sem descrição disponível.'}
          </Text>
          <Text style={[styles.membersText, { color: theme.mutedText }]}>
            Membros: {membrosFormatados}
          </Text>

          {/* A data só aparece quando foi enviada pela API. */}
          {projectData.criado_em ? (
            <Text style={[styles.dateText, { color: theme.mutedText }]}>
              Criado em: {new Date(projectData.criado_em).toLocaleDateString('pt-BR')}
            </Text>
          ) : null}
          {loadingDetails ? (
            <ActivityIndicator style={styles.detailsLoading} color={theme.primary} />
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Habilidades</Text>
              {details?.habilidades?.length ? (
                <View style={styles.tagsRow}>
                  {details.habilidades.map((skill) => (
                    <View key={String(skill.id)} style={[styles.tag, { backgroundColor: theme.inputBackground }]}>
                      <Text style={[styles.tagText, { color: theme.primaryDark }]}>{skill.nome}</Text>
                    </View>
                  ))}
                </View>
              ) : <Text style={[styles.emptyText, { color: theme.mutedText }]}>Nenhuma habilidade cadastrada.</Text>}

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Equipe</Text>
              {details?.membros?.length ? details.membros.map((member) => (
                <View key={String(member.id)} style={[styles.listItem, { borderColor: theme.border }]}>
                  <View style={styles.memberHeader}>
                    <Text style={[styles.listTitle, styles.memberName, { color: theme.text }]} numberOfLines={1}>
                      {member.nome}
                    </Text>
                    {Number(member.avaliacao_total || 0) > 0 ? (
                      <Text style={[styles.memberRating, { color: theme.primaryDark }]}>
                        ★ {Number(member.avaliacao_media).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                      </Text>
                    ) : (
                      <Text style={[styles.memberRating, { color: theme.mutedText }]}>Sem avaliação</Text>
                    )}
                  </View>
                  <Text style={[styles.listSubtitle, { color: theme.mutedText }]}>
                    {Number(member.is_lider) === 1 ? 'Líder' : member.funcao_nome || member.funcao || 'Membro da equipe'}
                  </Text>
                </View>
              )) : <Text style={[styles.emptyText, { color: theme.mutedText }]}>Nenhum membro registrado.</Text>}

              {isProjectCreator ? (
                <>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Candidaturas pendentes</Text>
                  {pendingCandidates.length ? pendingCandidates.map((candidate) => (
                    <View key={String(candidate.id)} style={[styles.applicationItem, { borderColor: theme.border }]}>
                      <Text style={[styles.listTitle, { color: theme.text }]}>{candidate.usuario_nome}</Text>
                      <Text style={[styles.listSubtitle, { color: theme.mutedText }]}>
                        {candidate.funcao_nome || 'Vaga do projeto'}
                      </Text>
                      {candidate.mensagem ? (
                        <Text style={[styles.applicationMessage, { color: theme.mutedText }]}>{candidate.mensagem}</Text>
                      ) : null}
                      <View style={styles.applicationActions}>
                        <Pressable
                          onPress={() => processCandidate(candidate, 'reject')}
                          disabled={processingCandidate === candidate.id}
                        >
                          <Text style={[styles.cancelText, { color: theme.error }]}>Rejeitar</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => processCandidate(candidate, 'accept')}
                          disabled={processingCandidate === candidate.id}
                        >
                          <Text style={[styles.saveText, { color: theme.primary }]}>Aceitar</Text>
                        </Pressable>
                      </View>
                    </View>
                  )) : (
                    <Text style={[styles.emptyText, { color: theme.mutedText }]}>Nenhuma candidatura pendente.</Text>
                  )}
                </>
              ) : null}

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Progresso das tarefas</Text>
              <Text style={[styles.progressText, { color: theme.mutedText }]}>
                {details?.tarefas?.concluidas || 0}/{details?.tarefas?.total || 0} concluídas
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: theme.primary,
                      width: `${details?.tarefas?.total ? (Number(details.tarefas.concluidas) / Number(details.tarefas.total)) * 100 : 0}%`,
                    },
                  ]}
                />
              </View>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Links do projeto</Text>
              {[
                ['Repositório', projectData.repositorio_url],
                ['Figma', projectData.figma_url],
                ['Discord', projectData.discord_url],
                ['Documentação', projectData.documentacao_url],
              ].filter(([, url]) => url).map(([label, url]) => (
                <Pressable key={label} style={styles.linkButton} onPress={() => abrirLink(url)}>
                  <Text style={[styles.linkText, { color: theme.primary }]}>{label}</Text>
                  <Text style={[styles.linkUrl, { color: theme.mutedText }]} numberOfLines={1}>{url}</Text>
                </Pressable>
              ))}
              {!projectData.repositorio_url && !projectData.figma_url && !projectData.discord_url && !projectData.documentacao_url
                ? <Text style={[styles.emptyText, { color: theme.mutedText }]}>Nenhum link cadastrado.</Text> : null}

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Avaliações</Text>
              <Text style={[styles.progressText, { color: theme.mutedText }]}>
                {details?.avaliacao?.total || 0} avaliações{details?.avaliacao?.media ? ` · média ${details.avaliacao.media}` : ''}
              </Text>
            </>
          )}
          {!isMember ? (
            <Pressable
              style={[styles.joinButton, { backgroundColor: candidaturaDisponivel && !pendingApplication ? theme.primary : theme.border }]}
              onPress={() => setApplicationModalVisible(true)}
              disabled={!candidaturaDisponivel || !!pendingApplication || !!acceptedApplication || requesting || loadingApplications}
            >
              <Text style={styles.joinButtonText}>
                {loadingApplications ? 'Carregando vagas...' : acceptedApplication ? 'Candidatura aceita' : pendingApplication ? 'Candidatura pendente' : 'Pedir para entrar no projeto'}
              </Text>
            </Pressable>
          ) : null}
          {!isMember && (!aceitaCandidaturas || !hasAvailableVacancy) ? (
            <Text style={[styles.joinHint, { color: theme.mutedText }]}>
              {projeto.motivo_candidatura_indisponivel
                || (!projetoAberto
                  ? 'Projeto não está aberto.'
                  : 'Não há vagas disponíveis para candidatura.')}
            </Text>
          ) : null}
            {acceptedApplication && !isMember ? (
              <View style={[styles.entryPrompt, { backgroundColor: theme.inputBackground, borderColor: theme.primary }]}>
                <Text style={[styles.entryPromptTitle, { color: theme.text }]}>Sua candidatura foi aceita!</Text>
                <Text style={[styles.entryPromptText, { color: theme.mutedText }]}>
                  Deseja confirmar sua entrada neste projeto?
                </Text>
                <View style={styles.entryPromptActions}>
                  <Pressable onPress={rejectEntry} disabled={confirmingEntry}>
                    <Text style={[styles.cancelText, { color: theme.error }]}>Rejeitar</Text>
                  </Pressable>
                  <Pressable onPress={confirmEntry} disabled={confirmingEntry}>
                    {confirmingEntry ? <ActivityIndicator color={theme.primary} /> : (
                      <Text style={[styles.saveText, { color: theme.primary }]}>Aceitar entrada</Text>
                    )}
                  </Pressable>
                </View>
              </View>
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
    </View>
  );
}
