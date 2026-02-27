import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor, cardShadow } from '@/components/Themed';
import { useZakah } from '@/context/ZakahContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/utils/formatting';
import { NISAB_GOLD_GRAMS } from '@/utils/zakahCalculations';

export default function NisabCard() {
  const { calculation, state } = useZakah();
  const { t } = useLanguage();
  const { nisabValueBaseCurrency, isAboveNisab } = calculation;
  const { baseCurrency } = state.priceSettings;

  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const success = useThemeColor({}, 'success');
  const danger = useThemeColor({}, 'danger');

  const badgeBg = isAboveNisab ? success : danger;
  const badgeLabel = isAboveNisab ? t('aboveNisab') : t('belowNisab');

  return (
    <View style={[styles.card, { backgroundColor: card }, cardShadow]}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: muted }]}>{t('nisabThreshold')}</Text>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      </View>
      <Text style={[styles.value, { color: text }]}>
        {formatCurrency(nisabValueBaseCurrency, baseCurrency)}
      </Text>
      <Text style={[styles.sub, { color: muted }]}>
        {t('nisabBasedOn', { grams: NISAB_GOLD_GRAMS })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 20, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100 },
  badgeText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  value: { fontSize: 36, fontFamily: 'Inter_800ExtraBold', marginBottom: 4 },
  sub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
});
