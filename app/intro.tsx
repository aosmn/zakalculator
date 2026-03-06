import { useThemeColor } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { useLanguage } from "@/context/LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FEATURES: {
  iconName: React.ComponentProps<typeof Feather>["name"];
  titleKey: "introFeature1Title" | "introFeature2Title" | "introFeature3Title" | "introFeature4Title";
  descKey: "introFeature1Desc" | "introFeature2Desc" | "introFeature3Desc" | "introFeature4Desc";
  gradient: [string, string];
}[] = [
  {
    iconName: "percent",
    titleKey: "introFeature1Title",
    descKey: "introFeature1Desc",
    gradient: ["#0D9488", "#0F766E"],
  },
  {
    iconName: "layers",
    titleKey: "introFeature2Title",
    descKey: "introFeature2Desc",
    gradient: ["#6366F1", "#4F46E5"],
  },
  {
    iconName: "users",
    titleKey: "introFeature3Title",
    descKey: "introFeature3Desc",
    gradient: ["#F59E0B", "#D97706"],
  },
  {
    iconName: "check-circle",
    titleKey: "introFeature4Title",
    descKey: "introFeature4Desc",
    gradient: ["#10B981", "#059669"],
  },
];

export default function IntroScreen() {
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const { t, lang } = useLanguage();
  const isRTL = lang === "ar";
  const card = useThemeColor({}, "card");
  const border = useThemeColor({}, "border");
  const text = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");

  async function handleGetStarted() {
    await AsyncStorage.setItem("hasSeenIntro", "1");
    router.replace("/(tabs)");
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header gradient */}
      <LinearGradient
        colors={isDark ? ["#0F2827", "#0D9488"] : ["#CCFBF1", "#0D9488"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logoWrap}
        />
        <Text style={[styles.appName, { textAlign: isRTL ? "center" : "center" }]}>
          {t("introWelcome")}
        </Text>
        <Text style={[styles.tagline, { textAlign: "center" }]}>
          {t("introTagline")}
        </Text>
      </LinearGradient>

      {/* Feature cards */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {FEATURES.map((f) => (
          <View
            key={f.titleKey}
            style={[
              styles.featureCard,
              { backgroundColor: card, borderColor: border },
              isRTL && Platform.OS === "web" && styles.featureCardRTL,
            ]}
          >
            <LinearGradient
              colors={f.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featureIcon}
            >
              <Feather name={f.iconName} size={22} color="#fff" />
            </LinearGradient>
            <View style={styles.featureText}>
              <Text
                style={[
                  styles.featureTitle,
                  { color: text, textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {t(f.titleKey)}
              </Text>
              <Text
                style={[
                  styles.featureDesc,
                  { color: muted, textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {t(f.descKey)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* CTA button */}
      <View
        style={[
          styles.ctaWrap,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: isDark ? "rgba(15,23,42,0.95)" : "rgba(249,250,251,0.95)",
          },
        ]}
      >
        <Pressable onPress={handleGetStarted} style={styles.ctaBtn}>
          <LinearGradient
            colors={["#0D9488", "#0F766E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>{t("introGetStarted")}</Text>
            <Feather
              name={isRTL ? "arrow-left" : "arrow-right"}
              size={18}
              color="#fff"
            />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 36,
    gap: 12,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 4,
  },
  appName: {
    fontSize: 24,
    fontFamily: "Inter_800ExtraBold",
    color: "#fff",
    lineHeight: 32,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  featureCardRTL: { flexDirection: "row-reverse" },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: { flex: 1, gap: 4 },
  featureTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  featureDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  ctaWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: "center",
  },
  ctaBtn: {
    borderRadius: 14,
    overflow: "hidden",
    width: "100%",
    maxWidth: 480,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
});
