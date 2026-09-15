import { Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';

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
    borderRadius: 15,
    marginTop: 30,
    paddingHorizontal: 18,
    paddingVertical: 20,
    shadowColor: '#172554',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
};
