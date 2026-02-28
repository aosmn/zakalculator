import SummaryCard from "@/components/summary/SummaryCard";
import ZakahBreakdownCard from "@/components/summary/ZakahBreakdownCard";
import { useThemeColor } from "@/components/Themed";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ZakahScreen() {
  const bg = useThemeColor({}, "background");

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <SummaryCard />
          <ZakahBreakdownCard />
          <View style={styles.spacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  inner: {
    padding: 16,
    maxWidth: 860,
    width: "100%",
    alignSelf: "center",
  },
  spacer: { height: 90 },
});
