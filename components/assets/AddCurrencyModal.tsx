import { useThemeColor } from "@/components/Themed";
import CurrencyPickerSheet from "@/components/shared/CurrencyPickerSheet";
import FormInput from "@/components/shared/FormInput";
import GradientButton from "@/components/shared/GradientButton";
import { useLanguage } from "@/context/LanguageContext";
import { useZakah } from "@/context/ZakahContext";
import { CurrencyHolding } from "@/types";
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  editing?: CurrencyHolding;
  onClose: () => void;
}

export default function AddCurrencyModal({ visible, editing, onClose }: Props) {
  const { addCurrencyHolding, updateCurrencyHolding, state } = useZakah();
  const { t } = useLanguage();
  const bg = useThemeColor({}, "card");
  const text = useThemeColor({}, "text");
  const tint = useThemeColor({}, "tint");
  const muted = useThemeColor({}, "muted");
  const border = useThemeColor({}, "border");

  const insets = useSafeAreaInsets();

  const [label, setLabel] = useState("");
  const [currency, setCurrency] = useState(state.priceSettings.baseCurrency);
  const [amount, setAmount] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (editing) {
      setLabel(editing.label);
      setCurrency(editing.currency);
      setAmount(String(editing.amount));
    } else {
      setLabel("");
      setCurrency(state.priceSettings.baseCurrency);
      setAmount("");
    }
  }, [editing, visible]);

  function handleSave() {
    const parsed = parseFloat(amount);
    if (!label.trim() || !currency.trim() || isNaN(parsed)) return;
    if (editing) {
      updateCurrencyHolding(editing.id, {
        label: label.trim(),
        currency,
        amount: parsed,
      });
    } else {
      addCurrencyHolding({ label: label.trim(), currency, amount: parsed });
    }
    onClose();
  }

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <Pressable style={styles.overlay} onPress={onClose}>
          <KeyboardAvoidingView
            behavior="padding"
            style={[styles.kav, { paddingBottom: insets.bottom }]}
          >
            <Pressable
              style={[
                styles.sheet,
                { backgroundColor: bg, paddingBottom: 24 + insets.bottom },
              ]}
            >
              <Text style={[styles.title, { color: text }]}>
                {editing ? t("editCurrencyTitle") : t("addCurrencyTitle")}
              </Text>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <FormInput
                  label={t("amount")}
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />

                {/* Currency dropdown */}
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: muted }]}>
                    {t("currencyField")}
                  </Text>
                  <Pressable
                    style={[
                      styles.currencyBtn,
                      { borderColor: border, backgroundColor: bg },
                    ]}
                    onPress={() => setShowPicker(true)}
                  >
                    <Text style={[styles.currencyCode, { color: text }]}>
                      {currency}
                    </Text>
                    <Text style={[styles.chevron, { color: muted }]}>▾</Text>
                  </Pressable>
                </View>

                <FormInput
                  label={t("labelField")}
                  placeholder="e.g. Savings Account"
                  value={label}
                  onChangeText={setLabel}
                />
              </ScrollView>
              <GradientButton
                label={editing ? t("update") : t("add")}
                onPress={handleSave}
                style={styles.saveBtn}
              />
              <Pressable onPress={onClose} style={styles.cancelBtn}>
                <Text style={[styles.cancelText, { color: muted }]}>
                  {t("cancel")}
                </Text>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      <CurrencyPickerSheet
        visible={showPicker}
        selected={currency}
        onSelect={setCurrency}
        onClose={() => setShowPicker(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  kav: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxWidth: 540,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  fieldContainer: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  currencyBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currencyCode: { fontSize: 16, fontWeight: "600" },
  chevron: { fontSize: 16 },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelText: { fontSize: 15 },
});
