import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../telas/app/home';
import PerfilScreen from '../telas/app/perfil';
import ConfiguracoesScreen from '../telas/app/configuracoes';
import ProjetoScreen from '../telas/app/projeto';
import MeusProjetosScreen from '../telas/app/meusProjetos';
import TarefasScreen from '../telas/app/tarefas';
import { useTheme } from '../theme/ThemeContext';
import AnimatedTabBar from '../components/AnimatedTabBar';

// Cria a navegação por abas da aplicação.
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ProjectsStack = createNativeStackNavigator();

function HomeStackNavigator() {
  const { theme } = useTheme();

  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Projeto"
        component={ProjetoScreen}
        options={{
          title: 'Detalhes do projeto',
          headerStyle: {
            backgroundColor: theme.header,
          },
          headerTintColor: theme.text,
        }}
      />
    </HomeStack.Navigator>
  );
}

function ProjectsStackNavigator() {
  const { theme } = useTheme();

  return (
    <ProjectsStack.Navigator>
      <ProjectsStack.Screen
        name="MeusProjetos"
        component={MeusProjetosScreen}
        options={{ headerShown: false }}
      />
      <ProjectsStack.Screen
        name="Tarefas"
        component={TarefasScreen}
        options={{
          title: 'Tarefas do projeto',
          headerStyle: { backgroundColor: theme.header },
          headerTintColor: theme.text,
        }}
      />
    </ProjectsStack.Navigator>
  );
}

// Configura o menu persistente usado depois que o usuário entra no aplicativo.
// Menu inferior com as telas principais: Home, Perfil e Configurações.
export default function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="home"
        component={HomeStackNavigator}
        // options={{  }} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen name="Meus Projetos" component={ProjectsStackNavigator} options={{ title: 'Meus projetos' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
      <Tab.Screen name="Configurações" component={ConfiguracoesScreen} />
    </Tab.Navigator>
  );
}