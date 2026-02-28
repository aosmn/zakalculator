import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';
import { useLanguage } from '@/context/LanguageContext';

export default function PricesCallout() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'muted');
  const { t, lang } = useLanguage();
  const isRTL = lang === 'ar';

  return (
    <Pressable
      style={[styles.callout, { backgroundColor: tint + '12', borderColor: tint + '28' }]}
      onPress={() => router.push('/prices')}
    >
      <View style={[styles.iconWrap, { backgroundColor: tint + '20' }]}>
        <Feather name="sliders" size={14} color={tint} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: tint }]}>{t('pricesRates')}</Text>
        <Text style={[styles.desc, { color: muted }]}>{t('pricesCalloutDesc')}</Text>
      </View>
      <Feather name={isRTL ? 'chevron-left' : 'chevron-right'} size={16} color={tint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  callout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: { flex: 1 },
  title: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  desc: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
});
