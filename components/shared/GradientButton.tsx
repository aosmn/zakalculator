import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { G } from '@/constants/Gradients';

export const GRADIENT_TEAL = G.teal;
export const GRADIENT_DANGER = G.danger;

type Props = {
  label: string;
  onPress: () => void;
  colors?: [string, string];
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
};

export default function GradientButton({
  label,
  onPress,
  colors = GRADIENT_TEAL,
  disabled = false,
  style,
  textStyle,
}: Props) {
  const gradientColors = disabled ? G.disabled : colors;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.btn, style, pressed && styles.pressed]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  pressed: {
    opacity: 0.88,
  },
});
