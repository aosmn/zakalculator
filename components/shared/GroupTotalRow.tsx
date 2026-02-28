import { Feather } from "@expo/vector-icons";
import { G } from "@/constants/Gradients";
import { useLanguage } from "@/context/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  label: string;
  value: string;
  sub?: string;
  rightSub?: string;
  zakah?: string;
  iconName?: React.ComponentProps<typeof Feather>["name"];
  gradient?: [string, string];
}

export default function GroupTotalRow({
  label,
  value,
  sub,
  rightSub,
  zakah,
  iconName = "trending-up",
  gradient = G.tealDark,
}: Props) {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  return (
    <>
    <View style={styles.divider} />
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.row}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.28)", "rgba(255,255,255,0.08)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconWrap}
      >
        <Feather name={iconName} size={16} color="#fff" />
      </LinearGradient>

      <View style={styles.left}>
        <Text style={[styles.label, { textAlign: isRTL ? "right" : "left" }]}>
          {label}
        </Text>
        {sub ? (
          <Text style={[styles.sub, { textAlign: isRTL ? "right" : "left" }]}>
            {sub}
          </Text>
        ) : null}
        {zakah ? (
          <Text style={[styles.zakah, { textAlign: isRTL ? "right" : "left" }]}>
            {zakah}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text style={[styles.value, { textAlign: isRTL ? "left" : "right" }]}>
          {value}
        </Text>
        {rightSub ? (
          <Text
            style={[styles.rightSub, { textAlign: isRTL ? "left" : "right" }]}
          >
            {rightSub}
          </Text>
        ) : null}
      </View>
    </LinearGradient>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
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
  left: { flex: 1 },
  right: { alignItems: "flex-end" },
  label: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  sub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  zakah: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#F59E0B",
    marginTop: 2,
  },
  value: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  rightSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
});
