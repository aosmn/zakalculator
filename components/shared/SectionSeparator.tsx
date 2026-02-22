import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';

export default function SectionSeparator() {
  const border = useThemeColor({}, 'border');
  return <View style={[styles.line, { borderColor: border }]} />;
}

const styles = StyleSheet.create({
  line: { borderTopWidth: 1, marginVertical: 20 },
});
