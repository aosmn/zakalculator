import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';

interface Props {
  title: string;
  onAdd?: () => void;
}

export default function SectionHeader({ title, onAdd }: Props) {
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: text }]}>{title}</Text>
      {onAdd && (
        <Pressable onPress={onAdd} style={styles.addButton} hitSlop={8}>
          <Text style={[styles.addText, { color: tint }]}>+ Add</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 20 },
  title: { fontSize: 18, fontWeight: '700' },
  addButton: { paddingVertical: 4, paddingHorizontal: 8 },
  addText: { fontSize: 15, fontWeight: '600' },
});
