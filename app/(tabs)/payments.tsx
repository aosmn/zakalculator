import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/components/Themed';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDeleteSheet from '@/components/shared/ConfirmDeleteSheet';
import PaymentItem from '@/components/payments/PaymentItem';
import AddPaymentModal from '@/components/payments/AddPaymentModal';
import { useZakah } from '@/context/ZakahContext';
import { ZakahPayment } from '@/types';
import { formatCurrency } from '@/utils/formatting';

export default function PaymentsScreen() {
  const { state, deletePayment, calculation } = useZakah();
  const { baseCurrency } = state.priceSettings;
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');
  const card = useThemeColor({}, 'card');

  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ZakahPayment | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<ZakahPayment | undefined>();

  function openEdit(payment: ZakahPayment) {
    setEditingPayment(payment);
    setShowModal(true);
  }

  function handleClose() {
    setShowModal(false);
    setEditingPayment(undefined);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: text }]}>Payments</Text>
        <Pressable style={[styles.logBtn, { backgroundColor: tint }]} onPress={() => { setEditingPayment(undefined); setShowModal(true); }}>
          <Text style={styles.logBtnText}>+ Log Payment</Text>
        </Pressable>
      </View>

      <FlatList
        data={state.payments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PaymentItem payment={item} onPress={() => openEdit(item)} onLongPress={() => setDeleteTarget(item)} />
        )}
        ListEmptyComponent={
          <EmptyState message="No payments logged yet. Tap '+ Log Payment' to record one." />
        }
        ListFooterComponent={
          state.payments.length > 0 ? (
            <View style={[styles.footer, { borderTopColor: border }]}>
              <Text style={[styles.footerLabel, { color: muted }]}>Total Paid</Text>
              <Text style={[styles.footerValue, { color: text }]}>
                {formatCurrency(calculation.totalPaidBaseCurrency, baseCurrency)}
              </Text>
            </View>
          ) : null
        }
      />

      <AddPaymentModal visible={showModal} editing={editingPayment} onClose={handleClose} />

      <ConfirmDeleteSheet
        visible={!!deleteTarget}
        itemName="this payment"
        onConfirm={() => { if (deleteTarget) deletePayment(deleteTarget.id); setDeleteTarget(undefined); }}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  logBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  logBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  footer: { borderTopWidth: 1, marginTop: 8, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  footerLabel: { fontSize: 15 },
  footerValue: { fontSize: 16, fontWeight: '700' },
});
