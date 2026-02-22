import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';

interface Props extends TextInputProps {
  label: string;
}

export default function FormInput({ label, style, ...rest }: Props) {
  const text = useThemeColor({}, 'text');
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');
  const card = useThemeColor({}, 'card');

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: muted }]}>{label}</Text>
      <TextInput
        style={[styles.input, { borderColor: border, color: text, backgroundColor: card }, style]}
        placeholderTextColor={muted}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16 },
});
