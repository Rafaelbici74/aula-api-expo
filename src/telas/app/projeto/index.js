import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import styles from './styles';
import { useTheme } from '../../../theme/ThemeContext';

// Exibe os dados recebidos da home para consulta detalhada de um projeto.
// Tela de detalhes do projeto.
export default function Projeto() {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const projeto = route.params?.projeto || {};

  const statusLabel = {
    aberto: 'Aberto',
    em_andamento: 'Em andamento',
    finalizado: 'Finalizado',
  };

  const statusTexto =
    statusLabel[String(projeto.status || 'aberto').toLowerCase()] || 'Status desconhecido';

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

          {/* A data só aparece quando foi enviada pela API. */}
          {projeto.criado_em ? (
            <Text style={[styles.dateText, { color: theme.mutedText }]}>
              Criado em: {new Date(projeto.criado_em).toLocaleDateString('pt-BR')}
            </Text>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
