import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/components/Themed';
import { useLanguage } from '@/context/LanguageContext';
import { CurrencyHolding } from '@/types';
import { useZakah } from '@/context/ZakahContext';
import { convertToBase } from '@/utils/zakahCalculations';
import { formatCurrency } from '@/utils/formatting';
import { CURRENCY_GRADIENTS, Gradient } from '@/constants/Gradients';

function getIconGradient(seed: string): Gradient {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return CURRENCY_GRADIENTS[Math.abs(h) % CURRENCY_GRADIENTS.length];
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
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');

  const [hovered, setHovered] = useState(false);
  const hoverAnim = useRef(new Animated.Value(0)).current;

  function onHoverIn() {
    setHovered(true);
    Animated.spring(hoverAnim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 3 }).start();
  }
  function onHoverOut() {
    setHovered(false);
    Animated.spring(hoverAnim, { toValue: 0, useNativeDriver: true, speed: 40, bounciness: 3 }).start();
  }

  const translateY = hoverAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });

  const baseValue = convertToBase(holding.amount, holding.currency, baseCurrency, state.exchangeRates);
  const gradient = getIconGradient(holding.label + holding.currency);
  const displayValue = holding.currency === baseCurrency
    ? formatCurrency(holding.amount, baseCurrency)
    : formatCurrency(baseValue, baseCurrency);

  const hoverShadow = hovered
    ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }
    : {};

  return (
    <Animated.View style={[styles.outerCard, hoverShadow, { backgroundColor: card, borderColor: border, transform: [{ translateY }] }]}>
      <Pressable
        style={[styles.card, { backgroundColor: card }]}
        onPress={onPress}
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}>
        <View style={[styles.row, isRTL && styles.rowRTL]}>
          {/* Gradient icon avatar */}
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.iconWrap, { shadowColor: gradient[0], shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 }]}>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerCard: { borderRadius: 16, marginBottom: 10, borderWidth: 1 },
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
