import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/components/Themed';
import GradientButton from '@/components/shared/GradientButton';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDeleteSheet from '@/components/shared/ConfirmDeleteSheet';
import CurrencyItem from '@/components/assets/CurrencyItem';
import AddCurrencyModal from '@/components/assets/AddCurrencyModal';
import GoldSilverItem from '@/components/assets/GoldSilverItem';
import AddMetalModal from '@/components/assets/AddMetalModal';
import { useZakah } from '@/context/ZakahContext';
import { useLanguage } from '@/context/LanguageContext';
import { CurrencyHolding, MetalHolding } from '@/types';
import { formatPurity } from '@/utils/formatting';
import SectionSeparator from '@/components/shared/SectionSeparator';
import PricesCallout from '@/components/shared/PricesCallout';
import GroupTotalRow from '@/components/shared/GroupTotalRow';
import { G } from '@/constants/Gradients';
import { convertToBase, goldValue, silverValue, ZAKAH_RATE } from '@/utils/zakahCalculations';
import { formatCurrency, formatWeight } from '@/utils/formatting';

type BalancesGroupMode = null | 'currency' | 'label';

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: text }]}>{title}</Text>
      {description ? <Text style={[styles.sectionDesc, { color: muted }]}>{description}</Text> : null}
    </View>
  );
}

function SectionHeaderWithToggle({
  title,
  description,
  toggled,
  onToggle,
  toggleLabel,
  toggleGradient = G.teal,
  toggleFlat = false,
}: {
  title: string;
  description?: string;
  toggled?: boolean;
  onToggle?: () => void;
  toggleLabel?: string;
  toggleGradient?: [string, string];
  toggleFlat?: boolean;
}) {
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: text }]}>{title}</Text>
        {toggleLabel && onToggle != null && (
          <Pressable
            style={[styles.togglePill, { borderColor: toggled ? toggleGradient[0] : border, backgroundColor: toggleFlat && toggled ? toggleGradient[0] : undefined }]}
            onPress={onToggle}>
            {!toggleFlat && toggled && (
              <LinearGradient colors={toggleGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
            )}
            <Text style={[styles.togglePillText, { color: toggled ? '#fff' : muted }]}>{toggleLabel}</Text>
          </Pressable>
        )}
      </View>
      {description ? <Text style={[styles.sectionDesc, { color: muted }]}>{description}</Text> : null}
    </View>
  );
}

function GroupHeader({ label }: { label: string }) {
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');
  return (
    <View style={styles.groupHeaderRow}>
      <Text style={[styles.groupHeaderText, { color: muted }]}>{label}</Text>
      <View style={[styles.groupHeaderLine, { backgroundColor: border }]} />
    </View>
  );
}

export default function AssetsScreen() {
  const { state, deleteCurrencyHolding, deleteMetalHolding } = useZakah();
  const { t, lang } = useLanguage();
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');

  // Modals
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<CurrencyHolding | undefined>();
  const [showMetalModal, setShowMetalModal] = useState(false);
  const [metalModalType, setMetalModalType] = useState<'gold' | 'silver'>('gold');
  const [editingMetal, setEditingMetal] = useState<MetalHolding | undefined>();

  // Delete confirmation
  const [deleteCurrency, setDeleteCurrency] = useState<CurrencyHolding | undefined>();
  const [deleteMetal, setDeleteMetal] = useState<MetalHolding | undefined>();

  // Intro card
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem('@intro_dismissed').then((val) => {
      if (val !== 'true') setShowIntro(true);
    });
  }, []);
  function dismissIntro() {
    setShowIntro(false);
    AsyncStorage.setItem('@intro_dismissed', 'true');
  }

  // Grouping
  const [balancesGroupMode, setBalancesGroupMode] = useState<BalancesGroupMode>('currency');
  const [showGroupTotals, setShowGroupTotals] = useState(true);

  function openAddGold() { setMetalModalType('gold'); setEditingMetal(undefined); setShowMetalModal(true); }
  function openAddSilver() { setMetalModalType('silver'); setEditingMetal(undefined); setShowMetalModal(true); }
  function openEditMetal(h: MetalHolding) { setEditingMetal(h); setMetalModalType(h.type); setShowMetalModal(true); }

  function toggleBalancesGroup(mode: 'currency' | 'label') {
    setBalancesGroupMode((prev) => (prev === mode ? null : mode));
  }

  const sortedBalances = [...state.currencyHoldings].sort((a, b) => a.label.localeCompare(b.label));
  const sortedGold = state.metalHoldings.filter((h) => h.type === 'gold').sort((a, b) => a.label.localeCompare(b.label));
  const sortedSilver = state.metalHoldings.filter((h) => h.type === 'silver').sort((a, b) => a.label.localeCompare(b.label));

  function groupBy<T>(items: T[], key: (item: T) => string): { groupKey: string; items: T[] }[] {
    const map = new Map<string, T[]>();
    for (const item of items) {
      const k = key(item);
      const arr = map.get(k) ?? [];
      arr.push(item);
      map.set(k, arr);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([groupKey, items]) => ({ groupKey, items }));
  }

  function renderCurrencyItem(h: CurrencyHolding) {
    return (
      <CurrencyItem
        key={h.id}
        holding={h}
        onPress={() => { setEditingCurrency(h); setShowCurrencyModal(true); }}
        onDelete={() => setDeleteCurrency(h)}
      />
    );
  }

  function renderMetalItem(h: MetalHolding) {
    return (
      <GoldSilverItem
        key={h.id}
        holding={h}
        onPress={() => openEditMetal(h)}
        onDelete={() => setDeleteMetal(h)}
      />
    );
  }

  const { baseCurrency, goldPricePerGram, silverPricePerGram, goldPurityPrices } = state.priceSettings;
  const { exchangeRates } = state;

  const currenciesTotalBase = sortedBalances.reduce(
    (s, h) => s + convertToBase(h.amount, h.currency, baseCurrency, exchangeRates), 0
  );
  const goldTotalValue = sortedGold.reduce(
    (s, h) => s + goldValue(h, goldPricePerGram, goldPurityPrices?.[String(h.purity)]), 0
  );
  const goldTotalWeight = sortedGold.reduce((s, h) => s + h.weightGrams, 0);
  const goldPureTotalWeight = sortedGold.reduce((s, h) => {
    const purityFraction = h.purityUnit === 'karats' ? h.purity / 24 : h.purity / 100;
    return s + h.weightGrams * purityFraction;
  }, 0);
  const silverTotalValue = sortedSilver.reduce(
    (s, h) => s + silverValue(h, silverPricePerGram), 0
  );
  const silverTotalWeight = sortedSilver.reduce((s, h) => s + h.weightGrams, 0);
  const silverPureTotalWeight = sortedSilver.reduce((s, h) => {
    const purityFraction = h.purityUnit === 'karats' ? h.purity / 24 : h.purity / 100;
    return s + h.weightGrams * purityFraction;
  }, 0);

  function renderBalances() {
    if (sortedBalances.length === 0) {
      return <EmptyState message={t('noBalances')} gradient={G.cyan} icon="credit-card" />;
    }
    if (balancesGroupMode === 'currency') {
      return groupBy(sortedBalances, (h) => h.currency).map(({ groupKey: currency, items }) => {
        const totalAmount = items.reduce((s, h) => s + h.amount, 0);
        const totalBase = items.reduce((s, h) => s + convertToBase(h.amount, h.currency, baseCurrency, exchangeRates), 0);
        return (
          <View key={currency}>
            <GroupHeader label={currency} />
            {items.map(renderCurrencyItem)}
            {showGroupTotals && (
              <GroupTotalRow
                label={`${currency} · ${t('total')}`}
                value={formatCurrency(totalAmount, currency)}
                rightSub={currency !== baseCurrency ? `= ${formatCurrency(totalBase, baseCurrency)}` : undefined}
                zakah={`${t('zakahColon')} ${formatCurrency(totalAmount * ZAKAH_RATE, currency)}`}
              />
            )}
          </View>
        );
      });
    }
    if (balancesGroupMode === 'label') {
      return groupBy(sortedBalances, (h) => h.label).map(({ groupKey: label, items }) => {
        const totalBase = items.reduce((s, h) => s + convertToBase(h.amount, h.currency, baseCurrency, exchangeRates), 0);
        return (
          <View key={label}>
            <GroupHeader label={label} />
            {items.map(renderCurrencyItem)}
            {showGroupTotals && (
              <GroupTotalRow
                label={`${label} · ${t('total')}`}
                value={formatCurrency(totalBase, baseCurrency)}
                zakah={`${t('zakahColon')} ${formatCurrency(totalBase * ZAKAH_RATE, baseCurrency)}`}
              />
            )}
          </View>
        );
      });
    }
    return sortedBalances.map(renderCurrencyItem);
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>

          {/* Intro card */}
          {showIntro && (
            <View style={[styles.introCard, { backgroundColor: tint + '18', borderColor: tint + '30', borderWidth: 1 }]}>
              <LinearGradient
                colors={G.teal}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.introIconWrap}>
                <Feather name="star" size={18} color="#fff" />
              </LinearGradient>
              <View style={styles.introContent}>
                <Text style={[styles.introTitle, { color: text }]}>{t('appIntroTitle')}</Text>
                <Text style={[styles.introDesc, { color: muted }]}>{t('appIntroDesc')}</Text>
              </View>
              <Pressable onPress={dismissIntro} style={styles.introClose} hitSlop={8}>
                <Feather name="x" size={16} color={muted} />
              </Pressable>
            </View>
          )}

          <PricesCallout />

          {/* Balances section header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: text }]}>{t('balances')}</Text>
              <View style={styles.sectionRight}>
                <View style={[styles.segControl, { borderColor: tint }]}>
                  {(['currency', 'label'] as const).map((mode) => {
                    const active = balancesGroupMode === mode;
                    return (
                      <Pressable key={mode} style={styles.seg} onPress={() => toggleBalancesGroup(mode)}>
                        {active && (
                          <LinearGradient colors={G.teal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
                        )}
                        <Text style={[styles.segText, { color: active ? '#fff' : text }]}>
                          {mode === 'currency' ? t('groupByCurrency') : t('groupByLabel')}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {balancesGroupMode != null && (
                  <Pressable
                    style={[styles.togglePill, { borderColor: showGroupTotals ? G.amber[0] : border, backgroundColor: showGroupTotals ? G.amber[0] : undefined }]}
                    onPress={() => setShowGroupTotals((v) => !v)}>
                    <Text style={[styles.togglePillText, { color: showGroupTotals ? '#fff' : muted }]}>{t('totals')}</Text>
                  </Pressable>
                )}
              </View>
            </View>
            <Text style={[styles.sectionDesc, { color: muted }]}>{t('cashAndAccounts')}</Text>
          </View>
          <GradientButton
            label={t('addItem')}
            onPress={() => { setEditingCurrency(undefined); setShowCurrencyModal(true); }}
            colors={G.tealCyan}
            style={styles.addBtnFull}
            textStyle={styles.addBtnText}
          />

          {renderBalances()}
          {sortedBalances.length > 0 && (
            <GroupTotalRow
              label={t('total')}
              value={formatCurrency(currenciesTotalBase, baseCurrency)}
              zakah={`${t('zakahColon')} ${formatCurrency(currenciesTotalBase * ZAKAH_RATE, baseCurrency)}`}
              iconName="trending-up"
              gradient={G.tealGrand}
            />
          )}

          <SectionSeparator />

          {/* Gold */}
          <SectionHeader title={t('gold')} description={t('goldDesc')} />
          <GradientButton
            label={t('addItem')}
            onPress={openAddGold}
            colors={G.tealCyan}
            style={styles.addBtnFull}
            textStyle={styles.addBtnText}
          />
          {sortedGold.length === 0 ? (
            <EmptyState message={t('noGold')} gradient={G.gold} icon="star" />
          ) : (
            groupBy(sortedGold, (h) => formatPurity(h.purity, h.purityUnit)).map(({ groupKey, items }) => {
              const totalWeight = items.reduce((s, h) => s + h.weightGrams, 0);
              const totalValue = items.reduce((s, h) => s + goldValue(h, goldPricePerGram, goldPurityPrices?.[String(h.purity)]), 0);
              const pureWeight = items.reduce((s, h) => {
                const purityFraction = h.purityUnit === 'karats' ? h.purity / 24 : h.purity / 100;
                return s + h.weightGrams * purityFraction;
              }, 0);
              return (
                <View key={groupKey}>
                  <GroupHeader label={groupKey} />
                  {items.map(renderMetalItem)}
                  {showGroupTotals && (
                    <GroupTotalRow
                      label={`${groupKey} · ${t('total')}`}
                      sub={formatWeight(totalWeight, lang)}
                      value={formatCurrency(totalValue, baseCurrency)}
                      zakah={`${t('zakahColon')} ${formatWeight(totalWeight * ZAKAH_RATE, lang)}`}
                    />
                  )}
                </View>
              );
            })
          )}
          {sortedGold.length > 0 && (
            <GroupTotalRow
              label={t('total')}
              sub={`${formatWeight(goldPureTotalWeight, lang)} ${t('eq24k')}`}
              value={formatCurrency(goldTotalValue, baseCurrency)}
              zakah={`${t('zakahColon')} ${formatWeight(goldPureTotalWeight * ZAKAH_RATE, lang)} ${t('eq24k')}`}
              iconName="trending-up"
              gradient={G.tealGrand}
            />
          )}

          <SectionSeparator />

          {/* Silver */}
          <SectionHeader title={t('silver')} description={t('silverDesc')} />
          <GradientButton
            label={t('addItem')}
            onPress={openAddSilver}
            colors={G.tealCyan}
            style={styles.addBtnFull}
            textStyle={styles.addBtnText}
          />
          {sortedSilver.length === 0 ? (
            <EmptyState message={t('noSilver')} gradient={G.silverAlt} icon="disc" />
          ) : (
            groupBy(sortedSilver, (h) => formatPurity(h.purity, h.purityUnit)).map(({ groupKey, items }) => {
              const totalWeight = items.reduce((s, h) => s + h.weightGrams, 0);
              const totalValue = items.reduce((s, h) => s + silverValue(h, silverPricePerGram), 0);
              return (
                <View key={groupKey}>
                  <GroupHeader label={groupKey} />
                  {items.map(renderMetalItem)}
                  {showGroupTotals && (
                    <GroupTotalRow
                      label={`${groupKey} · ${t('total')}`}
                      sub={formatWeight(totalWeight, lang)}
                      value={formatCurrency(totalValue, baseCurrency)}
                    />
                  )}
                </View>
              );
            })
          )}
          {sortedSilver.length > 0 && (
            <GroupTotalRow
              label={t('total')}
              sub={formatWeight(silverPureTotalWeight, lang)}
              value={formatCurrency(silverTotalValue, baseCurrency)}
              zakah={`${t('zakahColon')} ${formatCurrency(silverTotalValue * ZAKAH_RATE, baseCurrency)}`}
              iconName="trending-up"
              gradient={G.tealGrand}
            />
          )}

          <View style={styles.spacer} />
        </View>
      </ScrollView>

      <AddCurrencyModal
        visible={showCurrencyModal}
        editing={editingCurrency}
        onClose={() => setShowCurrencyModal(false)}
      />
      <AddMetalModal
        visible={showMetalModal}
        defaultType={metalModalType}
        editing={editingMetal}
        onClose={() => setShowMetalModal(false)}
      />

      <ConfirmDeleteSheet
        visible={!!deleteCurrency}
        itemName={deleteCurrency?.label}
        onConfirm={() => { if (deleteCurrency) deleteCurrencyHolding(deleteCurrency.id); setDeleteCurrency(undefined); }}
        onCancel={() => setDeleteCurrency(undefined)}
      />
      <ConfirmDeleteSheet
        visible={!!deleteMetal}
        itemName={deleteMetal?.label}
        onConfirm={() => { if (deleteMetal) deleteMetalHolding(deleteMetal.id); setDeleteMetal(undefined); }}
        onCancel={() => setDeleteMetal(undefined)}
      />
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

  // Intro card
  introCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    gap: 14,
  },
  introIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  introContent: { flex: 1 },
  introTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  introDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  introClose: { padding: 4, alignSelf: 'flex-start' },

  // Section headers
  sectionHeader: {
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 2,
  },
  sectionTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', flexShrink: 1 },
  sectionDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2, marginBottom: 4 },
  togglePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, overflow: 'hidden' },
  togglePillText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  addBtnFull: {
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },

  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // Segmented control
  segControl: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
    padding: 3,
  },
  seg: { paddingVertical: 7, paddingHorizontal: 20, borderRadius: 20, overflow: 'hidden' },
  segText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },

  // Group header with line
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  groupHeaderText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  groupHeaderLine: { flex: 1, height: 1 },
});
