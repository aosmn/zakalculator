import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';
import { useZakah } from '@/context/ZakahContext';
import { formatCurrency } from '@/utils/formatting';

export default function SummaryCard() {
  const { calculation, state } = useZakah();
  const { zakahDueBaseCurrency, totalPaidBaseCurrency, remainingBaseCurrency } = calculation;
  const { baseCurrency } = state.priceSettings;

  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const success = useThemeColor({}, 'success');
  const danger = useThemeColor({}, 'danger');
  const tint = useThemeColor({}, 'tint');

  const rows = [
    { label: 'Zakah Due', value: zakahDueBaseCurrency, color: text },
    { label: 'Total Paid', value: totalPaidBaseCurrency, color: success },
    { label: 'Remaining', value: remainingBaseCurrency, color: remainingBaseCurrency > 0 ? danger : success },
  ];

  return (
    <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
      <Text style={[styles.title, { color: text }]}>Zakah Summary</Text>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={[styles.rowLabel, { color: muted }]}>{row.label}</Text>
          <Text style={[styles.rowValue, { color: row.color }]}>
            {formatCurrency(row.value, baseCurrency)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 14 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 18, fontWeight: '800' },
});
