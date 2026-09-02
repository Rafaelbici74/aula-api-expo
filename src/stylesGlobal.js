import { StyleSheet } from 'react-native';

// Tokens visuais compartilhados para manter a identidade das telas consistente.
export const colors = {
    primary: '#7f8fe8',
    primaryDark: '#172554',
    background: '#f5f7fb',
    surface: '#ffffff',
    inputBackground: '#f9fafb',
    border: '#dbe3f0',
    text: '#111827',
    mutedText: '#6b7280',
    placeholder: '#94a3b8',
};

export const spacing = {
    screen: 24,
    small: 8,
    medium: 16,
    large: 24,
};

// Estilos reutilizados por telas simples de conteúdo e autenticação.
const globalStyles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.screen,
    },
    centeredScreen: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.screen,
    },
    content: {
        width: '100%',
        maxWidth: 360,
        alignSelf: 'center',
        paddingTop: 56,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.primaryDark,
        marginBottom: spacing.medium,
    },
    text: {
        fontSize: 16,
        color: colors.text,
    },
    input: {
        width: '100%',
        height: 52,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 7,
        paddingHorizontal: 14,
        fontSize: 15,
        color: colors.text,
        marginBottom: spacing.medium,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: colors.surface,
        borderRadius: 7,
        padding: spacing.medium,
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 5,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        borderRadius: 7,
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: colors.surface,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default globalStyles;
