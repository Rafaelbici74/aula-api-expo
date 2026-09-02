import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import styles, { colors } from '../../../stylesGlobal';

// Formulário de criação de conta com validações básicas antes da navegação.
export default function CadUsuario() {
  const navigation = useNavigation();
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
    <View style={styles.centeredScreen}>
      <View style={styles.card}>
        <Text style={styles.title}>Faça seu cadastro</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor={colors.placeholder}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError('');
          }}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirme a senha"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (passwordError) setPasswordError('');
          }}
        />

        {/* Exibe a validação quando as senhas informadas são diferentes. */}
        {passwordError ? (
          <Text style={{ color: '#d93025', fontSize: 12, marginBottom: 12, marginTop: -6 }}>
            {passwordError}
          </Text>
        ) : null}

        {/* Envia o cadastro depois que as validações são aprovadas. */}
        <Pressable style={styles.primaryButton} onPress={handleRegister}>
          <Text style={styles.primaryButtonText}>Cadastrar</Text>
        </Pressable>

        {/* Retorna ao login sem empilhar uma nova tela. */}
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
          <Text style={{ textAlign: 'center', color: colors.mutedText }}>Já tem conta? Entre</Text>
        </Pressable>
      </View>
    </View>
  );
}
