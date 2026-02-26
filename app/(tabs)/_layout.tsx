import React, { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useLanguage } from '@/context/LanguageContext';
import OptionsSheet from '@/components/shared/OptionsSheet';
import PersonSwitcher from '@/components/shared/PersonSwitcher';

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
  const { background, border, tint, tabIconDefault, chrome, chromeText, text } = Colors[scheme];
  const isLight = scheme === 'light';
  const { t } = useLanguage();

  const [optionsVisible, setOptionsVisible] = useState(false);

  return (
    <>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginHorizontal: 16 }}>
              <PersonSwitcher />
              <Pressable
                onPress={() => setOptionsVisible(true)}
                hitSlop={8}>
                <FontAwesome name="bars" size={20} color={isLight ? text : chromeText} />
              </Pressable>
            </View>
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabAssets'),
            tabBarIcon: ({ color }) => <TabBarIcon name="dollar" color={color} />,
          }}
        />
        <Tabs.Screen
          name="overview"
          options={{
            title: t('tabOverview'),
            tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />,
          }}
        />
        <Tabs.Screen
          name="prices"
          options={{
            title: t('tabPrices'),
            tabBarIcon: ({ color }) => <TabBarIcon name="sliders" color={color} />,
          }}
        />
        <Tabs.Screen
          name="zakah"
          options={{
            title: t('tabZakah'),
            tabBarIcon: ({ color }) => <TabBarIcon name="calculator" color={color} />,
          }}
        />
        <Tabs.Screen
          name="payments"
          options={{
            title: t('tabPayments'),
            tabBarIcon: ({ color }) => <TabBarIcon name="check-circle" color={color} />,
          }}
        />
      </Tabs>

      <OptionsSheet visible={optionsVisible} onClose={() => setOptionsVisible(false)} />
    </>
  );
}
