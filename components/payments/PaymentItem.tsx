import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor, cardShadow } from '@/components/Themed';
import { useLanguage } from '@/context/LanguageContext';
import { ZakahPayment } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatting';

interface Props {
  payment: ZakahPayment;
  onPress: () => void;
  onLongPress: () => void;
}

export default function PaymentItem({ payment, onPress, onLongPress }: Props) {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';
  const card = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const success = useThemeColor({}, 'success');

  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      style={[
        styles.row,
        { backgroundColor: card, borderLeftColor: success },
        cardShadow,
        hovered && styles.rowHovered,
      ]}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      onLongPress={onLongPress}>
      <View style={styles.left}>
        <Text style={[styles.date, { color: muted, textAlign: isRTL ? 'right' : 'left' }]}>{formatDate(payment.paidAt)}</Text>
        {payment.note ? (
          <Text style={[styles.note, { color: text, textAlign: isRTL ? 'right' : 'left' }]}>{payment.note}</Text>
        ) : null}
      </View>
      <Text style={[styles.amount, { color: success, textAlign: isRTL ? 'left' : 'right' }]}>
        {formatCurrency(payment.amountDisplayCurrency, payment.currency)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  rowHovered: {
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
    transform: [{ translateY: -2 }],
  },
  left: { flex: 1, marginEnd: 8 },
  date: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  note: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  amount: { fontSize: 18, fontFamily: 'Inter_700Bold' },
});
