import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../telas/app/home';
import PerfilScreen from '../telas/app/perfil';
import ConfiguracoesScreen from '../telas/app/configuracoes';

// Cria a navegação por abas da aplicação.
const Tab = createBottomTabNavigator();

// Configura o menu persistente usado depois que o usuário entra no aplicativo.
// Menu inferior com as telas principais: Home, Perfil e Configurações.
export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // tabBarShowLabel: false, // Oculta o texto de todas as abas
        // tabBarLabelPosition: 'beside-icon' 
        tabBarLabelStyle: {
          fontSize: 16,
          fontFamily: 'Georgia',
          fontWeight: 300,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Define o ícone baseado na rota atual.
          if (route.name === 'home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Configurações') {
            iconName = focused ? 'list' : 'list-outline';
          }

          // Retorna o ícone visual da aba.
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Define as cores da aba selecionada e não selecionada.
        tabBarActiveTintColor: '#7f8fe8',   // Cor quando focado (focused)
        tabBarInactiveTintColor: '#5e6381', // Cor quando desfocado
        headerShown: false,
      })}      
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        // options={{  }} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
      <Tab.Screen name="Configurações" component={ConfiguracoesScreen} />
    </Tab.Navigator>
  );
}