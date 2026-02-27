import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/components/Themed';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDeleteSheet from '@/components/shared/ConfirmDeleteSheet';
import PaymentItem from '@/components/payments/PaymentItem';
import AddPaymentModal from '@/components/payments/AddPaymentModal';
import { useZakah } from '@/context/ZakahContext';
import { useLanguage } from '@/context/LanguageContext';
import { ZakahPayment } from '@/types';
import { formatCurrency } from '@/utils/formatting';

export default function PaymentsScreen() {
  const { state, deletePayment, calculation } = useZakah();
  const { t } = useLanguage();
  const { baseCurrency } = state.priceSettings;
  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');

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
      <View style={styles.pageWrap}>
        <FlatList
          data={state.payments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PaymentItem payment={item} onPress={() => openEdit(item)} onLongPress={() => setDeleteTarget(item)} />
          )}
          ListEmptyComponent={
            <EmptyState message={t('noPayments')} />
          }
          ListFooterComponent={
            state.payments.length > 0 ? (
              <View style={[styles.footer, { borderTopColor: border }]}>
                <Text style={[styles.footerLabel, { color: muted }]}>{t('totalPaid')}</Text>
                <Text style={[styles.footerValue, { color: text }]}>
                  {formatCurrency(calculation.totalPaidBaseCurrency, baseCurrency)}
                </Text>
              </View>
            ) : null
          }
        />

        {/* FAB — log payment */}
        <Pressable
          style={[styles.fab, { backgroundColor: tint }]}
          onPress={() => { setEditingPayment(undefined); setShowModal(true); }}>
          <Text style={styles.fabText}>{t('logPayment')}</Text>
        </Pressable>
      </View>

      <AddPaymentModal visible={showModal} editing={editingPayment} onClose={handleClose} />

      <ConfirmDeleteSheet
        visible={!!deleteTarget}
        itemName={t('paymentItem')}
        onConfirm={() => { if (deleteTarget) deletePayment(deleteTarget.id); setDeleteTarget(undefined); }}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pageWrap: {
    flex: 1,
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
  },
  list: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  footer: { borderTopWidth: 1, marginTop: 8, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  footerLabel: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  footerValue: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_700Bold' },
});
