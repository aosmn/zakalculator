import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor, cardShadow } from '@/components/Themed';
import { useLanguage } from '@/context/LanguageContext';
import { MetalHolding } from '@/types';
import { useZakah } from '@/context/ZakahContext';
import { goldValue, silverValue } from '@/utils/zakahCalculations';
import { formatCurrency, formatWeight, formatPurity } from '@/utils/formatting';

const GOLD_GRADIENT: [string, string] = ['#FBBF24', '#F59E0B'];
const SILVER_GRADIENT: [string, string] = ['#D1D5DB', '#9CA3AF'];

interface Props {
  holding: MetalHolding;
  onPress: () => void;
  onDelete: () => void;
}

export default function GoldSilverItem({ holding, onPress, onDelete }: Props) {
  const { state } = useZakah();
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';
  const { goldPricePerGram, silverPricePerGram, baseCurrency, goldPurityPrices } = state.priceSettings;
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const card = useThemeColor({}, 'card');
  const danger = useThemeColor({}, 'danger');

  const [hovered, setHovered] = useState(false);

  const valueBase =
    holding.type === 'gold'
      ? goldValue(holding, goldPricePerGram, goldPurityPrices?.[String(holding.purity)])
      : silverValue(holding, silverPricePerGram);

  const gradient = holding.type === 'gold' ? GOLD_GRADIENT : SILVER_GRADIENT;
  const iconName: React.ComponentProps<typeof Feather>['name'] =
    holding.type === 'gold' ? 'star' : 'disc';

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
            <Feather name={iconName} size={20} color="#fff" />
          </LinearGradient>
          {/* Label + sub */}
          <View style={styles.textCol}>
            <Text style={[styles.label, { color: text, textAlign: isRTL ? 'right' : 'left' }]}>{holding.label}</Text>
            <Text style={[styles.sub, { color: muted, textAlign: isRTL ? 'right' : 'left' }]}>
              {formatWeight(holding.weightGrams)} · {formatPurity(holding.purity, holding.purityUnit)}
            </Text>
          </View>
          {/* Value + delete */}
          <View style={styles.rightCol}>
            <Text style={[styles.value, { color: text }]}>{formatCurrency(valueBase, baseCurrency)}</Text>
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
