import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { notificacoesApi } from '../services/notificacoesApi';

export default function NotificationsButton() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
                {String(notification.link || '').match(/\/projetos\/\d+/) ? (
                  <Pressable onPress={() => openNotification(notification)} style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                    <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700' }}>Abrir projeto</Text>
                  </Pressable>
                ) : null}
              </View>
            )) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
