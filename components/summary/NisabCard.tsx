import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';
import { useZakah } from '@/context/ZakahContext';
import { formatCurrency } from '@/utils/formatting';
import { NISAB_GOLD_GRAMS } from '@/utils/zakahCalculations';

export default function NisabCard() {
  const { calculation, state } = useZakah();
  const { nisabValueBaseCurrency, isAboveNisab } = calculation;
  const { baseCurrency } = state.priceSettings;

  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const success = useThemeColor({}, 'success');
  const danger = useThemeColor({}, 'danger');

  const badgeBg = isAboveNisab ? success : danger;
  const badgeLabel = isAboveNisab ? 'Above Nisab' : 'Below Nisab';

  return (
    <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: text }]}>Nisab Threshold</Text>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      </View>
      <Text style={[styles.value, { color: text }]}>
        {formatCurrency(nisabValueBaseCurrency, baseCurrency)}
      </Text>
      <Text style={[styles.sub, { color: muted }]}>
        Based on {NISAB_GOLD_GRAMS}g of 24k gold
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  value: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  sub: { fontSize: 13 },
});
