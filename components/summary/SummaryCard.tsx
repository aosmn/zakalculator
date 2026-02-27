import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor, cardShadow } from '@/components/Themed';
import { useZakah } from '@/context/ZakahContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/utils/formatting';

export default function SummaryCard() {
  const { calculation, state } = useZakah();
  const { t } = useLanguage();
  const { zakahDueBaseCurrency, totalPaidBaseCurrency, remainingBaseCurrency } = calculation;
  const { baseCurrency } = state.priceSettings;

  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const success = useThemeColor({}, 'success');
  const danger = useThemeColor({}, 'danger');

  const remainingColor = remainingBaseCurrency > 0 ? danger : success;

  return (
    <View style={[styles.card, { backgroundColor: card }, cardShadow]}>
      <Text style={[styles.title, { color: text }]}>{t('zakahSummary')}</Text>

      {/* Hero: remaining */}
      <Text style={[styles.heroLabel, { color: muted }]}>{t('remaining')}</Text>
      <Text style={[styles.heroValue, { color: remainingColor }]}>
        {formatCurrency(remainingBaseCurrency, baseCurrency)}
      </Text>

      <View style={[styles.divider, { backgroundColor: border }]} />

      {/* Sub rows */}
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: muted }]}>{t('zakahDue')}</Text>
        <Text style={[styles.rowValue, { color: text }]}>
          {formatCurrency(zakahDueBaseCurrency, baseCurrency)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: muted }]}>{t('totalPaid')}</Text>
        <Text style={[styles.rowValue, { color: success }]}>
          {formatCurrency(totalPaidBaseCurrency, baseCurrency)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 20, marginBottom: 14 },
  title: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 14 },
  heroLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  heroValue: { fontSize: 36, fontFamily: 'Inter_800ExtraBold', marginBottom: 16 },
  divider: { height: 1, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rowLabel: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  rowValue: { fontSize: 16, fontFamily: 'Inter_700Bold' },
});
