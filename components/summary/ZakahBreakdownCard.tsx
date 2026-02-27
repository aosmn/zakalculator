import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useThemeColor, cardShadow } from '@/components/Themed';
import { useZakah } from '@/context/ZakahContext';
import { useLanguage } from '@/context/LanguageContext';
import { ZAKAH_RATE } from '@/utils/zakahCalculations';
import { formatCurrency, formatWeight } from '@/utils/formatting';

function StatCard({
  label,
  value,
  sub,
  subColor,
  iconName,
  gradient,
  topStrip = true,
  tintedBg = false,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  iconName: React.ComponentProps<typeof Feather>['name'];
  gradient: [string, string];
  topStrip?: boolean;
  tintedBg?: boolean;
}) {
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');

  const bgColor = tintedBg ? gradient[1] + '18' : card;

  return (
    <View style={[styles.statOuter, cardShadow]}>
      <View style={[styles.statInner, { backgroundColor: bgColor }]}>
        {topStrip && (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topStrip}
          />
        )}
        <View style={styles.statContent}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconWrap}>
            <Feather name={iconName} size={18} color="#fff" />
          </LinearGradient>
          <Text style={[styles.statLabel, { color: muted }]}>{label}</Text>
          <Text style={[styles.statValue, { color: text }]}>{value}</Text>
          {sub ? <Text style={[styles.statSub, { color: subColor ?? muted }]}>{sub}</Text> : null}
        </View>
      </View>
    </View>
  );
}

export default function ZakahBreakdownCard() {
  const { calculation, state } = useZakah();
  const { t } = useLanguage();
  const { breakdown, totalWealthBaseCurrency } = calculation;
  const { baseCurrency } = state.priceSettings;
  const text = useThemeColor({}, 'text');

  const goldPureGrams = state.metalHoldings
    .filter((h) => h.type === 'gold')
    .reduce((sum, h) => {
      const purityFraction = h.purityUnit === 'karats' ? h.purity / 24 : h.purity / 100;
      return sum + h.weightGrams * purityFraction;
    }, 0);

  const silverWeightTotal = state.metalHoldings
    .filter((h) => h.type === 'silver')
    .reduce((sum, h) => sum + h.weightGrams, 0);

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { color: text }]}>{t('wealthBreakdown')}</Text>

      {/* Row 1: Currencies | Gold */}
      <View style={styles.row}>
        <StatCard
          label={t('currencies')}
          value={formatCurrency(breakdown.currenciesTotal, baseCurrency)}
          sub={t('cashAndAccounts')}
          iconName="credit-card"
          gradient={['#4F46E5', '#6366F1']}
        />
        <StatCard
          label={t('gold')}
          value={formatCurrency(breakdown.goldTotal, baseCurrency)}
          sub={goldPureGrams > 0 ? `${formatWeight(goldPureGrams)} ${t('eq24k')}` : undefined}
          iconName="star"
          gradient={['#FBBF24', '#F59E0B']}
        />
      </View>

      {/* Row 2: Silver | Total Wealth */}
      <View style={styles.row}>
        <StatCard
          label={t('silver')}
          value={formatCurrency(breakdown.silverTotal, baseCurrency)}
          sub={silverWeightTotal > 0 ? formatWeight(silverWeightTotal) : undefined}
          iconName="disc"
          gradient={['#D1D5DB', '#9CA3AF']}
        />
        <StatCard
          label={t('totalWealth')}
          value={formatCurrency(totalWealthBaseCurrency, baseCurrency)}
          sub={t('grandTotalDesc')}
          subColor={'#0D9488'}
          iconName="trending-up"
          gradient={['#0D9488', '#0F766E']}
          topStrip={false}
          tintedBg
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginBottom: 14 },
  title: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 14 },

  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },

  // Outer View carries the shadow (can't use overflow:hidden here)
  statOuter: { flex: 1, borderRadius: 16 },
  // Inner View clips the top strip to the border radius
  statInner: { borderRadius: 16, overflow: 'hidden' },

  topStrip: { height: 4 },

  statContent: { padding: 16, paddingTop: 14 },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  statValue: { fontSize: 20, fontFamily: 'Inter_800ExtraBold' },
  statSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 },
});
