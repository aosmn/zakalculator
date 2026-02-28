import GradientButton, {
    GRADIENT_DANGER,
} from "@/components/shared/GradientButton";
import { useThemeColor } from "@/components/Themed";
import { useLanguage } from "@/context/LanguageContext";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteSheet({
  visible,
  itemName,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useLanguage();
  const bg = useThemeColor({}, "card");
  const text = useThemeColor({}, "text");
  const danger = useThemeColor({}, "danger");
  const muted = useThemeColor({}, "muted");
  const border = useThemeColor({}, "border");

  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: bg, paddingBottom: 28 + insets.bottom },
          ]}
        >
          <Text style={[styles.title, { color: text }]}>
            {t("deleteTitle", { name: itemName ?? "item" })}
          </Text>
          <Text style={[styles.subtitle, { color: muted }]}>
            {t("deleteUndone")}
          </Text>
          <GradientButton
            label={t("delete")}
            onPress={onConfirm}
            colors={GRADIENT_DANGER}
            style={styles.destructiveBtn}
          />
          <Pressable
            style={[styles.btn, styles.cancel, { borderColor: border }]}
            onPress={onCancel}
          >
            <Text style={[styles.btnText, { color: text }]}>{t("cancel")}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 44,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 28,
  },
  destructiveBtn: { borderRadius: 14, paddingVertical: 16, marginBottom: 10 },
  cancel: { backgroundColor: "transparent", borderWidth: 1 },
  btnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
