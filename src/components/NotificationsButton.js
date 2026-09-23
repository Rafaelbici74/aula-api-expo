import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { notificacoesApi } from '../services/notificacoesApi';
import { projetosApi } from '../services/projetosApi';

export default function NotificationsButton() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileVisible, setProfileVisible] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [processingApplication, setProcessingApplication] = useState(null);

  function getApplicationId(notification) {
    return String(notification.link || '').match(/\/candidaturas\/(\d+)/)?.[1];
  }

  function getProjectId(notification) {
    return String(notification.link || '').match(/\/projetos\/(\d+)/)?.[1];
  }

  async function loadNotifications() {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const response = await notificacoesApi.listar(user.id);
      const nextNotifications = response.dados || [];
      setNotifications(nextNotifications);
      setUnreadCount(Number.isFinite(Number(response.nao_lidas))
        ? Number(response.nao_lidas)
        : nextNotifications.filter((notification) => !Number(notification.lida)).length);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  async function markAsRead(notification) {
    if (Number(notification.lida)) return;
    await notificacoesApi.marcarComoLida(notification.id, user.id);
    setNotifications((current) => current.map((item) => (
      item.id === notification.id ? { ...item, lida: 1 } : item
    )));
    setUnreadCount((current) => Math.max(0, current - 1));
  }

  async function markAllAsRead() {
    await notificacoesApi.marcarTodasComoLidas(user.id);
    setNotifications((current) => current.map((notification) => ({ ...notification, lida: 1 })));
    setUnreadCount(0);
  }

  function openNotification(notification) {
    markAsRead(notification).catch((requestError) => setError(requestError.message));
    const projectId = String(notification.link || '').match(/\/projetos\/(\d+)/)?.[1];
    setVisible(false);
    if (projectId) {
      navigation.navigate('Projeto', { projeto: { id: Number(projectId) } });
    }
  }

  async function analyzeCandidate(notification) {
    const applicationId = getApplicationId(notification);
    if (!applicationId || !user?.id) return;
    setProfileLoading(true);
    setError('');
    try {
      const response = await projetosApi.buscarPerfilCandidatura(applicationId, user.id);
      setCandidateProfile(response.dados);
      setProfileVisible(true);
      await markAsRead(notification);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setProfileLoading(false);
    }
  }

  async function processApplication(notification, action) {
    const applicationId = getApplicationId(notification);
    if (!applicationId || !user?.id || processingApplication === applicationId) return;
    setProcessingApplication(applicationId);
    setError('');
    try {
      const response = action === 'accept'
        ? await projetosApi.aceitarCandidatura(applicationId, user.id)
        : await projetosApi.rejeitarCandidatura(applicationId, user.id);
      await notificacoesApi.marcarComoLida(notification.id, user.id);
      if (action === 'accept') {
        const projectId = String(notification.link || '').match(/\/projetos\/(\d+)/)?.[1];
        setNotifications((current) => current.map((item) => (
          item.id === notification.id
            ? {
              ...item,
              tipo: 'system',
              titulo: 'Candidato aceito, aguardando resposta do usuário',
              descricao: response.message,
              link: projectId ? `/projetos/${projectId}` : item.link,
              lida: 1,
            }
            : item
        )));
      } else {
        setNotifications((current) => current.filter((item) => item.id !== notification.id));
      }
      setUnreadCount((current) => Math.max(0, current - (Number(notification.lida) ? 0 : 1)));
      setError('');
      return response;
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setProcessingApplication(null);
    }
  }

  return (
    <>
      <Pressable
        accessibilityLabel="Abrir notificações"
        onPress={() => {
          setVisible(true);
          loadNotifications();
        }}
        style={{
          alignItems: 'center',
          backgroundColor: unreadCount > 0 ? theme.error : theme.surface,
          borderColor: unreadCount > 0 ? theme.error : theme.border,
          borderRadius: 22,
          borderWidth: 1,
          elevation: 5,
          height: 44,
          justifyContent: 'center',
          position: 'absolute',
          right: 16,
          top: 12,
          width: 44,
          zIndex: 10,
        }}
      >
        <Ionicons
          name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
          size={22}
          color={unreadCount > 0 ? '#fff' : theme.primaryDark}
        />
        {unreadCount > 0 ? (
          <View style={{ backgroundColor: theme.primaryDark, borderRadius: 8, height: 16, minWidth: 16, position: 'absolute', right: -3, top: -4 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'center' }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        ) : null}
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable onPress={() => setVisible(false)} style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', flex: 1, justifyContent: 'flex-start', padding: 16, paddingTop: 72 }}>
          <Pressable onPress={(event) => event.stopPropagation()} style={{ backgroundColor: theme.surface, borderRadius: 14, maxHeight: '75%', padding: 18 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700' }}>Notificações</Text>
              <Pressable onPress={() => setVisible(false)}><Ionicons name="close" size={24} color={theme.mutedText} /></Pressable>
            </View>
            {unreadCount > 0 ? (
              <Pressable onPress={() => markAllAsRead().catch((requestError) => setError(requestError.message))}>
                <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600', marginTop: 10 }}>Marcar todas como lidas</Text>
              </Pressable>
            ) : null}
            {loading ? <ActivityIndicator color={theme.primary} style={{ margin: 24 }} /> : null}
            {error ? <Text style={{ color: theme.error, marginTop: 14 }}>{error}</Text> : null}
            {!loading && !error && notifications.length === 0 ? (
              <Text style={{ color: theme.mutedText, marginTop: 24, textAlign: 'center' }}>Você não possui notificações.</Text>
            ) : null}
            {!loading && !error ? notifications.map((notification) => (
              <View key={String(notification.id)} style={{ borderBottomColor: theme.border, borderBottomWidth: 1, paddingVertical: 12 }}>
                <Pressable onPress={() => markAsRead(notification).catch((requestError) => setError(requestError.message))}>
                  <Text style={{ color: notification.lida ? theme.mutedText : theme.text, fontSize: 15, fontWeight: notification.lida ? '500' : '700' }}>{notification.titulo || 'Notificação'}</Text>
                  <Text style={{ color: theme.mutedText, fontSize: 13, marginTop: 4 }}>{notification.descricao || ''}</Text>
                  <Text style={{ color: theme.placeholder, fontSize: 11, marginTop: 5 }}>{new Date(notification.criado_em).toLocaleDateString('pt-BR')}</Text>
                </Pressable>
                {getApplicationId(notification) ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 8 }}>
                    <Pressable onPress={() => analyzeCandidate(notification)} disabled={profileLoading || !!processingApplication}>
                      <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700' }}>Analisar perfil</Text>
                    </Pressable>
                    <Pressable onPress={() => processApplication(notification, 'reject')} disabled={!!processingApplication}>
                      <Text style={{ color: theme.error, fontSize: 13, fontWeight: '700' }}>Rejeitar</Text>
                    </Pressable>
                    <Pressable onPress={() => processApplication(notification, 'accept')} disabled={!!processingApplication}>
                      <Text style={{ color: theme.primaryDark, fontSize: 13, fontWeight: '700' }}>Aceitar</Text>
                    </Pressable>
                  </View>
                ) : getProjectId(notification) ? (
                  <Pressable onPress={() => openNotification(notification)} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                    <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700' }}>Abrir projeto</Text>
                  </Pressable>
                ) : null}
              </View>
            )) : null}
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={profileVisible} transparent animationType="fade" onRequestClose={() => setProfileVisible(false)}>
        <Pressable onPress={() => setProfileVisible(false)} style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', flex: 1, justifyContent: 'center', padding: 20 }}>
          <Pressable onPress={(event) => event.stopPropagation()} style={{ backgroundColor: theme.surface, borderRadius: 14, maxHeight: '85%', padding: 20 }}>
            <Text style={{ color: theme.text, fontSize: 20, fontWeight: '700' }}>Perfil do candidato</Text>
            {candidateProfile ? (
              <>
                <Text style={{ color: theme.primaryDark, fontSize: 17, fontWeight: '700', marginTop: 16 }}>{candidateProfile.nome}</Text>
                <Text style={{ color: theme.mutedText, marginTop: 4 }}>{candidateProfile.email}</Text>
                <Text style={{ color: theme.text, fontWeight: '700', marginTop: 16 }}>Avaliação</Text>
                <Text style={{ color: theme.mutedText, marginTop: 4 }}>
                  {Number(candidateProfile.avaliacao_total || 0) > 0
                    ? `★ ${candidateProfile.avaliacao_media} (${candidateProfile.avaliacao_total} avaliações)`
                    : 'Ainda não recebeu avaliações.'}
                </Text>
                <Text style={{ color: theme.text, fontWeight: '700', marginTop: 16 }}>Bio</Text>
                <Text style={{ color: theme.mutedText, marginTop: 4 }}>{candidateProfile.bio || 'Nenhuma bio adicionada.'}</Text>
                <Text style={{ color: theme.text, fontWeight: '700', marginTop: 16 }}>Localização</Text>
                <Text style={{ color: theme.mutedText, marginTop: 4 }}>{candidateProfile.localizacao || 'Não informada.'}</Text>
                <Text style={{ color: theme.text, fontWeight: '700', marginTop: 16 }}>Funções e habilidades</Text>
                <Text style={{ color: theme.mutedText, marginTop: 4 }}>
                  {[...(candidateProfile.funcoes || []).map((item) => item.nome), ...(candidateProfile.habilidades || []).map((item) => item.nome)].join(', ') || 'Nenhuma informação cadastrada.'}
                </Text>
                <Text style={{ color: theme.text, fontWeight: '700', marginTop: 16 }}>Mensagem da candidatura</Text>
                <Text style={{ color: theme.mutedText, marginTop: 4 }}>{candidateProfile.mensagem || 'Nenhuma mensagem enviada.'}</Text>
              </>
            ) : null}
            <Pressable onPress={() => setProfileVisible(false)} style={{ alignSelf: 'flex-end', marginTop: 20 }}>
              <Text style={{ color: theme.primary, fontWeight: '700' }}>Fechar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
