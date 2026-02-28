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
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/components/Themed';
import GradientButton from '@/components/shared/GradientButton';
import FormInput from '@/components/shared/FormInput';
import CurrencyPickerSheet from '@/components/shared/CurrencyPickerSheet';
import { useZakah } from '@/context/ZakahContext';
import { useLanguage } from '@/context/LanguageContext';
import { ZakahPayment } from '@/types';
import { convertToBase } from '@/utils/zakahCalculations';
import { formatDate } from '@/utils/formatting';

interface Props {
  visible: boolean;
  editing?: ZakahPayment;
  onClose: () => void;
}

export default function AddPaymentModal({ visible, editing, onClose }: Props) {
  const { logPayment, updatePayment, deletePayment, state } = useZakah();
  const { baseCurrency } = state.priceSettings;

  const { t } = useLanguage();
  const bg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(baseCurrency);
  const [note, setNote] = useState('');
  const [paidAt, setPaidAt] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (visible) {
      setConfirmDelete(false);
      setShowDatePicker(false);
      if (editing) {
        setAmount(String(editing.amountDisplayCurrency));
        setCurrency(editing.currency);
        setNote(editing.note ?? '');
        setPaidAt(new Date(editing.paidAt));
      } else {
        setAmount('');
        setCurrency(baseCurrency);
        setNote('');
        setPaidAt(new Date());
      }
    }
  }, [visible, editing, baseCurrency]);

  function handleSave() {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    const amountBase = convertToBase(parsed, currency, baseCurrency, state.exchangeRates);
    const data = {
      amountBaseCurrency: amountBase,
      currency,
      amountDisplayCurrency: parsed,
      note: note.trim(),
      paidAt: paidAt.toISOString(),
    };
    if (editing) {
      updatePayment(editing.id, data);
    } else {
      logPayment(data);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  }

  // Format date as YYYY-MM-DD for the web <input type="date">
  function toInputDateValue(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function renderDateField() {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { color: muted }]}>{t('date')}</Text>
          {/* @ts-ignore — web-only input */}
          <input
            type="date"
            value={toInputDateValue(paidAt)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const d = new Date(e.target.value + 'T12:00:00');
              if (!isNaN(d.getTime())) setPaidAt(d);
            }}
            style={{
              border: `1px solid ${border}`,
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 16,
              background: bg,
              color: text,
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </View>
      );
    }

    return (
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: muted }]}>{t('date')}</Text>
        <Pressable
          style={[styles.currencyBtn, { borderColor: border, backgroundColor: bg }]}
          onPress={() => setShowDatePicker((v) => !v)}>
          <Text style={[styles.currencyCode, { color: text }]}>{formatDate(paidAt.toISOString())}</Text>
          <Text style={[styles.chevron, { color: muted }]}>▾</Text>
        </Pressable>
        {showDatePicker && (
          <>
            <DateTimePicker
              value={paidAt}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(_, date) => {
                if (Platform.OS === 'android') setShowDatePicker(false);
                if (date) setPaidAt(date);
              }}
            />
            {Platform.OS === 'ios' && (
              <Pressable onPress={() => setShowDatePicker(false)} style={styles.dateDoneBtn}>
                <Text style={[styles.dateDoneText, { color: tint }]}>{t('done')}</Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    );
  }

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <KeyboardAvoidingView behavior="padding" style={styles.kav}>
            <Pressable style={[styles.sheet, { backgroundColor: bg }]}>
              <Text style={[styles.title, { color: text }]}>{editing ? t('editPayment') : t('logZakahPayment')}</Text>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <FormInput
                  label={t('amount')}
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                <View style={styles.fieldContainer}>
                  <Text style={[styles.fieldLabel, { color: muted }]}>{t('currency')}</Text>
                  <Pressable
                    style={[styles.currencyBtn, { borderColor: border, backgroundColor: bg }]}
                    onPress={() => setShowPicker(true)}>
                    <Text style={[styles.currencyCode, { color: text }]}>{currency}</Text>
                    <Text style={[styles.chevron, { color: muted }]}>▾</Text>
                  </Pressable>
                </View>
                <FormInput
                  label={t('noteOptional')}
                  placeholder="e.g. Paid to charity X"
                  value={note}
                  onChangeText={setNote}
                />
                {renderDateField()}
              </ScrollView>
              {confirmDelete ? (
                <View style={styles.confirmRow}>
                  <Text style={[styles.confirmText, { color: text }]}>{t('deleteThisPayment')}</Text>
                  <View style={styles.confirmBtns}>
                    <Pressable
                      style={[styles.confirmBtn, { borderColor: border }]}
                      onPress={() => setConfirmDelete(false)}>
                      <Text style={[styles.confirmBtnText, { color: muted }]}>{t('cancel')}</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.confirmBtn, styles.confirmBtnDanger, { borderColor: danger }]}
                      onPress={() => { deletePayment(editing!.id); onClose(); }}>
                      <Text style={[styles.confirmBtnText, { color: danger }]}>{t('delete')}</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  <GradientButton
                    label={editing ? t('saveChanges') : t('logPaymentBtn')}
                    onPress={handleSave}
                    style={styles.saveBtn}
                  />
                  {editing ? (
                    <Pressable onPress={() => setConfirmDelete(true)} style={styles.cancelBtn}>
                      <Text style={[styles.cancelText, { color: danger }]}>{t('deletePayment')}</Text>
                    </Pressable>
                  ) : (
                    <Pressable onPress={onClose} style={styles.cancelBtn}>
                      <Text style={[styles.cancelText, { color: muted }]}>{t('cancel')}</Text>
                    </Pressable>
                  )}
                </>
              )}
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  kav: { flex: 1, justifyContent: 'flex-end' },
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
  dateDoneBtn: { alignItems: 'flex-end', paddingTop: 6, paddingRight: 4 },
  dateDoneText: { fontSize: 15, fontWeight: '600' },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontSize: 15 },
  confirmRow: { marginTop: 8 },
  confirmText: { fontSize: 15, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  confirmBtns: { flexDirection: 'row', gap: 10 },
  confirmBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  confirmBtnDanger: {},
  confirmBtnText: { fontSize: 15, fontWeight: '600' },
});
