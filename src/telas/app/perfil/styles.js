import { StyleSheet } from 'react-native';
import { colors } from '../../../stylesGlobal';

// Estilos exclusivos do card de perfil e da foto do usuário.
export default StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
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
  infoBlock: {
    width: '100%',
    marginTop: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  value: {
    fontSize: 14,
    lineHeight: 21,
  },
  ratingValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    marginTop: 10,
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  bioInput: {
    minHeight: 130,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
  },
  locationStep: {
    marginBottom: 10,
  },
  locationSearch: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  locationList: {
    maxHeight: 280,
  },
  locationOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    marginTop: 18,
  },
  cancelText: {
    fontWeight: '600',
  },
  saveText: {
    fontWeight: '700',
  },
});
