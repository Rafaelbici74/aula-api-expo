import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

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

  function handleRegister() {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('As senhas não conferem');
      return;
    }

    setPasswordError('');
    Alert.alert('Cadastro realizado', 'Bem-vindo ' + name);
    navigation.navigate('myTab');
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
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
          placeholder="E-mail"
          placeholderTextColor={theme.placeholder}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
          placeholder="Senha"
          placeholderTextColor={theme.placeholder}
          secureTextEntry
          value={password}
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

        {/* Envia o cadastro depois que as validações são aprovadas. */}
        <Pressable style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={handleRegister}>
          <Text style={styles.primaryButtonText}>Cadastrar</Text>
        </Pressable>

        {/* Retorna ao login sem empilhar uma nova tela. */}
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ textAlign: 'center', color: theme.mutedText }}>Já tem conta? Entre</Text>
        </Pressable>
      </View>
    </View>
  );
}
