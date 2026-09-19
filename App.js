import { StatusBar } from 'expo-status-bar';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';

import RootStack from './src/routes/rootStack';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

// Componente raiz do aplicativo mobile e ponto de montagem da navegação.
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

function ThemedApp() {
  const { mode, theme, isReady } = useTheme();
  const navigationTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer
      theme={{
        ...navigationTheme,
        dark: mode === 'dark',
        colors: {
          ...navigationTheme.colors,
          primary: theme.primary,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          border: theme.border,
          notification: theme.primary,
        },
      }}
    >
      <RootStack />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}