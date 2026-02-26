import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';
import { CurrencyHolding } from '@/types';
import { useZakah } from '@/context/ZakahContext';
import { convertToBase } from '@/utils/zakahCalculations';
import { formatCurrency } from '@/utils/formatting';

interface Props {
  holding: CurrencyHolding;
  onPress: () => void;
  onDelete: () => void;
}

export default function CurrencyItem({ holding, onPress, onDelete }: Props) {
  const { state } = useZakah();
  const { baseCurrency } = state.priceSettings;
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');

  const baseValue = convertToBase(holding.amount, holding.currency, baseCurrency, state.exchangeRates);

  return (
    <Pressable
      style={[styles.row, { backgroundColor: card, borderColor: border }]}
      onPress={onPress}>
      <View style={styles.left}>
        <Text style={[styles.label, { color: text }]}>{holding.label} · {holding.currency}</Text>
        <Text style={[styles.sub, { color: muted }]}>
          {formatCurrency(holding.amount, holding.currency)}
        </Text>
      </View>
      <View style={styles.endGroup}>
        <Text style={[styles.value, { color: text }]}>
          {holding.currency === baseCurrency
            ? formatCurrency(holding.amount, baseCurrency)
            : formatCurrency(baseValue, baseCurrency)}
        </Text>
        <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
          <Feather name="trash-2" size={16} color={danger} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingStart: 14,
    borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  left: { flex: 1, marginEnd: 8 },
  label: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 2 },
  endGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  value: { fontSize: 16, fontWeight: '700' },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 4 },
});
