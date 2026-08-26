import { StyleSheet } from 'react-native';
import { colors } from '../../stylesGlobal';

export default StyleSheet.create({
	container: {
		flex: 1,
        backgroundColor: colors.background,
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	header: {
		width: '100%',
		maxWidth: 360,
		paddingTop: 20,
        textAlign: 'center',
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
        color: colors.primaryDark,
		marginBottom: 10,
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
    }
});
