import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

function Toggle({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');
  return (
    <Pressable
      style={[
        styles.groupToggle,
        { borderColor: active ? tint : border, backgroundColor: active ? tint + '18' : 'transparent' },
      ]}
      onPress={onPress}>
      <Text style={[styles.groupToggleText, { color: active ? tint : muted }]}>{label}</Text>
    </Pressable>
  );
}

function SectionRow({
  title,
  description,
  grouped,
  onToggleGroup,
  onAdd,
  groupLabel,
  addLabel,
}: {
  title: string;
  description?: string;
  grouped: boolean;
  onToggleGroup: () => void;
  onAdd: () => void;
  groupLabel: string;
  addLabel: string;
}) {
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionLeft}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: text }]}>{title}</Text>
          <Toggle label={groupLabel} active={grouped} onPress={onToggleGroup} />
        </View>
        {description ? <Text style={[styles.sectionDesc, { color: muted }]}>{description}</Text> : null}
      </View>
      <Pressable onPress={onAdd} style={styles.addButton} hitSlop={8}>
        <Text style={[styles.addText, { color: tint }]}>{addLabel}</Text>
      </Pressable>
    </View>
  );
}

function GroupHeader({ label }: { label: string }) {
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');
  return (
    <Text style={[styles.groupHeader, { color: muted, borderBottomColor: border }]}>{label}</Text>
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

  // Toggle helper: activates mode if not active, clears if already active
  function toggleBalancesGroup(mode: 'currency' | 'label') {
    setBalancesGroupMode((prev) => (prev === mode ? null : mode));
  }

  // Sorted holdings
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
        onLongPress={() => setDeleteCurrency(h)}
      />
    );
  }

  function renderMetalItem(h: MetalHolding) {
    return (
      <GoldSilverItem
        key={h.id}
        holding={h}
        onPress={() => openEditMetal(h)}
        onLongPress={() => setDeleteMetal(h)}
      />
    );
  }

  // Balances grouped content
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Balances — with two group toggles */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLeft}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: text }]}>{t('balances')}</Text>
              <Toggle
                label={t('groupByCurrency')}
                active={balancesGroupMode === 'currency'}
                onPress={() => toggleBalancesGroup('currency')}
              />
              <Toggle
                label={t('groupByLabel')}
                active={balancesGroupMode === 'label'}
                onPress={() => toggleBalancesGroup('label')}
              />
            </View>
            <Text style={[styles.sectionDesc, { color: muted }]}>{t('cashAndAccounts')}</Text>
          </View>
          <Pressable
            onPress={() => { setEditingCurrency(undefined); setShowCurrencyModal(true); }}
            style={styles.addButton}
            hitSlop={8}>
            <Text style={[styles.addText, { color: tint }]}>{t('addItem')}</Text>
          </Pressable>
        </View>
        {renderBalances()}

        <SectionSeparator />

        {/* Gold — grouped by karat */}
        <SectionRow
          title={t('gold')}
          description={t('goldDesc')}
          grouped={groupGold}
          onToggleGroup={() => setGroupGold((v) => !v)}
          onAdd={openAddGold}
          groupLabel={t('group')}
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

        {/* Silver — grouped by purity */}
        <SectionRow
          title={t('silver')}
          description={t('silverDesc')}
          grouped={groupSilver}
          onToggleGroup={() => setGroupSilver((v) => !v)}
          onAdd={openAddSilver}
          groupLabel={t('group')}
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
  content: { padding: 16 },
  spacer: { height: 40 },
  sectionRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: 8, marginTop: 4, flexWrap: 'wrap', gap: 6,
  },
  sectionLeft: { flex: 1 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionDesc: { fontSize: 12, marginTop: 2 },
  groupToggle: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1.5 },
  groupToggleText: { fontSize: 12, fontWeight: '700' },
  addButton: { paddingVertical: 4, paddingHorizontal: 8 },
  addText: { fontSize: 15, fontWeight: '600' },
  groupHeader: {
    fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8,
    paddingBottom: 6, marginBottom: 4, marginTop: 12, borderBottomWidth: 1,
  },
});
