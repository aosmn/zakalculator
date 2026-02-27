import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/components/Themed';
import NisabCard from '@/components/summary/NisabCard';
import ZakahBreakdownCard from '@/components/summary/ZakahBreakdownCard';
import SummaryCard from '@/components/summary/SummaryCard';

export default function SummaryScreen() {
  const bg = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <NisabCard />
          <ZakahBreakdownCard />
          <SummaryCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flexGrow: 1 },
  inner: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
  },
});
