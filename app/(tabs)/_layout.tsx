import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OptionsSheet from "@/components/shared/OptionsSheet";
import PersonSwitcher from "@/components/shared/PersonSwitcher";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useLanguage } from "@/context/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";

const MAX_WIDTH = 860;

// ─── Tab bar icon ────────────────────────────────────────────────────────────
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
}

// ─── Header title ─────────────────────────────────────────────────────────────
function HeaderTitle({ color }: { color: string }) {
  const { lang } = useLanguage();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View style={headerStyles.container}>
      {isDark ? (
        <LinearGradient
          colors={["rgba(255,255,255,0.90)", "rgba(255,237,213,0.80)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={headerStyles.iconWrapDark}
        >
          <Image
            source={require("@/assets/images/icon.png")}
            style={headerStyles.icon}
            resizeMode="contain"
          />
        </LinearGradient>
      ) : (
        <View style={headerStyles.iconWrap}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={headerStyles.icon}
            resizeMode="contain"
          />
        </View>
      )}
      <Text style={[headerStyles.text, { color }]}>
        {lang === "ar" ? "حاسبة الزكاة" : "ZaKalculator"}
      </Text>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconWrap: { borderRadius: 24, overflow: "hidden" },
  iconWrapDark: {
    borderRadius: 24,
    overflow: "hidden",
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  icon: { width: 40, height: 40, borderRadius: 20 },
  text: { fontSize: 17, fontFamily: "Inter_700Bold" },
});

// ─── Custom tab bar ───────────────────────────────────────────────────────────
type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? "light";
  const { tint, tabIconDefault } = Colors[scheme];
  const insets = useSafeAreaInsets();

  const isDark = colorScheme === "dark";
  const bgColorWeb = isDark
    ? "rgba(10, 18, 35, 0.82)"
    : "rgba(255, 255, 255, 0.6)";

  const bgColor = Platform.select({
    web: bgColorWeb,
    default: isDark ? "rgb(10, 18, 35)" : "rgb(255, 255, 255)",
  });

  const HIDDEN_TABS = new Set(["prices", "zakah"]);

  const tabItems = state.routes
    .filter((route: any) => !HIDDEN_TABS.has(route.name))
    .map((route: any) => {
    const index = state.routes.indexOf(route);
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;
    const label = options.title ?? route.name;
    const iconColor = isFocused ? tint : tabIconDefault;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        style={tabStyles.item}
        accessibilityRole="button"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={label}
      >
        <View
          style={[
            tabStyles.iconWrap,
            isFocused && { backgroundColor: tint + "22" },
          ]}
        >
          {options.tabBarIcon?.({
            color: iconColor,
            size: 22,
            focused: isFocused,
          })}
        </View>
        <Text
          style={[
            tabStyles.label,
            {
              color: iconColor,
              fontFamily: isFocused ? "Inter_600SemiBold" : "Inter_400Regular",
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  });

  // On web, render a real <div> so CSS position:fixed and backdrop-filter apply
  // directly without going through React Native Web's style transformation layer.
  if (Platform.OS === "web") {
    return (
      // @ts-ignore — div is valid JSX on web
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: bgColor,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          paddingBottom: Math.max(insets.bottom, 8),
          boxShadow: "0 -4px 20px rgba(0,0,0,0.12)",
        }}
      >
        {/* @ts-ignore */}
        <div style={{ height: 8 }} />
        {/* @ts-ignore */}
        <div
          style={{
            maxWidth: MAX_WIDTH,
            width: "100%",
            marginLeft: "auto",
            marginRight: "auto",
            display: "flex",
            flexDirection: "row",
          }}
        >
          {tabItems}
        </div>
      </div>
    );
  }

  return (
    <View
      style={[
        tabStyles.outer,
        { backgroundColor: bgColor, paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <View style={tabStyles.topSpacer} />
      <View style={[tabStyles.inner]}>{tabItems}</View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  outer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  topSpacer: { height: 8 },
  inner: {
    maxWidth: MAX_WIDTH,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingBottom: 4,
  },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
  },
});

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? "light";
  const { border, chrome, chromeText } = Colors[scheme];
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [optionsVisible, setOptionsVisible] = useState(false);

  const CustomHeader = () => (
    <View
      style={[
        layoutStyles.headerOuter,
        {
          backgroundColor: chrome,
          borderBottomColor: border,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={layoutStyles.headerInner}>
        <HeaderTitle color={chromeText} />
        <View style={layoutStyles.headerRight}>
          <PersonSwitcher />
          <Pressable onPress={() => setOptionsVisible(true)} hitSlop={8}>
            <FontAwesome name="bars" size={20} color={chromeText} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: Colors[scheme].tint,
          tabBarInactiveTintColor: Colors[scheme].tabIconDefault,
          headerShown: useClientOnlyValue(false, true),
          header: () => <CustomHeader />,
          tabBarStyle: {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabAssets"),
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="dollar" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="overview"
          options={{
            title: t("tabZakah"),
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="calculator" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="payments"
          options={{
            title: t("tabPayments"),
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="check-circle" color={color} />
            ),
          }}
        />
        {/* Keep prices and zakah registered but off the tab bar */}
        <Tabs.Screen name="prices" options={{ href: null }} />
        <Tabs.Screen name="zakah" options={{ href: null }} />
      </Tabs>

      <OptionsSheet
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
      />
    </>
  );
}

const layoutStyles = StyleSheet.create({
  headerOuter: {
    borderBottomWidth: 1,
  },
  headerInner: {
    maxWidth: MAX_WIDTH,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 68,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
});
