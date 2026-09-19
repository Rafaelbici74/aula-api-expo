import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeContext';

const iconNames = {
  home: ['home', 'home-outline'],
  'Meus Projetos': ['briefcase', 'briefcase-outline'],
  Perfil: ['person', 'person-outline'],
  Configurações: ['list', 'list-outline'],
};

export default function AnimatedTabBar({ state, descriptors, navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const indicatorPosition = useRef(new Animated.Value(state.index)).current;
  const tabWidth = width / state.routes.length;

  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: state.index,
      damping: 18,
      stiffness: 180,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [indicatorPosition, state.index]);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 8) }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            backgroundColor: theme.inputBackground,
            width: tabWidth,
            transform: [{
              translateX: indicatorPosition.interpolate({
                inputRange: state.routes.map((_, index) => index),
                outputRange: state.routes.map((_, index) => index * tabWidth),
              }),
            }],
          },
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const [activeIcon, inactiveIcon] = iconNames[route.name] || ['ellipse', 'ellipse-outline'];

        function onPress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel || label}
            onPress={onPress}
            style={styles.tab}
          >
            <Ionicons
              name={focused ? activeIcon : inactiveIcon}
              size={focused ? 24 : 22}
              color={focused ? theme.primary : theme.mutedText}
            />
            {focused ? <Text style={[styles.label, { color: theme.primary }]} numberOfLines={1}>{label}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = {
  container: {
    alignItems: 'stretch',
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 62,
    overflow: 'hidden',
    position: 'relative',
  },
  indicator: {
    borderRadius: 16,
    bottom: 6,
    left: 0,
    position: 'absolute',
    top: 6,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 3,
    zIndex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
};
