import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';

import RootStack from './src/routes/rootStack';
import {
  canFollowDeviceOrientation,
  lockScreenOrientation,
} from './src/services/screenOrientation';
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

  useEffect(() => {
    if (!canFollowDeviceOrientation) return;

    lockScreenOrientation(ScreenOrientation.OrientationLock.PORTRAIT)
      .catch((error) => {
        console.error('Não foi possível manter o aplicativo em retrato.', error);
      });
  }, []);

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