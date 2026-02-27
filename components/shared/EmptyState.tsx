import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';

interface Props {
  message: string;
}

export default function EmptyState({ message }: Props) {
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={styles.container}>
      <Feather name="inbox" size={32} color={muted} style={styles.icon} />
      <Text style={[styles.text, { color: muted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 40 },
  icon: { marginBottom: 12 },
  text: { fontSize: 16, fontFamily: 'Inter_500Medium', textAlign: 'center' },
});
