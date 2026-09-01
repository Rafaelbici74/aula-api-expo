import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '../telas/auth/login';
import CadUsuario from '../telas/auth/cadastro';
import RecSenha from '../telas/auth/recuperarSenha';
import Projeto from '../telas/app/projeto';
import MyTabs from './myTabs';

// Cria a navegação em pilha principal do app.
const Stack = createNativeStackNavigator();

// Define as telas e a ordem inicial de navegação.
export default function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="login"
      screenOptions={
        {
          headerStyle: {
            backgroundColor: '#7f8fe8'
          },
        }
      }
    >
      <Stack.Screen
        name="login"
        component={Login}
        options={{
          title: 'Login',
          headerStyle: {
            backgroundColor: '#7f8fe8',
          },
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
            backgroundColor: '#7f8fe8',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="projeto"
        component={Projeto}
        options={{
          title: 'Detalhes do projeto',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}