import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';
import { useZakah } from '@/context/ZakahContext';
import { formatCurrency } from '@/utils/formatting';

export default function ZakahBreakdownCard() {
  const { calculation, state } = useZakah();
  const { breakdown, totalWealthBaseCurrency } = calculation;
  const { baseCurrency } = state.priceSettings;

  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');

  const rows = [
    { label: 'Currencies', value: breakdown.currenciesTotal },
    { label: 'Gold', value: breakdown.goldTotal },
    { label: 'Silver', value: breakdown.silverTotal },
  ];

  return (
    <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
      <Text style={[styles.title, { color: text }]}>Wealth Breakdown</Text>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={[styles.rowLabel, { color: muted }]}>{row.label}</Text>
          <Text style={[styles.rowValue, { color: text }]}>
            {formatCurrency(row.value, baseCurrency)}
          </Text>
        </View>
      ))}
      <View style={[styles.divider, { borderColor: border }]} />
      <View style={styles.row}>
        <Text style={[styles.totalLabel, { color: text }]}>Total Wealth</Text>
        <Text style={[styles.totalValue, { color: text }]}>
          {formatCurrency(totalWealthBaseCurrency, baseCurrency)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 14 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 15, fontWeight: '600' },
  divider: { borderTopWidth: 1, marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '800' },
});
