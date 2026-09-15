import { Image, Text, View } from 'react-native';

import globalStyles from '../../../stylesGlobal';
import AppHeader from '../../../components/AppHeader';
import { useTheme } from '../../../theme/ThemeContext';
import styles from './styles';

// Área de perfil do usuário autenticado.
// Tela de perfil do usuário.
export default function Perfil() {
  const { theme } = useTheme();

  return (
    <View style={[globalStyles.screen, { backgroundColor: theme.background }]}>
      <AppHeader title="Perfil" />

      {/* Card reservado para a foto e os dados principais do usuário. */}
      <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.primaryDark, marginTop: 24 }]}>
        <Image
          source={require('../../../../assets/icon.png')}
          style={styles.photo}
          accessibilityLabel="Foto do usuário"
        />
        <Text style={[styles.name, { color: theme.text }]}></Text>
        <Text style={[styles.email, { color: theme.mutedText }]}></Text>
      </View>
    </View>
  );
}
