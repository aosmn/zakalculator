import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';
import { ZakahPayment } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatting';

interface Props {
  payment: ZakahPayment;
  onPress: () => void;
  onLongPress: () => void;
}

export default function PaymentItem({ payment, onPress, onLongPress }: Props) {
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const success = useThemeColor({}, 'success');

  return (
    <Pressable
      style={[styles.row, { backgroundColor: card, borderColor: border }]}
      onPress={onPress}
      onLongPress={onLongPress}>
      <View style={styles.left}>
        <Text style={[styles.date, { color: muted }]}>{formatDate(payment.paidAt)}</Text>
        {payment.note ? (
          <Text style={[styles.note, { color: text }]}>{payment.note}</Text>
        ) : null}
      </View>
      <Text style={[styles.amount, { color: success }]}>
        {formatCurrency(payment.amountDisplayCurrency, payment.currency)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  left: { flex: 1, marginRight: 8 },
  date: { fontSize: 13, marginBottom: 2 },
  note: { fontSize: 15, fontWeight: '500' },
  amount: { fontSize: 17, fontWeight: '700' },
});
