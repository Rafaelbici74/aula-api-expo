import { View, Text } from 'react-native';

import styles from '../../../stylesGlobal';

// Área destinada às configurações do aplicativo.
// Tela de configurações do aplicativo.
export default function Configuracoes() {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Configurações</Text>
      </View>
    </View>
  );
}
