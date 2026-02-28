import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/components/Themed';

interface Props {
  message: string;
  gradient?: [string, string];
  icon?: React.ComponentProps<typeof Feather>['name'];
}

export default function EmptyState({ message, gradient, icon = 'inbox' }: Props) {
  const muted = useThemeColor({}, 'muted');

  if (gradient) {
    const [color0, color1] = gradient;
    return (
      <View style={[styles.card, { backgroundColor: color0 + '14', borderColor: color0 + '30', borderWidth: 1 }]}>
        <LinearGradient
          colors={[color0, color1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.iconWrap, { shadowColor: color0, shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 8 }]}>
          <Feather name={icon} size={28} color="#fff" />
        </LinearGradient>
        <Text style={[styles.cardText, { color: color0 }]}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Feather name={icon} size={32} color={muted} style={styles.icon} />
      <Text style={[styles.text, { color: muted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Plain (no gradient)
  container: { alignItems: 'center', paddingVertical: 40 },
  icon: { marginBottom: 12 },
  text: { fontSize: 16, fontFamily: 'Inter_500Medium', textAlign: 'center' },

  // Tinted card (with gradient)
  card: {
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 4,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
});
