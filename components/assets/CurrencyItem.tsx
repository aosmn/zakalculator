import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor, cardShadow } from '@/components/Themed';
import { useLanguage } from '@/context/LanguageContext';
import { CurrencyHolding } from '@/types';
import { useZakah } from '@/context/ZakahContext';
import { convertToBase } from '@/utils/zakahCalculations';
import { formatCurrency } from '@/utils/formatting';

const GRADIENT_PAIRS: [string, string][] = [
  ['#7C3AED', '#8B5CF6'],  // violet
  ['#059669', '#10B981'],  // emerald
  ['#DC2626', '#EF4444'],  // red
  ['#2563EB', '#3B82F6'],  // blue
  ['#D97706', '#F59E0B'],  // amber
  ['#DB2777', '#EC4899'],  // pink
  ['#0F766E', '#0D9488'],  // teal
  ['#4F46E5', '#6366F1'],  // indigo
];

function getIconGradient(seed: string): [string, string] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return GRADIENT_PAIRS[Math.abs(h) % GRADIENT_PAIRS.length];
}

interface Props {
  holding: CurrencyHolding;
  onPress: () => void;
  onDelete: () => void;
}

export default function CurrencyItem({ holding, onPress, onDelete }: Props) {
  const { state } = useZakah();
  const { lang } = useLanguage();
  const { baseCurrency } = state.priceSettings;
  const isRTL = lang === 'ar';
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const card = useThemeColor({}, 'card');
  const danger = useThemeColor({}, 'danger');

  const [hovered, setHovered] = useState(false);

  const baseValue = convertToBase(holding.amount, holding.currency, baseCurrency, state.exchangeRates);
  const gradient = getIconGradient(holding.label + holding.currency);
  const displayValue = holding.currency === baseCurrency
    ? formatCurrency(holding.amount, baseCurrency)
    : formatCurrency(baseValue, baseCurrency);

  return (
    <View style={[styles.outerCard, cardShadow, hovered && styles.outerCardHovered, { backgroundColor: card }]}>
      <Pressable
        style={[styles.card, { backgroundColor: card }]}
        onPress={onPress}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}>
        <View style={[styles.row, isRTL && styles.rowRTL]}>
          {/* Gradient icon avatar */}
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconWrap}>
            <Feather name="briefcase" size={20} color="#fff" />
          </LinearGradient>
          {/* Label + sub amount */}
          <View style={styles.textCol}>
            <Text style={[styles.label, { color: text, textAlign: isRTL ? 'right' : 'left' }]}>
              {holding.label} · {holding.currency}
            </Text>
            <Text style={[styles.sub, { color: muted, textAlign: isRTL ? 'right' : 'left' }]}>
              {formatCurrency(holding.amount, holding.currency)}
            </Text>
          </View>
          {/* Value + delete */}
          <View style={styles.rightCol}>
            <Text style={[styles.value, { color: text }]}>{displayValue}</Text>
            <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
              <Feather name="trash-2" size={15} color={danger} />
            </Pressable>
          </View>
        </View>
        {/* Gradient bottom strip */}
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.strip}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outerCard: { borderRadius: 16, marginBottom: 10 },
  outerCardHovered: {
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
    transform: [{ translateY: -2 }],
  },
  card: { borderRadius: 16, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 16,
  },
  rowRTL: { flexDirection: 'row-reverse' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: { flex: 1, justifyContent: 'center' },
  label: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  sub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 3 },
  rightCol: { alignItems: 'flex-end', justifyContent: 'space-between' },
  value: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  deleteBtn: { marginTop: 6 },
  strip: { height: 3 },
});
