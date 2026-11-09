import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { redefinirSenha, solicitarCodigoRecuperacao } from '../../../services/authApi';
import styles from '../../../stylesGlobal';
import { useTheme } from '../../../theme/ThemeContext';

export default function RecSenha() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [codigoSolicitado, setCodigoSolicitado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function handleSolicitarCodigo() {
    const emailNormalizado = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      setErro('Informe um e-mail válido.');
      setMensagem('');
      return;
    }

    setErro('');
    setMensagem('');
    setCarregando(true);
    try {
      const resposta = await solicitarCodigoRecuperacao(emailNormalizado);
      setEmail(emailNormalizado);
      setCodigoSolicitado(true);
      setCodigo('');
      setNovaSenha('');
      setConfirmarSenha('');
      setMensagem(resposta.message || 'Se o e-mail estiver cadastrado, você receberá um código.');
    } catch (requestError) {
      setErro(requestError.message || 'Não foi possível solicitar o código.');
    } finally {
      setCarregando(false);
    }
  }

  async function handleRedefinirSenha() {
    if (!/^\d{8}$/.test(codigo)) {
      setErro('Informe o código de 8 dígitos recebido por e-mail.');
      setMensagem('');
      return;
    }
    if (novaSenha.length < 6 || !/[A-Z]/.test(novaSenha)) {
      setErro('A senha deve ter pelo menos 6 caracteres e conter uma letra maiúscula.');
      setMensagem('');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não conferem.');
      setMensagem('');
      return;
    }

    setErro('');
    setMensagem('');
    setCarregando(true);
    try {
      const resposta = await redefinirSenha(email.trim().toLowerCase(), codigo, novaSenha);
      Alert.alert(
        'Senha redefinida',
        resposta.message || 'Sua senha foi alterada. Faça login para continuar.',
        [{ text: 'Ir para o login', onPress: () => navigation.replace('login') }],
      );
    } catch (requestError) {
      setErro(requestError.message || 'Não foi possível redefinir a senha.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[
          styles.centeredScreen,
          { alignSelf: 'stretch', backgroundColor: theme.background, flex: 1 },
        ]}
        >
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.title, { color: theme.primaryDark }]}>Recuperar senha</Text>
            <Text style={{ color: theme.mutedText, marginBottom: 16 }}>
              Informe o e-mail da sua conta para receber um código de recuperação.
            </Text>

            <TextInput
              style={[styles.input, {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text,
              }]}
              placeholder="E-mail"
              placeholderTextColor={theme.placeholder}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setErro('');
                setMensagem('');
                if (codigoSolicitado) {
                  setCodigoSolicitado(false);
                  setCodigo('');
                  setNovaSenha('');
                  setConfirmarSenha('');
                }
              }}
              maxLength={150}
              editable={!carregando}
            />

            {codigoSolicitado ? (
              <>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  }]}
                  placeholder="Código de 8 dígitos"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="number-pad"
                  value={codigo}
                  onChangeText={(value) => setCodigo(value.replace(/\D/g, '').slice(0, 8))}
                  maxLength={8}
                  editable={!carregando}
                />
                <TextInput
                  style={[styles.input, {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  }]}
                  placeholder="Nova senha"
                  placeholderTextColor={theme.placeholder}
                  secureTextEntry
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  editable={!carregando}
                />
                <TextInput
                  style={[styles.input, {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    color: theme.text,
                  }]}
                  placeholder="Confirme a nova senha"
                  placeholderTextColor={theme.placeholder}
                  secureTextEntry
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  editable={!carregando}
                />
              </>
            ) : null}

            {mensagem ? (
              <Text style={{ color: theme.mutedText, fontSize: 13, marginBottom: 12 }}>
                {mensagem}
              </Text>
            ) : null}
            {erro ? (
              <Text style={{ color: theme.error, fontSize: 13, marginBottom: 12 }}>
                {erro}
              </Text>
            ) : null}

            <Pressable
              style={[
                styles.primaryButton,
                { backgroundColor: theme.primary },
                carregando && { opacity: 0.6 },
              ]}
              onPress={codigoSolicitado ? handleRedefinirSenha : handleSolicitarCodigo}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {codigoSolicitado ? 'Redefinir senha' : 'Enviar código'}
                </Text>
              )}
            </Pressable>

            {codigoSolicitado ? (
              <Pressable
                onPress={handleSolicitarCodigo}
                disabled={carregando}
                style={{ alignItems: 'center', marginTop: 14 }}
              >
                <Text style={{ color: theme.primaryDark }}>Enviar outro código</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => navigation.goBack()}
              disabled={carregando}
              style={{ alignItems: 'center', marginTop: 18 }}
            >
              <Text style={{ color: theme.mutedText }}>Voltar para o login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
