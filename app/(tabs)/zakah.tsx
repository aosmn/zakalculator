import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/components/Themed';
import NisabCard from '@/components/summary/NisabCard';
import ZakahBreakdownCard from '@/components/summary/ZakahBreakdownCard';
import SummaryCard from '@/components/summary/SummaryCard';

export default function SummaryScreen() {
  const bg = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <NisabCard />
        <ZakahBreakdownCard />
        <SummaryCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16 },
});
