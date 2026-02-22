import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useThemeColor } from '@/components/Themed';

export const COMMON_CURRENCIES: { code: string; name: string }[] = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'QAR', name: 'Qatari Riyal' },
  { code: 'BHD', name: 'Bahraini Dinar' },
  { code: 'OMR', name: 'Omani Rial' },
  { code: 'JOD', name: 'Jordanian Dinar' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'PKR', name: 'Pakistani Rupee' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BDT', name: 'Bangladeshi Taka' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'LKR', name: 'Sri Lankan Rupee' },
];

interface Props {
  visible: boolean;
  selected: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}

export default function CurrencyPickerSheet({ visible, selected, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');

  const bg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');

  const filtered = query.trim()
    ? COMMON_CURRENCIES.filter(
        (c) =>
          c.code.toLowerCase().includes(query.toLowerCase()) ||
          c.name.toLowerCase().includes(query.toLowerCase())
      )
    : COMMON_CURRENCIES;

  function handleSelect(code: string) {
    onSelect(code);
    setQuery('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: bg }]}>
          <Text style={[styles.title, { color: text }]}>Select Currency</Text>
          <TextInput
            style={[styles.search, { borderColor: border, color: text, backgroundColor: bg }]}
            placeholder="Search..."
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
                  style={[styles.row, isSelected && { backgroundColor: tint + '22' }]}
                  onPress={() => handleSelect(item.code)}>
                  <Text style={[styles.code, { color: isSelected ? tint : text }]}>{item.code}</Text>
                  <Text style={[styles.name, { color: muted }]}>{item.name}</Text>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: muted }]}>No currencies found.</Text>
            }
          />
          <Pressable style={[styles.cancelBtn, { borderColor: border }]} onPress={onClose}>
            <Text style={[styles.cancelText, { color: muted }]}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40, maxHeight: '75%' },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 14 },
  search: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, marginBottom: 10 },
  list: { flexGrow: 0 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderRadius: 8 },
  code: { fontSize: 16, fontWeight: '700', width: 56 },
  name: { fontSize: 15, flex: 1 },
  empty: { textAlign: 'center', paddingVertical: 20 },
  cancelBtn: { marginTop: 12, borderTopWidth: 1, paddingTop: 14, alignItems: 'center' },
  cancelText: { fontSize: 16 },
});
