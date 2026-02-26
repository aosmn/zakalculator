import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';
import { MetalHolding } from '@/types';
import { useZakah } from '@/context/ZakahContext';
import { goldValue, silverValue } from '@/utils/zakahCalculations';
import { formatCurrency, formatWeight, formatPurity } from '@/utils/formatting';

interface Props {
  holding: MetalHolding;
  onPress: () => void;
  onDelete: () => void;
}

export default function GoldSilverItem({ holding, onPress, onDelete }: Props) {
  const { state } = useZakah();
  const { goldPricePerGram, silverPricePerGram, baseCurrency, goldPurityPrices } = state.priceSettings;
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');

  const valueBase =
    holding.type === 'gold'
      ? goldValue(holding, goldPricePerGram, goldPurityPrices?.[String(holding.purity)])
      : silverValue(holding, silverPricePerGram);

  const dot = holding.type === 'gold' ? '#F59E0B' : '#9CA3AF';

  return (
    <Pressable
      style={[styles.row, { backgroundColor: card, borderColor: border }]}
      onPress={onPress}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <View style={styles.left}>
        <Text style={[styles.label, { color: text }]}>{holding.label}</Text>
        <Text style={[styles.sub, { color: muted }]}>
          {formatWeight(holding.weightGrams)} · {formatPurity(holding.purity, holding.purityUnit)}
        </Text>
      </View>
      <View style={styles.endGroup}>
        <Text style={[styles.value, { color: text }]}>{formatCurrency(valueBase, baseCurrency)}</Text>
        <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
          <Feather name="trash-2" size={16} color={danger} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingStart: 14,
    borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginEnd: 12 },
  left: { flex: 1, marginEnd: 8 },
  label: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 2 },
  endGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  value: { fontSize: 16, fontWeight: '700' },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 4 },
});
