import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';

import RootStack from './src/routes/rootStack';

// Componente raiz do aplicativo mobile e ponto de montagem da navegação.
export default function App() {
  return (
      <NavigationContainer>
        <RootStack />
        <StatusBar style="auto" />
      </NavigationContainer>
  );
}