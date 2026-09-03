import { Image, Text, View } from 'react-native';

import globalStyles from '../../../stylesGlobal';
import styles from './styles';

// Área de perfil do usuário autenticado.
// Tela de perfil do usuário.
export default function Perfil() {
  return (
    <View style={globalStyles.screen}>
      <View style={globalStyles.content}>
        <Text style={globalStyles.title}>Perfil</Text>
      </View>

      {/* Card reservado para a foto e os dados principais do usuário. */}
      <View style={styles.card}>
        <Image
          source={require('../../../../assets/icon.png')}
          style={styles.photo}
          accessibilityLabel="Foto do usuário"
        />
        <Text style={styles.name}></Text>
        <Text style={styles.email}></Text>
      </View>
    </View>
  );
}
