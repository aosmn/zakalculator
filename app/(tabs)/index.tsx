import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/components/Themed';
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

type BalancesGroupMode = null | 'currency' | 'label';

function SectionHeader({
  title,
  description,
  onAdd,
  addLabel,
}: {
  title: string;
  description?: string;
  onAdd: () => void;
  addLabel: string;
}) {
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLeft}>
        <Text style={[styles.sectionTitle, { color: text }]}>{title}</Text>
        {description ? <Text style={[styles.sectionDesc, { color: muted }]}>{description}</Text> : null}
      </View>
      <Pressable onPress={onAdd} style={[styles.addBtn, { backgroundColor: tint }]} hitSlop={8}>
        <Text style={styles.addBtnText}>{addLabel}</Text>
      </Pressable>
    </View>
  );
}

function SectionHeaderWithToggle({
  title,
  description,
  toggled,
  onToggle,
  toggleLabel,
  onAdd,
  addLabel,
}: {
  title: string;
  description?: string;
  toggled: boolean;
  onToggle: () => void;
  toggleLabel: string;
  onAdd: () => void;
  addLabel: string;
}) {
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLeft}>
        <Text style={[styles.sectionTitle, { color: text }]}>{title}</Text>
        {description ? <Text style={[styles.sectionDesc, { color: muted }]}>{description}</Text> : null}
      </View>
      <View style={styles.sectionRight}>
        <Pressable
          style={[styles.togglePill, { borderColor: toggled ? tint : border, backgroundColor: toggled ? tint : 'transparent' }]}
          onPress={onToggle}>
          <Text style={[styles.togglePillText, { color: toggled ? '#fff' : muted }]}>{toggleLabel}</Text>
        </Pressable>
        <Pressable onPress={onAdd} style={[styles.addBtn, { backgroundColor: tint }]} hitSlop={8}>
          <Text style={styles.addBtnText}>{addLabel}</Text>
        </Pressable>
      </View>
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
  const { t } = useLanguage();
  const bg = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');

  // Modals
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<CurrencyHolding | undefined>();
  const [showMetalModal, setShowMetalModal] = useState(false);
  const [metalModalType, setMetalModalType] = useState<'gold' | 'silver'>('gold');
  const [editingMetal, setEditingMetal] = useState<MetalHolding | undefined>();

  // Delete confirmation
  const [deleteCurrency, setDeleteCurrency] = useState<CurrencyHolding | undefined>();
  const [deleteMetal, setDeleteMetal] = useState<MetalHolding | undefined>();

  // Grouping
  const [balancesGroupMode, setBalancesGroupMode] = useState<BalancesGroupMode>(null);
  const [groupGold, setGroupGold] = useState(false);
  const [groupSilver, setGroupSilver] = useState(false);

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

  function renderBalances() {
    if (sortedBalances.length === 0) {
      return <EmptyState message={t('noBalances')} />;
    }
    if (balancesGroupMode === 'currency') {
      return groupBy(sortedBalances, (h) => h.currency).map(({ groupKey, items }) => (
        <View key={groupKey}>
          <GroupHeader label={groupKey} />
          {items.map(renderCurrencyItem)}
        </View>
      ));
    }
    if (balancesGroupMode === 'label') {
      return groupBy(sortedBalances, (h) => h.label).map(({ groupKey, items }) => (
        <View key={groupKey}>
          <GroupHeader label={groupKey} />
          {items.map(renderCurrencyItem)}
        </View>
      ));
    }
    return sortedBalances.map(renderCurrencyItem);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>

          {/* Intro card */}
          <View style={[styles.introCard, { backgroundColor: tint + '18' }]}>
            <LinearGradient
              colors={['#0D9488', '#0F766E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.introIconWrap}>
              <Feather name="star" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.introContent}>
              <Text style={[styles.introTitle, { color: text }]}>{t('appIntroTitle')}</Text>
              <Text style={[styles.introDesc, { color: muted }]}>{t('appIntroDesc')}</Text>
            </View>
          </View>

          {/* Balances section header */}
          <SectionHeader
            title={t('balances')}
            description={t('cashAndAccounts')}
            onAdd={() => { setEditingCurrency(undefined); setShowCurrencyModal(true); }}
            addLabel={t('addItem')}
          />

          {/* Segmented group control */}
          <View style={[styles.segControl, { borderColor: tint }]}>
            <Pressable
              style={[styles.seg, balancesGroupMode === 'currency' && { backgroundColor: tint }]}
              onPress={() => toggleBalancesGroup('currency')}>
              <Text style={[styles.segText, { color: balancesGroupMode === 'currency' ? '#fff' : text }]}>
                {t('groupByCurrency')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.seg, balancesGroupMode === 'label' && { backgroundColor: tint }]}
              onPress={() => toggleBalancesGroup('label')}>
              <Text style={[styles.segText, { color: balancesGroupMode === 'label' ? '#fff' : text }]}>
                {t('groupByLabel')}
              </Text>
            </Pressable>
          </View>

          {renderBalances()}

          <SectionSeparator />

          {/* Gold */}
          <SectionHeaderWithToggle
            title={t('gold')}
            description={t('goldDesc')}
            toggled={groupGold}
            onToggle={() => setGroupGold((v) => !v)}
            toggleLabel={t('group')}
            onAdd={openAddGold}
            addLabel={t('addItem')}
          />
          {sortedGold.length === 0 ? (
            <EmptyState message={t('noGold')} />
          ) : groupGold ? (
            groupBy(sortedGold, (h) => formatPurity(h.purity, h.purityUnit)).map(({ groupKey, items }) => (
              <View key={groupKey}>
                <GroupHeader label={groupKey} />
                {items.map(renderMetalItem)}
              </View>
            ))
          ) : (
            sortedGold.map(renderMetalItem)
          )}

          <SectionSeparator />

          {/* Silver */}
          <SectionHeaderWithToggle
            title={t('silver')}
            description={t('silverDesc')}
            toggled={groupSilver}
            onToggle={() => setGroupSilver((v) => !v)}
            toggleLabel={t('group')}
            onAdd={openAddSilver}
            addLabel={t('addItem')}
          />
          {sortedSilver.length === 0 ? (
            <EmptyState message={t('noSilver')} />
          ) : groupSilver ? (
            groupBy(sortedSilver, (h) => formatPurity(h.purity, h.purityUnit)).map(({ groupKey, items }) => (
              <View key={groupKey}>
                <GroupHeader label={groupKey} />
                {items.map(renderMetalItem)}
              </View>
            ))
          ) : (
            sortedSilver.map(renderMetalItem)
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
  spacer: { height: 40 },

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

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionLeft: { flex: 1, marginRight: 12 },
  sectionTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  sectionDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  togglePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  togglePillText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  addBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  addBtnText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#fff' },

  // Segmented control
  segControl: {
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
    marginBottom: 14,
    padding: 3,
  },
  seg: { paddingVertical: 7, paddingHorizontal: 20, borderRadius: 20 },
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
