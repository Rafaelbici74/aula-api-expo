import { View, Text, TextInput, Pressable } from 'react-native';
import { Link, useNavigation } from '@react-navigation/native';

import styles from './styles';

export default function Home() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.tituloProj}>Explore novos projetos</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Procure por um projeto"
                    placeholderTextColor="#94a3b8"
                    returnKeyType="search"
                />
            </View>


            <View>
                <Text style={styles.titulo}>Projetos em destaque</Text>
            </View>
        </View>

    
    );
}