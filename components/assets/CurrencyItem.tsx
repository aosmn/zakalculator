import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';
import { CurrencyHolding } from '@/types';
import { useZakah } from '@/context/ZakahContext';
import { convertToBase } from '@/utils/zakahCalculations';
import { formatCurrency } from '@/utils/formatting';

interface Props {
  holding: CurrencyHolding;
  onPress: () => void;
  onLongPress: () => void;
}

export default function CurrencyItem({ holding, onPress, onLongPress }: Props) {
  const { state } = useZakah();
  const { baseCurrency, } = state.priceSettings;
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');

  const baseValue = convertToBase(holding.amount, holding.currency, baseCurrency, state.exchangeRates);

  return (
    <Pressable
      style={[styles.row, { backgroundColor: card, borderColor: border }]}
      onPress={onPress}
      onLongPress={onLongPress}>
      <View style={styles.left}>
        <Text style={[styles.label, { color: text }]}>{holding.label} · {holding.currency}</Text>
        <Text style={[styles.sub, { color: muted }]}>
          {formatCurrency(holding.amount, holding.currency)}
        </Text>
      </View>
      <Text style={[styles.value, { color: text }]}>
        {holding.currency === baseCurrency
          ? formatCurrency(holding.amount, baseCurrency)
          : formatCurrency(baseValue, baseCurrency)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  left: { flex: 1, marginRight: 8 },
  label: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 2 },
  value: { fontSize: 16, fontWeight: '700' },
});
