import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/components/Themed';
import PriceSettings from '@/components/assets/PriceSettings';
import SectionSeparator from '@/components/shared/SectionSeparator';
import DataManagement from '@/components/shared/DataManagement';

export default function PricesScreen() {
  const bg = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
});
