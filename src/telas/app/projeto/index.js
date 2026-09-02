import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

import styles from './styles';

// Exibe os dados recebidos da home para consulta detalhada de um projeto.
// Tela de detalhes do projeto.
export default function Projeto() {
  const route = useRoute();
  const navigation = useNavigation();
  const projeto = route.params?.projeto || {};

  const statusLabel = {
    aberto: 'Aberto',
    em_andamento: 'Em andamento',
    finalizado: 'Finalizado',
  };

  const statusTexto =
    statusLabel[String(projeto.status || 'aberto').toLowerCase()] || 'Status desconhecido';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>

        {/* Cartão com título, status, descrição e data de criação. */}
        <View style={styles.card}>
          <Text style={styles.title}>{projeto.titulo || 'Projeto sem nome'}</Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{statusTexto}</Text>
          </View>

          <Text style={styles.description}>
            {projeto.descricao || 'Sem descrição disponível.'}
          </Text>

          {/* A data só aparece quando foi enviada pela API. */}
          {projeto.criado_em ? (
            <Text style={styles.dateText}>
              Criado em: {new Date(projeto.criado_em).toLocaleDateString('pt-BR')}
            </Text>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
