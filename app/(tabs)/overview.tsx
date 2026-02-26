import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/components/Themed';
import { useZakah } from '@/context/ZakahContext';
import { useLanguage } from '@/context/LanguageContext';
import { convertToBase, goldValue, silverValue, ZAKAH_RATE } from '@/utils/zakahCalculations';
import { formatCurrency, formatWeight, formatPurity } from '@/utils/formatting';
import SectionSeparator from '@/components/shared/SectionSeparator';

function SectionTitle({ title, description }: { title: string; description?: string }) {
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  return (
    <>
      <Text style={[styles.sectionTitle, { color: text }]}>{title}</Text>
      {description ? <Text style={[styles.sectionDesc, { color: muted }]}>{description}</Text> : null}
    </>
  );
}

function Row({
  label,
  sub,
  right,
  rightSub,
  zakahRight,
  isTotal,
}: {
  label: string;
  sub?: string;
  right: string;
  rightSub?: string;
  zakahRight?: string;
  isTotal?: boolean;
}) {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const warning = useThemeColor({}, 'warning');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  return (
    <View style={[styles.row, { backgroundColor: card, borderColor: border }, isTotal && styles.totalRow]}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, { color: text, textAlign: isRTL ? 'right' : 'left' }, isTotal && styles.bold]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, { color: muted, textAlign: isRTL ? 'right' : 'left' }]}>{sub}</Text> : null}
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.rowValue, { color: text, textAlign: isRTL ? 'left' : 'right' }, isTotal && styles.bold]}>{right}</Text>
        {rightSub ? <Text style={[styles.rowSubRight, { color: muted, textAlign: isRTL ? 'left' : 'right' }]}>{rightSub}</Text> : null}
        {zakahRight ? <Text style={[styles.rowSubRight, { color: warning, textAlign: isRTL ? 'left' : 'right' }]}>{zakahRight}</Text> : null}
      </View>
    </View>
  );
}

function Divider() {
  const border = useThemeColor({}, 'border');
  return <View style={[styles.divider, { borderColor: border }]} />;
}

export default function AssetsSummaryScreen() {
  const { state } = useZakah();
  const { t } = useLanguage();
  const { currencyHoldings, metalHoldings, priceSettings, exchangeRates } = state;
  const { baseCurrency, goldPricePerGram, silverPricePerGram, goldPurityPrices } = priceSettings;
  const bg = useThemeColor({}, 'background');
  const muted = useThemeColor({}, 'muted');

  // ── Per-currency totals ──────────────────────────────────────────────────
  const currencyMap = new Map<string, number>();
  for (const h of currencyHoldings) {
    currencyMap.set(h.currency, (currencyMap.get(h.currency) ?? 0) + h.amount);
  }
  const currencyGroups = Array.from(currencyMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  const currenciesBaseTotal = currencyGroups.reduce(
    (sum, [currency, amount]) => sum + convertToBase(amount, currency, baseCurrency, exchangeRates), 0
  );

  // ── Per-purity gold totals ───────────────────────────────────────────────
  type MetalGroup = { weightGrams: number; pureWeightGrams: number; valueBase: number };
  const goldMap = new Map<string, MetalGroup>();
  for (const h of metalHoldings.filter((h) => h.type === 'gold')) {
    const key = formatPurity(h.purity, h.purityUnit);
    const customPrice = goldPurityPrices?.[String(h.purity)];
    const val = goldValue(h, goldPricePerGram, customPrice);
    const purityFraction = h.purityUnit === 'karats' ? h.purity / 24 : h.purity / 100;
    const prev = goldMap.get(key) ?? { weightGrams: 0, pureWeightGrams: 0, valueBase: 0 };
    goldMap.set(key, {
      weightGrams: prev.weightGrams + h.weightGrams,
      pureWeightGrams: prev.pureWeightGrams + h.weightGrams * purityFraction,
      valueBase: prev.valueBase + val,
    });
  }
  const goldGroups = Array.from(goldMap.entries()).sort(([a], [b]) => b.localeCompare(a));
  const goldBaseTotal = goldGroups.reduce((sum, [, g]) => sum + g.valueBase, 0);
  // Total weight in 24k-equivalent grams (sum of each group's pureWeightGrams)
  const goldPureWeightTotal = goldGroups.reduce((sum, [, g]) => sum + g.pureWeightGrams, 0);

  // ── Per-purity silver totals ─────────────────────────────────────────────
  const silverMap = new Map<string, MetalGroup>();
  for (const h of metalHoldings.filter((h) => h.type === 'silver')) {
    const key = formatPurity(h.purity, h.purityUnit);
    const val = silverValue(h, silverPricePerGram);
    const prev = silverMap.get(key) ?? { weightGrams: 0, pureWeightGrams: 0, valueBase: 0 };
    silverMap.set(key, { weightGrams: prev.weightGrams + h.weightGrams, pureWeightGrams: 0, valueBase: prev.valueBase + val });
  }
  const silverGroups = Array.from(silverMap.entries()).sort(([a], [b]) => b.localeCompare(a));
  const silverBaseTotal = silverGroups.reduce((sum, [, g]) => sum + g.valueBase, 0);
  const silverWeightTotal = silverGroups.reduce((sum, [, g]) => sum + g.weightGrams, 0);

  const grandTotal = currenciesBaseTotal + goldBaseTotal + silverBaseTotal;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Balances by currency */}
        <SectionTitle title={t('balancesByCurrency')} description={t('balancesByCurrencyDesc')} />
        {currencyGroups.length === 0 ? (
          <Text style={[styles.empty, { color: muted }]}>{t('noBalancesAdded')}</Text>
        ) : (
          <>
            {currencyGroups.map(([currency, amount]) => {
              const baseVal = convertToBase(amount, currency, baseCurrency, exchangeRates);
              return (
                <Row
                  key={currency}
                  label={currency}
                  right={formatCurrency(amount, currency)}
                  rightSub={currency !== baseCurrency ? `= ${formatCurrency(baseVal, baseCurrency)}` : undefined}
                  zakahRight={`${t('zakahColon')} ${formatCurrency(amount * ZAKAH_RATE, currency)}`}
                />
              );
            })}
            <Divider />
            <Row
              label={t('total')}
              right={formatCurrency(currenciesBaseTotal, baseCurrency)}
              zakahRight={`${t('zakahColon')} ${formatCurrency(currenciesBaseTotal * ZAKAH_RATE, baseCurrency)}`}
              isTotal
            />
          </>
        )}

        <SectionSeparator />

        {/* Gold by purity */}
        <SectionTitle title={t('goldByPurity')} description={t('goldByPurityDesc')} />
        {goldGroups.length === 0 ? (
          <Text style={[styles.empty, { color: muted }]}>{t('noGoldAdded')}</Text>
        ) : (
          <>
            {goldGroups.map(([purity, { weightGrams, valueBase }]) => (
              <Row
                key={purity}
                label={purity}
                sub={formatWeight(weightGrams)}
                zakahRight={`${t('zakahColon')} ${formatWeight(weightGrams * ZAKAH_RATE)}`}
                right={formatCurrency(valueBase, baseCurrency)}
              />
            ))}
            <Divider />
            <Row
              label={t('total')}
              sub={`${formatWeight(goldPureWeightTotal)} ${t('eq24k')}`}
              zakahRight={`${t('zakahColon')} ${formatWeight(goldPureWeightTotal * ZAKAH_RATE)}`}
              right={formatCurrency(goldBaseTotal, baseCurrency)}
              isTotal
            />
          </>
        )}

        <SectionSeparator />

        {/* Silver by purity */}
        <SectionTitle title={t('silverByPurity')} description={t('silverByPurityDesc')} />
        {silverGroups.length === 0 ? (
          <Text style={[styles.empty, { color: muted }]}>{t('noSilverAdded')}</Text>
        ) : (
          <>
            {silverGroups.map(([purity, { weightGrams, valueBase }]) => (
              <Row
                key={purity}
                label={purity}
                sub={formatWeight(weightGrams)}
                right={formatCurrency(valueBase, baseCurrency)}
              />
            ))}
            <Divider />
            <Row
              label={t('total')}
              sub={formatWeight(silverWeightTotal)}
              right={formatCurrency(silverBaseTotal, baseCurrency)}
              isTotal
            />
          </>
        )}

        <SectionSeparator />

        {/* Grand total */}
        <SectionTitle title={t('grandTotal')} description={t('grandTotalDesc')} />
        <Row
          label={t('allAssetsIn', { currency: baseCurrency })}
          right={formatCurrency(grandTotal, baseCurrency)}
          isTotal
        />

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16 },
  spacer: { height: 40 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 4, marginBottom: 2 },
  sectionDesc: { fontSize: 12, marginBottom: 10 },
  row: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 6,
  },
  totalRow: { marginTop: 2 },
  rowLeft: { flex: 1, marginEnd: 8 },
  rowRight: { alignItems: 'flex-end' },
  rowLabel: { fontSize: 15 },
  rowSub: { fontSize: 12, marginTop: 2 },
  rowValue: { fontSize: 15 },
  rowSubRight: { fontSize: 12, marginTop: 2 },
  bold: { fontWeight: '700' },
  divider: { borderTopWidth: 1, marginVertical: 4 },
  empty: { fontSize: 14, marginBottom: 8 },
});
