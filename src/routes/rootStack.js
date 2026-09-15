import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '../telas/auth/login';
import CadUsuario from '../telas/auth/cadastro';
import RecSenha from '../telas/auth/recuperarSenha';
import MyTabs from './myTabs';
import { useTheme } from '../theme/ThemeContext';

// Cria a navegação em pilha principal do app.
const Stack = createNativeStackNavigator();

// Rotas de autenticação ficam na entrada; as demais levam ao conteúdo do app.
// Define as telas e a ordem inicial de navegação.
export default function RootStack() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="login"
      screenOptions={
        {
          headerStyle: {
            backgroundColor: theme.header,
          },
          headerTintColor: theme.text,
        }
      }
    >
      <Stack.Screen
        name="login"
        component={Login}
        options={{
          title: 'Login',
          headerStyle: {
            backgroundColor: theme.header,
          },
          headerTintColor: theme.text,
          textAlign: 'center',
        }}
      />
      <Stack.Screen
        name="myTab"
        component={MyTabs}
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="cadUsuario"
        component={CadUsuario}
        options={{
          title: 'Cadastro de usuário',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="recSenha"
        component={RecSenha}
        options={{
          title: 'My home',
          headerStyle: {
            backgroundColor: theme.header,
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
}