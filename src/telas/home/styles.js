import { StyleSheet } from 'react-native';
import { colors } from '../../stylesGlobal';

export default StyleSheet.create({
	container: {
		flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        alignItems: 'center',
        paddingBottom: 28,
	},
	header: {
		width: '100%',
        backgroundColor: colors.primary,
        borderRadius: 15,
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 20,
        marginTop: 30,
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 4,
	},

    titulo: {
		fontSize: 26,
		fontWeight: '700',
        color: colors.primaryDark,
		marginTop: 50,
        textAlign: 'center',
	},
	tituloProj: {
		fontSize: 26,
		fontWeight: '700',
        color: colors.surface,
		marginBottom: 10,
        marginTop: 0,
        textAlign: 'center',
	},

    input: {
        width: '100%',
        height: 52,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 0,
        fontSize: 15,
        color: colors.text,
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },

    projetosSection: {
        width: '100%',
        maxWidth: 360,
        paddingHorizontal: 24,
    },
    projetosContainer: {
        width: '100%',
        gap: 14,
        marginTop: 20,
    },
    projetoCard: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    projetoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    projetoTitulo: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: colors.primaryDark,
    },
    categoria: {
        color: colors.primary,
        backgroundColor: '#eef0ff',
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 5,
        fontSize: 12,
        fontWeight: '600',
    },
    projetoDescricao: {
        color: colors.mutedText,
        fontSize: 14,
        lineHeight: 20,
        marginTop: 10,
    },
    verProjeto: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '700',
        marginTop: 14,
    }
});
