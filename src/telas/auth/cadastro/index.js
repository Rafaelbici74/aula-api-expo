import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { registrarUsuario } from '../../../services/authApi';
import styles from '../../../stylesGlobal';
import { useTheme } from '../../../theme/ThemeContext';

// Formulário de criação de conta com validações básicas antes da navegação.
export default function CadUsuario() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (submitting) return;
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Preencha todos os campos');
      return;
    }

    if (password.length < 6 || !/[A-Z]/.test(password)) {
      Alert.alert('A senha deve ter pelo menos 6 caracteres e conter uma letra maiúscula');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('As senhas não conferem');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Informe um e-mail válido');
      return;
    }

    setPasswordError('');
    setRegisterError('');
    setSubmitting(true);
    try {
      await registrarUsuario(name.trim(), email.trim().toLowerCase(), password);
      Alert.alert(
        'Cadastro realizado',
        'Sua conta foi criada. Faça login para continuar.',
        [{ text: 'Fazer login', onPress: () => navigation.replace('login') }],
      );
    } catch (error) {
      setRegisterError(error.message || 'Não foi possível realizar o cadastro.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.centeredScreen, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.primaryDark }]}>Faça seu cadastro</Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
          placeholder="Nome"
          placeholderTextColor={theme.placeholder}
          value={name}
          onChangeText={setName}
          maxLength={100}
          editable={!submitting}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
          placeholder="E-mail"
          placeholderTextColor={theme.placeholder}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          maxLength={150}
          editable={!submitting}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
          placeholder="Senha"
          placeholderTextColor={theme.placeholder}
          secureTextEntry
          value={password}
          editable={!submitting}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError('');
          }}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
          placeholder="Confirme a senha"
          placeholderTextColor={theme.placeholder}
          secureTextEntry
          value={confirmPassword}
          editable={!submitting}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (passwordError) setPasswordError('');
          }}
        />

        {/* Exibe a validação quando as senhas informadas são diferentes. */}
        {passwordError ? (
          <Text style={{ color: theme.error, fontSize: 12, marginBottom: 12, marginTop: -6 }}>
            {passwordError}
          </Text>
        ) : null}

        {registerError ? (
          <Text style={{ color: theme.error, fontSize: 12, marginBottom: 12 }}>
            {registerError}
          </Text>
        ) : null}

        <Pressable
          style={[
            styles.primaryButton,
            { backgroundColor: theme.primary },
            submitting && { opacity: 0.6 },
          ]}
          onPress={handleRegister}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Cadastrar</Text>
          )}
        </Pressable>

        {/* Retorna ao login sem empilhar uma nova tela. */}
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ textAlign: 'center', color: theme.mutedText }}>Já tem conta? Entre</Text>
        </Pressable>
      </View>
    </View>
  );
}
