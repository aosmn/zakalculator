import { G } from "@/constants/Gradients";
import { useLanguage } from "@/context/LanguageContext";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const VERTICAL_BREAKPOINT = 400;

interface Props {
  label: string;
  value: string;
  sub?: string;
  rightSub?: string;
  zakah?: string;
  iconName?: React.ComponentProps<typeof Feather>["name"];
  gradient?: [string, string];
  dividerTop?: boolean;
  dividerBottom?: boolean;
  vertical?: boolean;
}

export default function GroupTotalRow({
  label,
  value,
  sub,
  rightSub,
  zakah,
  iconName = "trending-up",
  gradient = G.tealDark,
  dividerTop = true,
  dividerBottom = false,
  vertical,
}: Props) {
  const { width } = useWindowDimensions();
  const isVertical = vertical ?? width < VERTICAL_BREAKPOINT;
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const isWeb = Platform.OS === "web";
  const enforceRTLStylesForWeb = isRTL && isWeb;

  const iconColors: [string, string] = isWeb
    ? ["rgba(255,255,255,0.28)", "rgba(255,255,255,0.08)"]
    : gradient;

  const iconBadge = (
    <LinearGradient
      colors={iconColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.iconWrap}
    >
      <Feather name={iconName} size={16} color="#fff" />
    </LinearGradient>
  );

  const startText = (
    <View style={styles.startText}>
      <Text
        style={[
          styles.label,
          { textAlign: enforceRTLStylesForWeb ? "right" : "left" },
        ]}
      >
        {label}
      </Text>
      {sub ? (
        <Text
          style={[
            styles.sub,
            { textAlign: enforceRTLStylesForWeb ? "right" : "left" },
          ]}
        >
          {sub}
        </Text>
      ) : null}
      {zakah ? (
        <Text
          style={[
            styles.zakah,
            { textAlign: enforceRTLStylesForWeb ? "right" : "left" },
          ]}
        >
          {zakah}
        </Text>
      ) : null}
    </View>
  );

  const endText = (
    <View>
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        style={[
          isVertical ? styles.valueVert : styles.value,
          { textAlign: enforceRTLStylesForWeb ? "left" : "right" },
        ]}
      >
        {value}
      </Text>
      {rightSub ? (
        <Text
          style={[
            styles.rightSub,
            { textAlign: enforceRTLStylesForWeb ? "left" : "right" },
          ]}
        >
          {rightSub}
        </Text>
      ) : null}
    </View>
  );

  return (
    <>
      {dividerTop && <View style={styles.divider} />}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={isVertical ? styles.containerVert : styles.container}
      >
        {isVertical ? (
          <>
            {/* Top: icon + label */}
            <View style={[styles.topRow]}>
              {iconBadge}
              {startText}
            </View>
            {/* Divider */}
            <View style={styles.innerDivider} />
            {/* Bottom: value */}
            <View style={[styles.bottomRow]}>{endText}</View>
          </>
        ) : (
          <>
            <View style={[styles.iconLabelGroup]}>
              {iconBadge}
              {startText}
            </View>
            <View style={{ flex: 1 }}>{endText}</View>
          </>
        )}
      </LinearGradient>
      {dividerBottom && <View style={styles.divider} />}
    </>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginHorizontal: 4,
    marginBottom: 8,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  containerVert: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  innerDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 14,
  },
  bottomRow: {
    padding: 14,
    paddingTop: 12,
  },
  // rowRTL: { flexDirection: "row-reverse" },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  iconLabelGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 16,
  },
  startText: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  sub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
  },
  zakah: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#fff" },
  value: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  valueVert: { fontSize: 24, fontFamily: "Inter_800ExtraBold", color: "#fff" },
  rightSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
});
