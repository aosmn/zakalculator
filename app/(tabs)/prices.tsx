import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/components/Themed';
import PriceSettings from '@/components/assets/PriceSettings';
import SectionSeparator from '@/components/shared/SectionSeparator';
import DataManagement from '@/components/shared/DataManagement';
import { useLanguage } from '@/context/LanguageContext';

export default function PricesScreen() {
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');
  const { lang, setLang, t } = useLanguage();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language toggle */}
        <View style={[styles.langRow, { borderColor: border }]}>
          <Text style={[styles.langLabel, { color: text }]}>{t('language')}</Text>
          <View style={styles.langPills}>
            <Pressable
              style={[styles.pill, { borderColor: lang === 'en' ? tint : border, backgroundColor: lang === 'en' ? tint + '18' : 'transparent' }]}
              onPress={() => setLang('en')}>
              <Text style={[styles.pillText, { color: lang === 'en' ? tint : muted }]}>EN</Text>
            </Pressable>
            <Pressable
              style={[styles.pill, { borderColor: lang === 'ar' ? tint : border, backgroundColor: lang === 'ar' ? tint + '18' : 'transparent' }]}
              onPress={() => setLang('ar')}>
              <Text style={[styles.pillText, { color: lang === 'ar' ? tint : muted }]}>AR</Text>
            </Pressable>
          </View>
        </View>

        <SectionSeparator />
        <PriceSettings />
        <SectionSeparator />
        <DataManagement />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  langRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 4,
  },
  langLabel: { fontSize: 15, fontWeight: '600' },
  langPills: { flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  pillText: { fontSize: 13, fontWeight: '700' },
});
