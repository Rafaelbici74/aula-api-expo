import { View, Text } from 'react-native';
import styles from '../stylesGlobal';

export default function RecSenha(){
    return(
        <View style={styles.centeredScreen}>
            <View style={styles.card}>
                <Text style={styles.title}>Recuperar senha</Text>
            </View>
        </View>
    );
}