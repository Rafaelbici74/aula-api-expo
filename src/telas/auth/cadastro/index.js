import { View, Text } from 'react-native';

import styles from '../../../stylesGlobal';

// Tela de cadastro de usuário.
export default function CadUsuario() {
  return (
    <View style={styles.centeredScreen}>
      <View style={styles.card}>
        <Text style={styles.title}>Faça seu cadastro</Text>
      </View>
    </View>
  );
}
