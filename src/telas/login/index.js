import { View, Text, TextInput, Pressable } from 'react-native';
import { Link, useNavigation } from '@react-navigation/native';

import styles from './styles';

export default function Login() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Bem-vindo</Text>
                <Text style={styles.subtitle}>Acesse sua conta</Text>

                <TextInput
                    style={styles.input}
                    placeholder="E-mail"
                    placeholderTextColor="#8a8a8a"
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor="#8a8a8a"
                    secureTextEntry
                />

                <Pressable
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('myTab')}
                >
                    <Text style={styles.primaryButtonText}>Entrar</Text>
                </Pressable>

                <View style={styles.linkRow}>
                    <Link screen="recSenha" style={styles.linkText}>Esqueci minha senha</Link>
                </View>

                <Pressable onPress={() => navigation.navigate('cadUsuario')}>
                    <Text style={styles.registerText}>Não tem conta? Cadastre-se</Text>
                </Pressable>
            </View>
        </View>
    );
}