import { View, Text } from 'react-native';

import styles from '../../../stylesGlobal';
import { useTheme } from '../../../theme/ThemeContext';

// Tela reservada ao fluxo de recuperação de acesso do usuário.
// Tela de recuperação de senha.
export default function RecSenha() {
  const { theme } = useTheme();

  return (
    <View style={[styles.centeredScreen, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.primaryDark }]}>Recuperar senha</Text>
      </View>
    </View>
  );
}
