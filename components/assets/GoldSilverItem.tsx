import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';
import { MetalHolding } from '@/types';
import { useZakah } from '@/context/ZakahContext';
import { goldValue, silverValue } from '@/utils/zakahCalculations';
import { formatCurrency, formatWeight, formatPurity } from '@/utils/formatting';

interface Props {
  holding: MetalHolding;
  onPress: () => void;
  onLongPress: () => void;
}

export default function GoldSilverItem({ holding, onPress, onLongPress }: Props) {
  const { state } = useZakah();
  const { goldPricePerGram, silverPricePerGram, baseCurrency, goldPurityPrices } = state.priceSettings;
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');

  const valueBase =
    holding.type === 'gold'
      ? goldValue(holding, goldPricePerGram, goldPurityPrices?.[String(holding.purity)])
      : silverValue(holding, silverPricePerGram);

  const dot = holding.type === 'gold' ? '#F59E0B' : '#9CA3AF';

  return (
    <Pressable
      style={[styles.row, { backgroundColor: card, borderColor: border }]}
      onPress={onPress}
      onLongPress={onLongPress}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <View style={styles.left}>
        <Text style={[styles.label, { color: text }]}>{holding.label}</Text>
        <Text style={[styles.sub, { color: muted }]}>
          {formatWeight(holding.weightGrams)} · {formatPurity(holding.purity, holding.purityUnit)}
        </Text>
      </View>
      <Text style={[styles.value, { color: text }]}>{formatCurrency(valueBase, baseCurrency)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  left: { flex: 1, marginRight: 8 },
  label: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 2 },
  value: { fontSize: 16, fontWeight: '700' },
});
