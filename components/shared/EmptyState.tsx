import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';

interface Props {
  message: string;
}

export default function EmptyState({ message }: Props) {
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: muted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 24 },
  text: { fontSize: 15, textAlign: 'center' },
});
