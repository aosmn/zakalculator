import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor, cardShadow } from '@/components/Themed';
import GradientButton from '@/components/shared/GradientButton';
import ConfirmDeleteSheet from '@/components/shared/ConfirmDeleteSheet';
import CurrencyItem from '@/components/assets/CurrencyItem';
import AddCurrencyModal from '@/components/assets/AddCurrencyModal';
import GoldSilverItem from '@/components/assets/GoldSilverItem';
import AddMetalModal from '@/components/assets/AddMetalModal';
import { useZakah } from '@/context/ZakahContext';
import { useLanguage } from '@/context/LanguageContext';
import { CurrencyHolding, MetalHolding } from '@/types';
import { formatPurity } from '@/utils/formatting';
import PricesCallout from '@/components/shared/PricesCallout';
import GroupTotalRow from '@/components/shared/GroupTotalRow';
import { G } from '@/constants/Gradients';
import { convertToBase, goldValue, silverValue, ZAKAH_RATE } from '@/utils/zakahCalculations';
import { formatCurrency, formatWeight } from '@/utils/formatting';

type BalancesGroupMode = null | 'currency' | 'label';
type AssetTab = 'balances' | 'gold' | 'silver';

function ToggleSwitch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const thumbPos = useRef(new Animated.Value(value ? 24 : 3)).current;
  const trackColor = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(thumbPos, {
      toValue: value ? 24 : 3,
      useNativeDriver: false,
      bounciness: 4,
      speed: 20,
    }).start();
    Animated.timing(trackColor, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const bg = trackColor.interpolate({
    inputRange: [0, 1],
    outputRange: [G.silver[0], G.tealDark[0]],
  });

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View style={[styles.toggleTrack, { backgroundColor: bg }]}>
        <Animated.View style={[styles.toggleThumb, { left: thumbPos }]} />
      </Animated.View>
    </Pressable>
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

function SectionEmptyCard({
  gradient,
  icon,
  title,
  description,
  btnLabel,
  onPress,
}: {
  gradient: [string, string];
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
  btnLabel: string;
  onPress: () => void;
}) {
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  return (
    <View style={[styles.emptyCard, { backgroundColor: card }, cardShadow]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.emptyIconWrap, {
          shadowColor: gradient[0],
          shadowOpacity: 0.35,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }]}>
        <Feather name={icon} size={40} color="#fff" />
      </LinearGradient>
      <Text style={[styles.emptyTitle, { color: text }]}>{title}</Text>
      <Text style={[styles.emptyDesc, { color: muted }]}>{description}</Text>
      <GradientButton
        label={btnLabel}
        onPress={onPress}
        colors={gradient}
        style={styles.emptyBtn}
        textStyle={styles.emptyBtnText}
      />
    </View>
  );
}

export default function AssetsScreen() {
  const { state, deleteCurrencyHolding, deleteMetalHolding } = useZakah();
  const { t, lang } = useLanguage();
  const bg = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
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

  // Tabs & grouping
  const [activeTab, setActiveTab] = useState<AssetTab>('balances');
  const [balancesGroupMode, setBalancesGroupMode] = useState<BalancesGroupMode>('currency');
  const [showTotals, setShowTotals] = useState<Record<AssetTab, boolean>>({
    balances: true,
    gold: true,
    silver: true,
  });

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
  const goldPureTotalWeight = sortedGold.reduce((s, h) => {
    const purityFraction = h.purityUnit === 'karats' ? h.purity / 24 : h.purity / 100;
    return s + h.weightGrams * purityFraction;
  }, 0);
  const silverTotalValue = sortedSilver.reduce(
    (s, h) => s + silverValue(h, silverPricePerGram), 0
  );
  const silverPureTotalWeight = sortedSilver.reduce((s, h) => {
    const purityFraction = h.purityUnit === 'karats' ? h.purity / 24 : h.purity / 100;
    return s + h.weightGrams * purityFraction;
  }, 0);

  function renderBalancesItems() {
    if (balancesGroupMode === 'currency') {
      return groupBy(sortedBalances, (h) => h.currency).map(({ groupKey: currency, items }) => {
        const totalAmount = items.reduce((s, h) => s + h.amount, 0);
        const totalBase = items.reduce((s, h) => s + convertToBase(h.amount, h.currency, baseCurrency, exchangeRates), 0);
        return (
          <View key={currency}>
            <GroupHeader label={currency} />
            {items.map(renderCurrencyItem)}
            {showTotals[activeTab] && (
              <GroupTotalRow
                label={`${currency} · ${t('total')}`}
                value={formatCurrency(totalAmount, currency)}
                rightSub={currency !== baseCurrency ? formatCurrency(totalBase, baseCurrency) : undefined}
                zakah={`${t('zakahColon')} ${formatCurrency(totalAmount * ZAKAH_RATE, currency)}`}
                gradient={G.subtotal}
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
            {showTotals[activeTab] && (
              <GroupTotalRow
                label={`${label} · ${t('total')}`}
                value={formatCurrency(totalBase, baseCurrency)}
                zakah={`${t('zakahColon')} ${formatCurrency(totalBase * ZAKAH_RATE, baseCurrency)}`}
                gradient={G.subtotal}
              />
            )}
          </View>
        );
      });
    }
    return sortedBalances.map(renderCurrencyItem);
  }

  function renderBalancesContent() {
    return (
      <>
        {sortedBalances.length > 0 && (
          <GradientButton
            label={t('addItem')}
            onPress={() => { setEditingCurrency(undefined); setShowCurrencyModal(true); }}
            colors={G.tealCyan}
            style={styles.addBtnFull}
            textStyle={styles.addBtnText}
          />
        )}

        {/* Grouping control */}
        <View style={styles.groupingRow}>
          <View style={[styles.segControl, { backgroundColor: border }]}>
            {(['currency', 'label'] as const).map((mode) => {
              const active = balancesGroupMode === mode;
              return (
                <Pressable
                  key={mode}
                  style={[styles.seg, active && styles.segActive]}
                  onPress={() => toggleBalancesGroup(mode)}>
                  <Text style={[styles.segText, { color: active ? tint : muted }]}>
                    {mode === 'currency' ? t('groupByCurrency') : t('groupByLabel')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {sortedBalances.length === 0 ? (
          <SectionEmptyCard
            gradient={G.tealCyan}
            icon="credit-card"
            title={t('emptyBalancesTitle')}
            description={t('emptyBalancesDesc')}
            btnLabel={t('addBalanceItem')}
            onPress={() => { setEditingCurrency(undefined); setShowCurrencyModal(true); }}
          />
        ) : (
          <>
            {renderBalancesItems()}
            <GroupTotalRow
              label={t('total')}
              value={formatCurrency(currenciesTotalBase, baseCurrency)}
              zakah={`${t('zakahColon')} ${formatCurrency(currenciesTotalBase * ZAKAH_RATE, baseCurrency)}`}
              iconName="trending-up"
              gradient={G.tealCyan}
            />
          </>
        )}
      </>
    );
  }

  function renderGoldContent() {
    return (
      <>
        {sortedGold.length > 0 && (
          <GradientButton
            label={t('addItem')}
            onPress={openAddGold}
            colors={G.gold}
            style={styles.addBtnFull}
            textStyle={styles.addBtnText}
          />
        )}

        {sortedGold.length === 0 ? (
          <SectionEmptyCard
            gradient={G.gold}
            icon="star"
            title={t('emptyGoldTitle')}
            description={t('emptyGoldDesc')}
            btnLabel={t('addGoldItem')}
            onPress={openAddGold}
          />
        ) : (
          <>
            {groupBy(sortedGold, (h) => formatPurity(h.purity, h.purityUnit)).map(({ groupKey, items }) => {
              const totalWeight = items.reduce((s, h) => s + h.weightGrams, 0);
              const totalValue = items.reduce((s, h) => s + goldValue(h, goldPricePerGram, goldPurityPrices?.[String(h.purity)]), 0);
              return (
                <View key={groupKey}>
                  <GroupHeader label={groupKey} />
                  {items.map(renderMetalItem)}
                  {showTotals[activeTab] && (
                    <GroupTotalRow
                      label={`${groupKey} · ${t('total')}`}
                      sub={formatWeight(totalWeight, lang)}
                      value={formatCurrency(totalValue, baseCurrency)}
                      zakah={`${t('zakahColon')} ${formatWeight(totalWeight * ZAKAH_RATE, lang)}`}
                      gradient={G.subtotal}
                    />
                  )}
                </View>
              );
            })}
            <GroupTotalRow
              label={t('total')}
              sub={`${formatWeight(goldPureTotalWeight, lang)} ${t('eq24k')}`}
              value={formatCurrency(goldTotalValue, baseCurrency)}
              zakah={`${t('zakahColon')} ${formatWeight(goldPureTotalWeight * ZAKAH_RATE, lang)} ${t('eq24k')}`}
              iconName="trending-up"
              gradient={G.tealCyan}
            />
          </>
        )}
      </>
    );
  }

  function renderSilverContent() {
    return (
      <>
        {sortedSilver.length > 0 && (
          <GradientButton
            label={t('addItem')}
            onPress={openAddSilver}
            colors={G.silverAlt}
            style={styles.addBtnFull}
            textStyle={styles.addBtnText}
          />
        )}

        {sortedSilver.length === 0 ? (
          <SectionEmptyCard
            gradient={G.silverAlt}
            icon="disc"
            title={t('emptySilverTitle')}
            description={t('emptySilverDesc')}
            btnLabel={t('addSilverItem')}
            onPress={openAddSilver}
          />
        ) : (
          <>
            {groupBy(sortedSilver, (h) => formatPurity(h.purity, h.purityUnit)).map(({ groupKey, items }) => {
              const totalWeight = items.reduce((s, h) => s + h.weightGrams, 0);
              const totalValue = items.reduce((s, h) => s + silverValue(h, silverPricePerGram), 0);
              return (
                <View key={groupKey}>
                  <GroupHeader label={groupKey} />
                  {items.map(renderMetalItem)}
                  {showTotals[activeTab] && (
                    <GroupTotalRow
                      label={`${groupKey} · ${t('total')}`}
                      sub={formatWeight(totalWeight, lang)}
                      value={formatCurrency(totalValue, baseCurrency)}
                      gradient={G.subtotal}
                    />
                  )}
                </View>
              );
            })}
            <GroupTotalRow
              label={t('total')}
              sub={formatWeight(silverPureTotalWeight, lang)}
              value={formatCurrency(silverTotalValue, baseCurrency)}
              zakah={`${t('zakahColon')} ${formatCurrency(silverTotalValue * ZAKAH_RATE, baseCurrency)}`}
              iconName="trending-up"
              gradient={G.tealCyan}
            />
          </>
        )}
      </>
    );
  }

  const TAB_CONFIG: {
    key: AssetTab;
    label: string;
    icon: React.ComponentProps<typeof Feather>['name'];
    gradient: [string, string];
  }[] = [
    { key: 'balances', label: t('balances'), icon: 'credit-card', gradient: G.tealCyan },
    { key: 'gold',     label: t('gold'),     icon: 'star',        gradient: G.gold },
    { key: 'silver',   label: t('silver'),   icon: 'disc',        gradient: G.silverAlt },
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}>

        {/* Scrolling header: intro + callout + subtotals switch */}
        <View style={styles.inner}>
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

          <Pressable
            style={[styles.switchRow, { backgroundColor: bg, borderColor: border }]}
            onPress={() => setShowTotals((prev) => ({ ...prev, [activeTab]: !prev[activeTab] }))}>
            <ToggleSwitch
              value={showTotals[activeTab]}
              onValueChange={(v) => setShowTotals((prev) => ({ ...prev, [activeTab]: v }))}
            />
            <Text style={[styles.switchLabel, { color: text }]}>{t('totals')}</Text>
          </Pressable>
        </View>

        {/* Sticky tab bar */}
        <View style={[styles.tabBarWrap, { backgroundColor: bg }]}>
          <View style={styles.tabBarInner}>
            <View style={[styles.tabBar, { backgroundColor: card }, cardShadow]}>
              {TAB_CONFIG.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    style={styles.tabItem}
                    onPress={() => setActiveTab(tab.key)}>
                    {active && (
                      <LinearGradient
                        colors={tab.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                    )}
                    <Feather name={tab.icon} size={16} color={active ? '#fff' : muted} />
                    <Text style={[styles.tabLabel, { color: active ? '#fff' : muted }]}>{tab.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Section content */}
        <View style={styles.inner}>
          {activeTab === 'balances' && renderBalancesContent()}
          {activeTab === 'gold'     && renderGoldContent()}
          {activeTab === 'silver'   && renderSilverContent()}
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

  // Subtotals switch
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  switchLabel: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
  },
  toggleThumb: {
    position: 'absolute',
    top: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },

  // Sticky tab bar
  tabBarWrap: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabBarInner: {
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },

  // Add button
  addBtnFull: {
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: { fontSize: 17, fontFamily: 'Inter_700Bold', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Balances grouping control
  groupingRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 16,
  },
  segControl: {
    flexDirection: 'row',
    borderRadius: 24,
    alignSelf: 'flex-start',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  seg: { paddingVertical: 7, paddingHorizontal: 20, borderRadius: 20, overflow: 'hidden' },
  segActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  segText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },

  // Group header with line
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  groupHeaderText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  groupHeaderLine: { flex: 1, height: 1 },

  // Rich empty state card
  emptyCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  emptyBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },

  // Unused remnants kept for safe removal
  togglePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, overflow: 'hidden' },
  togglePillText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  sectionHeader: { marginBottom: 12, marginTop: 4 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 2 },
  sectionTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', flexShrink: 1 },
  sectionDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2, marginBottom: 4 },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
