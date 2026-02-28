import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/components/Themed';
import { useLanguage } from '@/context/LanguageContext';
import { MetalHolding } from '@/types';
import { useZakah } from '@/context/ZakahContext';
import { goldValue, silverValue } from '@/utils/zakahCalculations';
import { formatCurrency, formatWeight, formatPurity } from '@/utils/formatting';
import { G } from '@/constants/Gradients';

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

  const valueBase =
    holding.type === 'gold'
      ? goldValue(holding, goldPricePerGram, goldPurityPrices?.[String(holding.purity)])
      : silverValue(holding, silverPricePerGram);

  const gradient = holding.type === 'gold' ? G.gold : G.silver;
  const iconName: React.ComponentProps<typeof Feather>['name'] =
    holding.type === 'gold' ? 'star' : 'disc';

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
        <View style={styles.row}>
          {/* Icon + label group */}
          <View style={styles.iconLabelGroup}>
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.iconWrap, { shadowColor: gradient[0], shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 }]}>
              <Feather name={iconName} size={20} color="#fff" />
            </LinearGradient>
            <View style={[styles.textCol, isRTL && styles.textColRTL]}>
              <Text style={[styles.label, { color: text, textAlign: isRTL ? 'right' : 'left' }]}>{holding.label}</Text>
              <Text style={[styles.sub, { color: muted, textAlign: isRTL ? 'right' : 'left' }]}>
                {formatWeight(holding.weightGrams, lang)} · {formatPurity(holding.purity, holding.purityUnit)}
              </Text>
            </View>
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
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconLabelGroup: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 },
  textCol: { flex: 1, justifyContent: 'center' },
  textColRTL: { flexGrow: 0, flexShrink: 1, flexBasis: 'auto' },
  label: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  sub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 3 },
  rightCol: { alignItems: 'flex-end', justifyContent: 'space-between' },
  value: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  deleteBtn: { marginTop: 6 },
  strip: { height: 3 },
});
