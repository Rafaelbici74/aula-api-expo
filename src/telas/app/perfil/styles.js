import { StyleSheet } from 'react-native';
import { colors } from '../../../stylesGlobal';

// Estilos exclusivos do card de perfil e da foto do usuário.
export default StyleSheet.create({
	card: {
		width: '100%',
		maxWidth: 360,
		alignSelf: 'center',
		alignItems: 'center',
		backgroundColor: colors.surface,
		borderRadius: 7,
		padding: 24,
		shadowColor: colors.primaryDark,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.1,
		shadowRadius: 16,
		elevation: 5,
	},
	photo: {
		width: 112,
		height: 112,
		borderRadius: 56,
		marginBottom: 16,
	},
	name: {
		color: colors.text,
		fontSize: 20,
		fontWeight: '700',
	},
	email: {
		color: colors.mutedText,
		fontSize: 14,
		marginTop: 6,
	},
});
