import { useThemeColor } from "@/components/Themed";
import { useLanguage } from "@/context/LanguageContext";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TranslationKey } from "@/constants/translations";

export const COMMON_CURRENCIES: { code: string; nameKey: TranslationKey }[] = [
  { code: "USD", nameKey: "currencyUSD" },
  { code: "EUR", nameKey: "currencyEUR" },
  { code: "GBP", nameKey: "currencyGBP" },
  { code: "EGP", nameKey: "currencyEGP" },
  { code: "SAR", nameKey: "currencySAR" },
  { code: "AED", nameKey: "currencyAED" },
  { code: "KWD", nameKey: "currencyKWD" },
  { code: "QAR", nameKey: "currencyQAR" },
  { code: "BHD", nameKey: "currencyBHD" },
  { code: "OMR", nameKey: "currencyOMR" },
  { code: "JOD", nameKey: "currencyJOD" },
  { code: "TRY", nameKey: "currencyTRY" },
  { code: "PKR", nameKey: "currencyPKR" },
  { code: "INR", nameKey: "currencyINR" },
  { code: "BDT", nameKey: "currencyBDT" },
  { code: "CAD", nameKey: "currencyCAD" },
  { code: "AUD", nameKey: "currencyAUD" },
  { code: "CHF", nameKey: "currencyCHF" },
  { code: "JPY", nameKey: "currencyJPY" },
  { code: "CNY", nameKey: "currencyCNY" },
  { code: "MYR", nameKey: "currencyMYR" },
  { code: "IDR", nameKey: "currencyIDR" },
  { code: "NGN", nameKey: "currencyNGN" },
  { code: "ZAR", nameKey: "currencyZAR" },
  { code: "LKR", nameKey: "currencyLKR" },
];

interface Props {
  visible: boolean;
  selected: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}

export default function CurrencyPickerSheet({
  visible,
  selected,
  onSelect,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const { t } = useLanguage();

  const bg = useThemeColor({}, "card");
  const text = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");
  const tint = useThemeColor({}, "tint");
  const border = useThemeColor({}, "border");

  const insets = useSafeAreaInsets();

  const filtered = query.trim()
    ? COMMON_CURRENCIES.filter(
        (c) =>
          c.code.toLowerCase().includes(query.toLowerCase()) ||
          t(c.nameKey).toLowerCase().includes(query.toLowerCase()),
      )
    : COMMON_CURRENCIES;

  function handleSelect(code: string) {
    onSelect(code);
    setQuery("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: bg, paddingBottom: 24 + insets.bottom },
          ]}
        >
          <Text style={[styles.title, { color: text }]}>
            {t("selectCurrency")}
          </Text>
          <TextInput
            style={[
              styles.search,
              { borderColor: border, color: text, backgroundColor: bg },
            ]}
            placeholder={t("searchCurrencies")}
            placeholderTextColor={muted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = item.code === selected;
              return (
                <Pressable
                  style={[
                    styles.row,
                    isSelected && { backgroundColor: tint + "22" },
                  ]}
                  onPress={() => handleSelect(item.code)}
                >
                  <Text
                    style={[styles.code, { color: isSelected ? tint : text }]}
                  >
                    {item.code}
                  </Text>
                  <Text style={[styles.name, { color: muted }]}>
                    {t(item.nameKey)}
                  </Text>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: muted }]}>
                {t("noCurrenciesFound")}
              </Text>
            }
          />
          <Pressable
            style={[styles.cancelBtn, { borderColor: border }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: muted }]}>
              {t("cancel")}
            </Text>
          </Pressable>
        </Pressable>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "75%",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
  },
  search: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  list: { flexGrow: 0 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  code: { fontSize: 16, fontWeight: "700", width: 56 },
  name: { fontSize: 15, flex: 1 },
  empty: { textAlign: "center", paddingVertical: 20 },
  cancelBtn: {
    marginTop: 12,
    borderTopWidth: 1,
    paddingTop: 14,
    alignItems: "center",
  },
  cancelText: { fontSize: 16 },
});
