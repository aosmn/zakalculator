import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';

export default function SectionSeparator() {
  const border = useThemeColor({}, 'border');
  return (
    <View style={styles.gap}>
      <View style={[styles.line, { backgroundColor: border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { marginVertical: 28, justifyContent: 'center' },
  line: { height: StyleSheet.hairlineWidth },
});
