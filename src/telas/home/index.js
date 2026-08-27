import { ScrollView, View, Text, TextInput } from 'react-native';

import styles from './styles';

const projetos = [
    {
        id: 1,
        titulo: 'EcoMarket',
        descricao: 'Marketplace de produtos sustentáveis.',
        categoria: 'Tecnologia',
    }
];

export default function Home() {
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.tituloProj}>Explore novos projetos</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Procure por um projeto"
                    placeholderTextColor="#94a3b8"
                    returnKeyType="search"
                />
            </View>

            <View style={styles.projetosSection}>
                <Text style={styles.titulo}>Projetos em destaque:</Text>

                <View style={styles.projetosContainer}>
                    {projetos.map((projeto) => (
                        <View key={projeto.id} style={styles.projetoCard}>
                            <View style={styles.projetoCardHeader}>
                                <Text style={styles.projetoTitulo}>{projeto.titulo}</Text>
                                <Text style={styles.categoria}>{projeto.categoria}</Text>
                            </View>
                            <Text style={styles.projetoDescricao}>{projeto.descricao}</Text>
                            <Text style={styles.verProjeto}>Ver projeto  ›</Text>
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>


    );
}