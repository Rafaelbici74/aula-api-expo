import { View, Text, TextInput, Button } from 'react-native';
import {useState} from 'react';

import styles from '../../../stylesGlobal';
import { useTheme } from '../../../theme/ThemeContext';

// Tela reservada ao fluxo de recuperação de acesso do usuário.
// Tela de recuperação de senha.
export default function RecSenha() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');

  const handleRecuperarSenha = () => {
    console.log(email);
  };

  return (
    <View style={[styles.centeredScreen, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.primaryDark }]}>Recuperar senha</Text>
        <Text>
          insira seu e-mail para recuperar sua senha.
        </Text>

         <TextInput
            value={email}
          onChangeText={setEmail}
          placeholder="Digite seu e-mail"
          />

        <Button title="enviar codigo" 
                onPress={handleRecuperarSenha} />

      </View>
    </View>
  );
}
