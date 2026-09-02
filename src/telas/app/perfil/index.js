import { View, Text } from 'react-native';

import styles from '../../../stylesGlobal';

// Área de perfil do usuário autenticado.
// Tela de perfil do usuário.
export default function Perfil() {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Perfil</Text>
      </View>
    </View>
  );
}
