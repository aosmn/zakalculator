import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';

interface Props extends TextInputProps {
  label: string;
}

export default function FormInput({ label, style, ...rest }: Props) {
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: muted }]}>{label}</Text>
      <TextInput
        style={[styles.input, { color: text, backgroundColor: card, borderColor: border }, style]}
        placeholderTextColor={muted}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
});
