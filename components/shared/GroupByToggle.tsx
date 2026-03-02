import { useThemeColor } from "@/components/Themed";
import { useLanguage } from "@/context/LanguageContext";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  value: "currency" | "label" | null;
  onChange: (mode: "currency" | "label") => void;
}

export default function GroupByToggle({ value, onChange }: Props) {
  const { t, lang } = useLanguage();
  const isRTL = lang === "ar";
  const muted = useThemeColor({}, "muted");
  const border = useThemeColor({}, "border");
  const chromeText = useThemeColor({}, "chromeText");

  return (
    <View
      style={[
        styles.row,
        {
          flexDirection: "row",
          alignSelf: "flex-start",
        },
      ]}
    >
      <Text style={[styles.label, { color: muted }]}>{t("group")}</Text>
      <View style={[styles.segControl, { backgroundColor: border }]}>
        {(["currency", "label"] as const).map((mode) => {
          const active = value === mode;
          return (
            <Pressable
              key={mode}
              style={[styles.seg, active && styles.segActive]}
              onPress={() => onChange(mode)}
            >
              <Text
                style={[styles.segText, { color: active ? chromeText : muted }]}
              >
                {mode === "currency" ? t("groupByCurrency") : t("groupByLabel")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  segControl: {
    flexDirection: "row",
    borderRadius: 24,
    alignSelf: "flex-start",
    padding: 3,
  },
  seg: {
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  segActive: {
    backgroundColor: "#fff",
  },
  segText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
