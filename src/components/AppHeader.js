import { Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { fontSizes, radii, spacing } from '../stylesGlobal';

export default function AppHeader({ title, children }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.header }]}>
      <Text style={[styles.title, { color: theme.headerText }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = {
  container: {
    width: '100%',
    borderRadius: radii.large,
    marginTop: spacing.medium,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
    shadowColor: '#172554',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: fontSizes.subtitle,
    fontWeight: '700',
    textAlign: 'center',
  },
};
