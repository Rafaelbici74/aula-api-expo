import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated } from 'react-native';

const APPEARANCE_KEY = 'app_appearance';

export const themes = {
  light: {
    mode: 'light',
    primary: '#7f8fe8',
    header: '#7f8fe8',
    headerText: '#ffffff',
    primaryDark: '#172554',
    background: '#f5f7fb',
    surface: '#ffffff',
    inputBackground: '#f9fafb',
    border: '#dbe3f0',
    text: '#111827',
    mutedText: '#6b7280',
    placeholder: '#94a3b8',
    error: '#b42318',
  },
  dark: {
    mode: 'dark',
    primary: '#8b9af5',
    header: '#26344f',
    headerText: '#f9fafb',
    primaryDark: '#dbe4ff',
    background: '#111827',
    surface: '#1f2937',
    inputBackground: '#273449',
    border: '#374151',
    text: '#f9fafb',
    mutedText: '#cbd5e1',
    placeholder: '#94a3b8',
    error: '#ff8f8f',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('light');
  const [isReady, setIsReady] = useState(false);
  const transitionOpacity = useRef(new Animated.Value(0)).current;
  const [transitionColor, setTransitionColor] = useState(themes.light.background);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(APPEARANCE_KEY)
      .then((storedMode) => {
        if (active && (storedMode === 'light' || storedMode === 'dark')) {
          setModeState(storedMode);
        }
      })
      .catch((error) => {
        console.error('Não foi possível carregar a aparência salva:', error);
      })
      .finally(() => {
        if (active) {
          setIsReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function setMode(nextMode) {
    if (nextMode !== 'light' && nextMode !== 'dark' || nextMode === mode) {
      return;
    }

    setTransitionColor(themes[nextMode].background);
    setModeState(nextMode);
    transitionOpacity.setValue(0);

    try {
      await AsyncStorage.setItem(APPEARANCE_KEY, nextMode);
    } catch (error) {
      console.error('Não foi possível salvar a aparência:', error);
    }

    Animated.timing(transitionOpacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(transitionOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }).start();
    });
  }

  const value = useMemo(() => ({
    mode,
    theme: themes[mode],
    isReady,
    setMode,
  }), [isReady, mode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: transitionColor,
          opacity: transitionOpacity,
        }}
      />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider.');
  }

  return context;
}
