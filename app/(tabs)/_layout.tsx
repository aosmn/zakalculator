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
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
}

function HeaderTitle({ color }: { color: string }) {
  const { lang } = useLanguage();
  return (
    <View style={headerStyles.container}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={headerStyles.icon}
        resizeMode="contain"
      />
      <Text style={[headerStyles.text, { color }]}>
        {lang === 'ar' ? 'حاسبة الزكاة' : 'ZaKalculator'}
      </Text>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { width: 28, height: 28, borderRadius: 6 },
  text: { fontSize: 17, fontFamily: 'Inter_700Bold' },
});

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const { border, tint, tabIconDefault, chrome, chromeText } = Colors[scheme];
  const { t } = useLanguage();

  const [optionsVisible, setOptionsVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: tint,
          tabBarInactiveTintColor: tabIconDefault,
          tabBarStyle: {
            backgroundColor: chrome,
            borderTopWidth: 0,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
          },
          headerShown: useClientOnlyValue(false, true),
          headerTitle: () => <HeaderTitle color={chromeText} />,
          headerStyle: {
            backgroundColor: chrome,
            borderBottomWidth: 1,
            borderBottomColor: border,
          },
          headerTintColor: chromeText,
          headerShadowVisible: false,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginHorizontal: 16 }}>
              <PersonSwitcher />
              <Pressable
                onPress={() => setOptionsVisible(true)}
                hitSlop={8}>
                <FontAwesome name="bars" size={20} color={chromeText} />
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
