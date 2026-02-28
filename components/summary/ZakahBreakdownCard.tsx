import { cardShadow, useThemeColor } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { G } from "@/constants/Gradients";
import { useLanguage } from "@/context/LanguageContext";
import { useZakah } from "@/context/ZakahContext";
import { formatCurrency, formatWeight } from "@/utils/formatting";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

function StatCard({
  label,
  value,
  sub,
  subColor,
  iconName,
  gradient,
  topStrip = true,
  tintedBg = false,
  hero = false,
  compact = false,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  iconName: React.ComponentProps<typeof Feather>["name"];
  gradient: [string, string];
  topStrip?: boolean;
  tintedBg?: boolean;
  hero?: boolean;
  compact?: boolean;
}) {
  const card = useThemeColor({}, "card");
  const text = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");
  const isWeb = Platform.OS === "web";

  const bgColor = tintedBg ? gradient[1] + "18" : card;
  const labelColor = hero ? "rgba(255,255,255,0.8)" : muted;
  const valueColor = hero ? "#fff" : text;
  const subTextColor = hero ? "rgba(255,255,255,0.65)" : (subColor ?? muted);
  const iconColors: [string, string] = isWeb
    ? ["rgba(255,255,255,0.28)", "rgba(255,255,255,0.08)"]
    : gradient;
  const iconShadowColor = hero ? "#000" : gradient[0];

  if (compact) {
    const barEl =
      !hero && topStrip ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.leftBar}
        />
      ) : !hero && !topStrip ? (
        <View
          style={[styles.leftBar, { backgroundColor: gradient[0] + "40" }]}
        />
      ) : (
        <View style={styles.leftBar} />
      );

    const contentEl = (
      <View style={styles.compactContent}>
        <LinearGradient
          colors={iconColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.compactIcon,
            {
              shadowColor: iconShadowColor,
              shadowOpacity: 0.4,
              shadowRadius: 7,
              shadowOffset: { width: 0, height: 3 },
              elevation: 5,
            },
          ]}
        >
          <Feather name={iconName} size={16} color="#fff" />
        </LinearGradient>
        <View style={styles.compactText}>
          <Text style={[styles.compactLabel, { color: labelColor }]}>
            {label}
          </Text>
          {sub ? (
            <Text style={[styles.compactSub, { color: subTextColor }]}>
              {sub}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.compactValue, { color: valueColor }]}>
          {value}
        </Text>
      </View>
    );

    return (
      <View style={[styles.compactOuter, cardShadow]}>
        {hero ? (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.compactInner}
          >
            {barEl}
            {contentEl}
          </LinearGradient>
        ) : (
          <View style={[styles.compactInner, { backgroundColor: bgColor }]}>
            {barEl}
            {contentEl}
          </View>
        )}
      </View>
    );
  }

  const content = (
    <View style={styles.statContent}>
      <LinearGradient
        colors={iconColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.iconWrap,
          {
            shadowColor: iconShadowColor,
            shadowOpacity: hero ? 0.35 : 0.4,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          },
        ]}
      >
        <Feather name={iconName} size={18} color="#fff" />
      </LinearGradient>
      <Text style={[styles.statLabel, { color: labelColor }]}>{label}</Text>
      <Text
        style={[
          styles.statValue,
          { color: valueColor, alignSelf: "flex-start" },
        ]}
      >
        {value}
      </Text>
      {sub ? (
        <Text style={[styles.statSub, { color: subTextColor }]}>{sub}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.statOuter, cardShadow]}>
      {hero ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.statInner}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.statInner, { backgroundColor: bgColor }]}>
          {topStrip && (
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topStrip}
            />
          )}
          {content}
        </View>
      )}
    </View>
  );
}

export default function ZakahBreakdownCard() {
  const { calculation, state } = useZakah();
  const { t } = useLanguage();
  const { breakdown, totalWealthBaseCurrency } = calculation;
  const { baseCurrency } = state.priceSettings;
  const text = useThemeColor({}, "text");
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 540;
  const heroGradient = colorScheme === "dark" ? G.tealCyanDark : G.tealCyan;

  const goldPureGrams = state.metalHoldings
    .filter((h) => h.type === "gold")
    .reduce((sum, h) => {
      const purityFraction =
        h.purityUnit === "karats" ? h.purity / 24 : h.purity / 100;
      return sum + h.weightGrams * purityFraction;
    }, 0);

  const silverWeightTotal = state.metalHoldings
    .filter((h) => h.type === "silver")
    .reduce((sum, h) => sum + h.weightGrams, 0);

  const cards = [
    {
      label: t("currencies"),
      value: formatCurrency(breakdown.currenciesTotal, baseCurrency),
      sub: t("cashAndAccounts"),
      iconName: "credit-card" as const,
      gradient: G.cyan,
    },
    {
      label: t("gold"),
      value: formatCurrency(breakdown.goldTotal, baseCurrency),
      sub:
        goldPureGrams > 0
          ? `${formatWeight(goldPureGrams)} ${t("eq24k")}`
          : undefined,
      iconName: "star" as const,
      gradient: G.gold,
    },
    {
      label: t("silver"),
      value: formatCurrency(breakdown.silverTotal, baseCurrency),
      sub: silverWeightTotal > 0 ? formatWeight(silverWeightTotal) : undefined,
      iconName: "disc" as const,
      gradient: G.silver,
    },
    {
      label: t("totalWealth"),
      value: formatCurrency(totalWealthBaseCurrency, baseCurrency),
      sub: t("grandTotalDesc"),
      iconName: "trending-up" as const,
      gradient: heroGradient,
      hero: true,
    },
  ];

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: text }]}>
        {t("wealthBreakdown")}
      </Text>

      {isMobile ? (
        // Compact horizontal list on mobile
        <View style={styles.compactList}>
          {cards.map((card) => (
            <StatCard
              key={card.label}
              compact
              label={card.label}
              value={card.value}
              sub={card.sub}
              // subColor={card.subColor}
              iconName={card.iconName}
              gradient={card.gradient}
              topStrip={card.topStrip ?? true}
              hero={card.hero ?? false}
              tintedBg={card.tintedBg ?? false}
            />
          ))}
        </View>
      ) : (
        // 2×2 grid on tablet/desktop
        <>
          <View style={styles.row}>
            {cards.slice(0, 2).map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                sub={card.sub}
                subColor={card.subColor}
                iconName={card.iconName}
                gradient={card.gradient}
                topStrip={card.topStrip ?? true}
                hero={card.hero ?? false}
                tintedBg={card.tintedBg ?? false}
              />
            ))}
          </View>
          <View style={styles.row}>
            {cards.slice(2).map((card) => (
              <StatCard
                key={card.label}
                label={card.label}
                value={card.value}
                sub={card.sub}
                subColor={card.subColor}
                iconName={card.iconName}
                gradient={card.gradient}
                topStrip={card.topStrip ?? true}
                hero={card.hero ?? false}
                tintedBg={card.tintedBg ?? false}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginBottom: 14 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 14 },

  // Desktop/tablet 2-column grid
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },

  // Outer View carries the shadow (can't use overflow:hidden here)
  statOuter: { flex: 1, borderRadius: 16 },
  // Inner View clips the top strip to the border radius
  statInner: { borderRadius: 16, overflow: "hidden" },
  topStrip: { height: 4 },
  statContent: { padding: 16, paddingTop: 14 },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statLabel: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  statValue: { fontSize: 20, fontFamily: "Inter_800ExtraBold" },
  statSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },

  // Mobile compact horizontal cards
  compactList: { gap: 10 },
  compactOuter: { borderRadius: 14 },
  compactInner: {
    borderRadius: 14,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "stretch",
  },
  leftBar: { width: 4 },
  compactContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingRight: 16,
    paddingLeft: 12,
    gap: 12,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  compactText: { flex: 1 },
  compactLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  compactSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  compactValue: { fontSize: 16, fontFamily: "Inter_700Bold", flexShrink: 0 },
});
