import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function SectionSeparator() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  gap: { marginVertical: 28 },
});
