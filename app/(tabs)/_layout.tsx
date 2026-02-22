import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useThemeToggle } from '@/context/ThemeContext';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

function HeaderTitle({ color }: { color: string }) {
  return (
    <View style={headerStyles.container}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={headerStyles.icon}
        resizeMode="contain"
      />
      <Text style={[headerStyles.text, { color }]}>ZaKalculator</Text>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 28, height: 28, borderRadius: 6 },
  text: { fontSize: 18, fontWeight: '700' },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const { background, border, tint, tabIconDefault, chrome, chromeText, text, warning } = Colors[scheme];
  const isLight = scheme === 'light';
  const { toggleTheme } = useThemeToggle();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isLight ? '#8B6315' : tint,
        tabBarInactiveTintColor: tabIconDefault,
        tabBarStyle: { backgroundColor: isLight ? background : chrome, borderTopColor: border },
        headerShown: useClientOnlyValue(false, true),
        headerTitle: () => <HeaderTitle color={isLight ? text : chromeText} />,
        headerStyle: { backgroundColor: isLight ? background : chrome, borderBottomWidth: 1, borderBottomColor: border },
        headerTintColor: isLight ? text : chromeText,
        headerShadowVisible: false,
        headerRight: () => (
          <Pressable onPress={toggleTheme} style={{ marginRight: 16 }} hitSlop={8}>
            <FontAwesome
              name={scheme === 'dark' ? 'sun-o' : 'moon-o'}
              size={20}
              color={isLight ? text : chromeText}
            />
          </Pressable>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Assets',
          tabBarIcon: ({ color }) => <TabBarIcon name="dollar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="five"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="four"
        options={{
          title: 'Prices',
          tabBarIcon: ({ color }) => <TabBarIcon name="sliders" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Summary',
          tabBarIcon: ({ color }) => <TabBarIcon name="calculator" color={color} />,
        }}
      />
      <Tabs.Screen
        name="three"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color }) => <TabBarIcon name="check-circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
