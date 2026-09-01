import { Platform } from 'react-native';

// Define a URL base da API conforme o ambiente em que o app está rodando.
// No emulador Android, o host do backend fica em 10.0.2.2, que aponta para o localhost do computador.
const fallbackUrl = Platform.OS === 'android'
  ? 'http://10.0.2.2:3333'
  : 'http://localhost:3333';

// Permite sobrescrever a URL por variável de ambiente do Expo.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || fallbackUrl;

// Tempo máximo para a requisição expirar antes de considerar erro de timeout.
export const API_TIMEOUT = 15000;
