import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles, { colors } from '../stylesGlobal';
import { useState } from 'react';

export default function CadUsuario(){
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function handleRegister(){
        if(!name.trim() || !email.trim() || !password){
            Alert.alert('Preencha todos os campos');
            return;
        }
        if(password.length < 6){
            Alert.alert('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        // Aqui você pode chamar sua API para criar o usuário.
        Alert.alert('Cadastro realizado', 'Bem-vindo ' + name);
        navigation.navigate('myTab');
    }

    return(
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
                    onChangeText={setPassword}
                />

                
                <TextInput
                    style={styles.input}
                    placeholder="Confirme a senha"
                    placeholderTextcolor={colors.placeholder}
                    securyTextEntry
                    value={password}
                    onChangeText={setPassword}

                >

                </TextInput>

                <Pressable style={styles.primaryButton} onPress={handleRegister}>
                    <Text style={styles.primaryButtonText}>Cadastrar</Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate('login')} style={{ marginTop: 12 }}>
                    <Text style={{ textAlign: 'center', color: colors.mutedText }}>Já tem conta? Entre</Text>
                </Pressable>
            </View>
        </View>
    );
}