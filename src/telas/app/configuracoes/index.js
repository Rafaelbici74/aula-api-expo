import { useNavigation } from '@react-navigation/native';
import { Alert, Pressable, Text, View } from 'react-native';

import styles from '../../../stylesGlobal';
import AppHeader from '../../../components/AppHeader';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';

// Área destinada às configurações do aplicativo.
// Tela de configurações do aplicativo.
export default function Configuracoes() {
  const navigation = useNavigation();
  const { mode, setMode, theme } = useTheme();
  const { setUser } = useAuth();

  function handleLogout() {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            setUser(null);
            const rootNavigation = navigation.getParent();

            if (!rootNavigation) {
              throw new Error('Navegador principal não encontrado para realizar o Logout.');
            }

            rootNavigation.reset({
              index: 0,
              routes: [{ name: 'login' }],
            });
          },
        },
      ],
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <AppHeader title="Configurações" />
      <View style={[styles.content, { paddingTop: 24 }]}>

        <View style={[styles.appearanceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.appearanceTitle, { color: theme.text }]}>Aparência</Text>
          <Text style={[styles.appearanceDescription, { color: theme.mutedText }]}>
            Escolha como o aplicativo será exibido.
          </Text>

          <View style={styles.appearanceOptions}>
            {[
              { value: 'light', label: 'Modo Claro' },
              { value: 'dark', label: 'Modo escuro' },
            ].map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.appearanceOption,
                  { borderColor: mode === option.value ? theme.primary : theme.border },
                  mode === option.value && { backgroundColor: `${theme.primary}22` },
                ]}
                onPress={() => setMode(option.value)}
              >
                <View
                  style={[
                    styles.appearanceIndicator,
                    { borderColor: mode === option.value ? theme.primary : theme.mutedText },
                  ]}
                >
                  {mode === option.value ? (
                    <View style={[styles.appearanceIndicatorSelected, { backgroundColor: theme.primary }]} />
                  ) : null}
                </View>
                <Text style={[styles.appearanceOptionText, { color: theme.text }]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Sair</Text>
        </Pressable>
      </View>
    </View>
  );
}
