import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Link, useNavigation } from '@react-navigation/native';

import { login } from '../../../services/authApi';
import { useTheme } from '../../../theme/ThemeContext';
import styles from './styles';

// Tela inicial: permite entrar e direciona para os fluxos auxiliares de autenticação.
// Tela de login do app.
// Centraliza a autenticação inicial e a navegação para cadastro e recuperação de senha.
export default function Login() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.');
      return;
    }

    try {
      setCarregando(true);
      setErro('');
      await login(email, senha);
      navigation.replace('myTab');
    } catch (error) {
      setErro(error.message || 'Não foi possível realizar o login.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Bem-vindo</Text>
        <Text style={[styles.subtitle, { color: theme.mutedText }]}>Acesse sua conta</Text>

        <TextInput
          style={[styles.input, {
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            color: theme.text,
          }]}
          placeholder="E-mail"
          placeholderTextColor={theme.placeholder}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          editable={!carregando}
        />

        <TextInput
          style={[styles.input, {
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            color: theme.text,
          }]}
          placeholder="Senha"
          placeholderTextColor={theme.placeholder}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
          editable={!carregando}
        />

        {erro ? <Text style={[styles.errorText, { color: theme.error }]}>{erro}</Text> : null}

        <Pressable
          style={[
            styles.primaryButton,
            { backgroundColor: theme.primary },
            carregando && styles.primaryButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Entrar</Text>
          )}
        </Pressable>

        {/* Link para recuperação da senha esquecida. */}
        <View style={styles.linkRow}>
          <Link screen="recSenha" style={[styles.linkText, { color: theme.primaryDark }]}>Esqueci minha senha</Link>
        </View>

        {/* Link para criação de uma nova conta. */}
        <Pressable onPress={() => navigation.navigate('cadUsuario')}>
          <Text style={[styles.registerText, { color: theme.text }]}>Não tem conta? Cadastre-se</Text>
        </Pressable>
      </View>
    </View>
  );
}
