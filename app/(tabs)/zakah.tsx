import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/components/Themed';
import ZakahBreakdownCard from '@/components/summary/ZakahBreakdownCard';
import SummaryCard from '@/components/summary/SummaryCard';

export default function SummaryScreen() {
  const bg = useThemeColor({}, 'background');

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <SummaryCard />
          <ZakahBreakdownCard />
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
    paddingBottom: 90,
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
  },
});
