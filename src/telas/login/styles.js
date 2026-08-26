import { StyleSheet } from 'react-native';
import { colors } from '../../stylesGlobal';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: colors.surface,
        borderRadius: 7,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 6,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: colors.mutedText,
        marginBottom: 24,
    },
    input: {
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.text,
        marginBottom: 14,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        borderRadius: 7,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    linkRow: {
        alignItems: 'flex-end',
        marginTop: 12,
        marginBottom: 18,
    },
    linkText: {
        color: colors.primaryDark,
        fontSize: 13,
    },
    registerText: {
        textAlign: 'center',
        color: colors.text,
        fontSize: 14,
        fontWeight: '500',
    },
});
