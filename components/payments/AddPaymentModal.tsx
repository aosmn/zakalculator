import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/components/Themed';
import FormInput from '@/components/shared/FormInput';
import CurrencyPickerSheet from '@/components/shared/CurrencyPickerSheet';
import { useZakah } from '@/context/ZakahContext';
import { convertToBase } from '@/utils/zakahCalculations';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function AddPaymentModal({ visible, onClose }: Props) {
  const { logPayment, state } = useZakah();
  const { baseCurrency } = state.priceSettings;

  const bg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(baseCurrency);
  const [note, setNote] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setAmount('');
      setCurrency(baseCurrency);
      setNote('');
    }
  }, [visible, baseCurrency]);

  function handleLog() {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    const amountBase = convertToBase(parsed, currency, baseCurrency, state.exchangeRates);
    logPayment({
      amountBaseCurrency: amountBase,
      currency,
      amountDisplayCurrency: parsed,
      note: note.trim(),
      paidAt: new Date().toISOString(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
            <Pressable style={[styles.sheet, { backgroundColor: bg }]}>
              <Text style={[styles.title, { color: text }]}>Log Zakah Payment</Text>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <FormInput
                  label="Amount"
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: muted }]}>CURRENCY</Text>
                  <Pressable
                    style={[styles.currencyBtn, { borderColor: border, backgroundColor: bg }]}
                    onPress={() => setShowPicker(true)}>
                    <Text style={[styles.currencyCode, { color: text }]}>{currency}</Text>
                    <Text style={[styles.chevron, { color: muted }]}>▾</Text>
                  </Pressable>
                </View>
                <FormInput
                  label="Note (optional)"
                  placeholder="e.g. Paid to charity X"
                  value={note}
                  onChangeText={setNote}
                />
              </ScrollView>
              <Pressable style={[styles.saveBtn, { backgroundColor: tint }]} onPress={handleLog}>
                <Text style={styles.saveBtnText}>Log Payment</Text>
              </Pressable>
              <Pressable onPress={onClose} style={styles.cancelBtn}>
                <Text style={[styles.cancelText, { color: muted }]}>Cancel</Text>
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
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  kav: { justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  fieldContainer: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  currencyBtn: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  currencyCode: { fontSize: 16, fontWeight: '600' },
  chevron: { fontSize: 16 },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontSize: 15 },
});
