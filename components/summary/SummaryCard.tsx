import { useColorScheme } from "@/components/useColorScheme";
import { G } from "@/constants/Gradients";
import { useLanguage } from "@/context/LanguageContext";
import { useZakah } from "@/context/ZakahContext";
import { formatCurrency } from "@/utils/formatting";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function SummaryCard() {
  const { calculation, state } = useZakah();
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const isWeb = Platform.OS === "web";
  const { t } = useLanguage();
  const {
    zakahDueBaseCurrency,
    totalPaidBaseCurrency,
    remainingBaseCurrency,
    nisabValueBaseCurrency,
    isAboveNisab,
  } = calculation;
  const { baseCurrency } = state.priceSettings;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isPaid = remainingBaseCurrency <= 0;
  const heroColor = "#fff";
  const progress =
    zakahDueBaseCurrency > 0
      ? Math.min(totalPaidBaseCurrency / zakahDueBaseCurrency, 1)
      : 0;
  const shadowColor = isDark ? "#000" : "#2DAEBF";
  const shadowOpacity = isDark ? 0.5 : 0.4;
  const gradient = isDark ? G.tealCyanDark : G.tealCyan;

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={[styles.card, { shadowColor, shadowOpacity }]}
    >
      <View style={styles.titleRow}>
        <LinearGradient
          colors={["rgba(255,255,255,0.28)", "rgba(255,255,255,0.08)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconWrap}
        >
          <Feather
            name={isPaid ? "check-circle" : "trending-up"}
            size={16}
            color="#fff"
          />
        </LinearGradient>
        <Text style={styles.title}>{t("zakahSummary")}</Text>
      </View>

      {/* Hero: zakah due */}
      <Text
        style={[
          styles.heroValue,
          {
            color: heroColor,
            textAlign: isRTL ? "right" : "left",
            marginEnd: !isWeb ? "auto" : 0,
          },
        ]}
      >
        {formatCurrency(zakahDueBaseCurrency, baseCurrency)}
      </Text>

      {/* Progress label + bar */}
      <Text style={styles.progressLabel}>
        {isPaid
          ? t("fullyPaid")
          : `${Math.round(progress * 100)}% ${t("paid")}`}
      </Text>
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={["#84CC16", "#38CCDE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress * 100}%` as any }]}
        />
      </View>

      {/* Sub rows: paid (left) + remaining (right) */}
      <View style={styles.subRow}>
        <View style={styles.subCol}>
          <Text style={styles.rowLabel}>{t("totalPaid")}</Text>
          <Text
            style={[
              styles.rowValue,
              {
                textAlign: isRTL ? "right" : "left",
                marginEnd: !isWeb ? "auto" : 0,
              },
            ]}
          >
            {formatCurrency(totalPaidBaseCurrency, baseCurrency)}
          </Text>
        </View>
        <View style={styles.subCol}>
          <Text
            style={[
              styles.rowLabel,
              {
                textAlign: isRTL ? "left" : "right",
                marginStart: !isWeb ? "auto" : 0,
              },
            ]}
          >
            {t("remaining")}
          </Text>
          <Text
            style={[
              styles.rowValue,
              {
                marginStart: !isWeb ? "auto" : 0,
                textAlign: isRTL ? "left" : "right",
              },
            ]}
          >
            {formatCurrency(remainingBaseCurrency, baseCurrency)}
          </Text>
        </View>
      </View>

      {/* Nisab */}
      <View style={styles.nisabRow}>
        <Text style={styles.nisabLabel}>
          {t("nisabThreshold")}:{" "}
          {formatCurrency(nisabValueBaseCurrency, baseCurrency)}
        </Text>
        {isAboveNisab ? (
          <LinearGradient
            colors={["#38CCDE", "#84CC16"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nisabBadge}
          >
            <Feather name="check-circle" size={11} color="#fff" />
            <Text style={styles.nisabBadgeText}>{t("aboveNisab")}</Text>
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={G.tealDark}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nisabBadge}
          >
            <Feather name="x-circle" size={11} color="#fff" />
            <Text style={styles.nisabBadgeText}>{t("belowNisab")}</Text>
          </LinearGradient>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.9)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 42,
    fontFamily: "Inter_800ExtraBold",
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 6,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 16,
    overflow: "hidden",
  },
  progressFill: { height: 6, borderRadius: 3 },
  subRow: { flexDirection: "row", justifyContent: "space-between" },
  subCol: { flex: 1 },
  rowLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
  },
  rowValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginTop: 2,
  },
  nisabRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  nisabLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
  },
  nisabBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  nisabBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
