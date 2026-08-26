import { View, Text } from 'react-native';
import styles from '../stylesGlobal';

export default function Itens(){
    return(
        <View style={styles.screen}>
            <View style={styles.content}>
                <Text style={styles.title}>Itens</Text>
            </View>
        </View>
    );
}