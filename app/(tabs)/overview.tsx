import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor, cardShadow } from '@/components/Themed';
import { useZakah } from '@/context/ZakahContext';
import { useLanguage } from '@/context/LanguageContext';
import { convertToBase, goldValue, silverValue, ZAKAH_RATE } from '@/utils/zakahCalculations';
import { formatCurrency, formatWeight, formatPurity } from '@/utils/formatting';
import SectionSeparator from '@/components/shared/SectionSeparator';
import { G } from '@/constants/Gradients';

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
  iconName,
  iconGradient,
}: {
  label: string;
  sub?: string;
  right: string;
  rightSub?: string;
  zakahRight?: string;
  isTotal?: boolean;
  iconName?: React.ComponentProps<typeof Feather>['name'];
  iconGradient?: [string, string];
}) {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const card = useThemeColor({}, 'card');

  const labelColor = isTotal ? '#fff' : text;
  const valueColor = isTotal ? '#fff' : text;
  const subColor = isTotal ? 'rgba(255,255,255,0.6)' : muted;
  const zakahColor = '#F59E0B';

  const rowContent = (
    <>
      {/* Icon */}
      {isTotal ? (
        <LinearGradient
          colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.iconWrap, { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 }]}>
          <Feather name={iconName || 'credit-card'} size={16} color="#fff" />
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={iconGradient || G.teal}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.iconWrap, { shadowColor: (iconGradient || G.teal)[0], shadowOpacity: 0.4, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 5 }]}>
          <Feather name={iconName || 'credit-card'} size={16} color="#fff" />
        </LinearGradient>
      )}
      {/* Left: label + subs */}
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, { color: labelColor, textAlign: isRTL ? 'right' : 'left' }, isTotal && styles.bold]}>
          {label}
        </Text>
        {sub ? <Text style={[styles.rowSub, { color: subColor, textAlign: isRTL ? 'right' : 'left' }]}>{sub}</Text> : null}
        {zakahRight ? <Text style={[styles.zakahText, { color: zakahColor, textAlign: isRTL ? 'right' : 'left' }]}>{zakahRight}</Text> : null}
      </View>
      {/* Right: value */}
      <View style={styles.rowRight}>
        <Text style={[isTotal ? styles.rowValueTotal : styles.rowValue, { color: valueColor, textAlign: isRTL ? 'left' : 'right' }, isTotal && styles.bold]}>
          {right}
        </Text>
        {rightSub ? <Text style={[styles.rowSubRight, { color: subColor, textAlign: isRTL ? 'left' : 'right' }]}>{rightSub}</Text> : null}
      </View>
    </>
  );

  if (isTotal) {
    return (
      <LinearGradient
        colors={G.tealDark}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.row}>
        {rowContent}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.row, { backgroundColor: card }, cardShadow]}>
      {rowContent}
    </View>
  );
}

function ThemedEmptyCard({
  message,
  gradient,
  accent,
  textColor,
  iconName = 'star',
}: {
  message: string;
  gradient: [string, string];
  accent: string;
  textColor?: string;
  iconName?: React.ComponentProps<typeof Feather>['name'];
}) {
  return (
    <View style={[styles.themedEmptyCard, { backgroundColor: accent + '18', borderColor: accent + '30', borderWidth: 1 }]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.themedEmptyIcon, { shadowColor: gradient[0], shadowOpacity: 0.45, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 7 }]}>
        <Feather name={iconName} size={22} color="#fff" />
      </LinearGradient>
      <Text style={[styles.themedEmptyText, { color: textColor || accent }]}>{message}</Text>
    </View>
  );
}

export default function AssetsSummaryScreen() {
  const { state } = useZakah();
  const { t } = useLanguage();
  const { currencyHoldings, metalHoldings, priceSettings, exchangeRates } = state;
  const { baseCurrency, goldPricePerGram, silverPricePerGram, goldPurityPrices } = priceSettings;
  const bg = useThemeColor({}, 'background');

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
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>

          {/* Balances by currency */}
          <SectionTitle title={t('balancesByCurrency')} description={t('balancesByCurrencyDesc')} />
          {currencyGroups.length === 0 ? (
            <ThemedEmptyCard
              message={t('noBalancesAdded')}
              gradient={G.cyan}
              accent={G.cyan[0]}
              iconName="credit-card"
            />
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
                    iconName="credit-card"
                  />
                );
              })}
              <Row
                label={t('total')}
                right={formatCurrency(currenciesBaseTotal, baseCurrency)}
                zakahRight={`${t('zakahColon')} ${formatCurrency(currenciesBaseTotal * ZAKAH_RATE, baseCurrency)}`}
                iconName="trending-up"
                isTotal
              />
            </>
          )}

          <SectionSeparator />

          {/* Gold by purity */}
          <SectionTitle title={t('goldByPurity')} description={t('goldByPurityDesc')} />
          {goldGroups.length === 0 ? (
            <ThemedEmptyCard
              message={t('noGoldAdded')}
              gradient={G.gold}
              accent="#F59E0B"
            />
          ) : (
            <>
              {goldGroups.map(([purity, { weightGrams, valueBase }]) => (
                <Row
                  key={purity}
                  label={purity}
                  sub={formatWeight(weightGrams)}
                  zakahRight={`${t('zakahColon')} ${formatWeight(weightGrams * ZAKAH_RATE)}`}
                  right={formatCurrency(valueBase, baseCurrency)}
                  iconName="star"
                  iconGradient={G.gold}
                />
              ))}
              <Row
                label={t('total')}
                sub={`${formatWeight(goldPureWeightTotal)} ${t('eq24k')}`}
                zakahRight={`${t('zakahColon')} ${formatWeight(goldPureWeightTotal * ZAKAH_RATE)}`}
                right={formatCurrency(goldBaseTotal, baseCurrency)}
                iconName="trending-up"
                isTotal
              />
            </>
          )}

          <SectionSeparator />

          {/* Silver by purity */}
          <SectionTitle title={t('silverByPurity')} description={t('silverByPurityDesc')} />
          {silverGroups.length === 0 ? (
            <ThemedEmptyCard
              message={t('noSilverAdded')}
              gradient={G.silver}
              accent="#9CA3AF"
              textColor="#6B7280"
              iconName="disc"
            />
          ) : (
            <>
              {silverGroups.map(([purity, { weightGrams, valueBase }]) => (
                <Row
                  key={purity}
                  label={purity}
                  sub={formatWeight(weightGrams)}
                  right={formatCurrency(valueBase, baseCurrency)}
                  iconName="disc"
                  iconGradient={G.silver}
                />
              ))}
              <Row
                label={t('total')}
                sub={formatWeight(silverWeightTotal)}
                right={formatCurrency(silverBaseTotal, baseCurrency)}
                iconName="trending-up"
                isTotal
              />
            </>
          )}

          <SectionSeparator />

          {/* Grand total — teal gradient card */}
          <SectionTitle title={t('grandTotal')} description={t('grandTotalDesc')} />
          <LinearGradient
            colors={G.tealGrand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.grandTotalCard}>
            <View style={styles.grandTotalLeft}>
              <Text style={styles.grandTotalLabel}>{t('allAssetsIn', { currency: baseCurrency })}</Text>
              <Text style={styles.grandTotalSub}>{t('grandTotalDesc')}</Text>
            </View>
            <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal, baseCurrency)}</Text>
          </LinearGradient>

          <View style={styles.spacer} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  inner: {
    padding: 16,
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
  },
  spacer: { height: 90 },

  sectionTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', marginTop: 4, marginBottom: 2 },
  sectionDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 12 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLeft: { flex: 1 },
  rowRight: { alignItems: 'flex-end' },
  rowLabel: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  rowSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  zakahText: { fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 2 },
  rowValue: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  rowValueTotal: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  rowSubRight: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  bold: { fontFamily: 'Inter_700Bold' },

  // Themed empty states
  themedEmptyCard: {
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    marginBottom: 6,
  },
  themedEmptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  themedEmptyText: { fontSize: 15, fontFamily: 'Inter_500Medium', textAlign: 'center' },

  // Grand total gradient card
  grandTotalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 20,
    marginBottom: 6,
  },
  grandTotalLeft: { flex: 1, marginRight: 12 },
  grandTotalLabel: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  grandTotalSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  grandTotalValue: { color: '#fff', fontSize: 26, fontFamily: 'Inter_800ExtraBold' },

});
