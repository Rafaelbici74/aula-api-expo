import { StyleSheet } from 'react-native';
import { themes } from './theme/ThemeContext';

export const colors = themes.light;

export const spacing = {
    xSmall: 4,
    small: 8,
    medium: 16,
    large: 24,
    screen: 20,
};

export const radii = {
    small: 8,
    medium: 12,
    large: 16,
    pill: 999,
};

export const fontSizes = {
    caption: 12,
    small: 14,
    body: 16,
    subtitle: 20,
    title: 26,
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
        borderRadius: radii.small,
        paddingHorizontal: 14,
        fontSize: 15,
        color: colors.text,
        marginBottom: spacing.medium,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: colors.surface,
        borderRadius: radii.medium,
        padding: spacing.medium,
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 5,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        borderRadius: radii.medium,
        paddingVertical: 14,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: colors.onPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: colors.danger,
        borderRadius: radii.medium,
        paddingVertical: 14,
        paddingHorizontal: 28,
        alignItems: 'center',
        marginTop: 24,
    },
    logoutButtonPressed: {
        opacity: 0.75,
    },
    logoutButtonText: {
        color: colors.onDanger,
        fontSize: 16,
        fontWeight: '600',
    },
    appearanceCard: {
        borderWidth: 1,
        borderRadius: radii.medium,
        padding: spacing.medium,
        marginBottom: spacing.medium,
    },
    appearanceTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: spacing.small,
    },
    appearanceDescription: {
        fontSize: 14,
        marginBottom: spacing.medium,
    },
    appearanceOptions: {
        gap: spacing.small,
    },
    appearanceOption: {
        minHeight: 48,
        borderWidth: 1,
        borderRadius: radii.small,
        paddingHorizontal: spacing.medium,
        flexDirection: 'row',
        alignItems: 'center',
    },
    appearanceIndicator: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.small,
    },
    appearanceIndicatorSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    appearanceOptionText: {
        fontSize: 15,
        fontWeight: '600',
    },
});

export default globalStyles;
