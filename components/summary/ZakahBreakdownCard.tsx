import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';
import { useZakah } from '@/context/ZakahContext';
import { goldValue, ZAKAH_RATE } from '@/utils/zakahCalculations';
import { formatCurrency, formatWeight } from '@/utils/formatting';

export default function ZakahBreakdownCard() {
  const { calculation, state } = useZakah();
  const { breakdown, totalWealthBaseCurrency } = calculation;
  const { baseCurrency, goldPricePerGram, goldPurityPrices } = state.priceSettings;

  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const warning = useThemeColor({}, 'warning');

  // 24k-equivalent total gold weight
  const goldPureGrams = state.metalHoldings
    .filter((h) => h.type === 'gold')
    .reduce((sum, h) => {
      const purityFraction = h.purityUnit === 'karats' ? h.purity / 24 : h.purity / 100;
      return sum + h.weightGrams * purityFraction;
    }, 0);

  return (
    <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
      <Text style={[styles.title, { color: text }]}>Wealth Breakdown</Text>

      {/* Currencies row */}
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: muted }]}>Currencies</Text>
        <Text style={[styles.rowValue, { color: text }]}>
          {formatCurrency(breakdown.currenciesTotal, baseCurrency)}
        </Text>
      </View>

      {/* Gold row with 24k indicators */}
      <View style={[styles.row, styles.rowAlignTop]}>
        <Text style={[styles.rowLabel, { color: muted }]}>Gold</Text>
        <View style={styles.rowRight}>
          <Text style={[styles.rowValue, { color: text }]}>
            {formatCurrency(breakdown.goldTotal, baseCurrency)}
          </Text>
          <Text style={[styles.indicator, { color: muted }]}>{formatWeight(goldPureGrams)} (24k eq.)</Text>
          <Text style={[styles.indicator, { color: warning }]}>Zakah: {formatWeight(goldPureGrams * ZAKAH_RATE)}</Text>
        </View>
      </View>

      {/* Silver row */}
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: muted }]}>Silver</Text>
        <Text style={[styles.rowValue, { color: text }]}>
          {formatCurrency(breakdown.silverTotal, baseCurrency)}
        </Text>
      </View>

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
  rowAlignTop: { alignItems: 'flex-start' },
  rowRight: { alignItems: 'flex-end' },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 15, fontWeight: '600' },
  indicator: { fontSize: 12, marginTop: 2 },
  divider: { borderTopWidth: 1, marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '800' },
});
