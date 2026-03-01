import { useThemeColor } from "@/components/Themed";
import AddPaymentModal from "@/components/payments/AddPaymentModal";
import PaymentItem from "@/components/payments/PaymentItem";
import ConfirmDeleteSheet from "@/components/shared/ConfirmDeleteSheet";
import EmptyState from "@/components/shared/EmptyState";
import GradientButton from "@/components/shared/GradientButton";
import GroupTotalRow from "@/components/shared/GroupTotalRow";
import { G } from "@/constants/Gradients";
import { useLanguage } from "@/context/LanguageContext";
import { useZakah } from "@/context/ZakahContext";
import { ZakahPayment } from "@/types";
import { formatCurrency } from "@/utils/formatting";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentsScreen() {
  const { state, deletePayment, calculation } = useZakah();
  const { t } = useLanguage();
  const { baseCurrency } = state.priceSettings;
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");
  const tint = useThemeColor({}, "tint");
  const border = useThemeColor({}, "border");

  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<
    ZakahPayment | undefined
  >();
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
    <SafeAreaView
      edges={["top"]}
      style={[styles.safe, { backgroundColor: bg }]}
    >
      <View style={styles.pageWrap}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: text }]}>
            {t("tabPayments")}
          </Text>
          <Text style={[styles.headerDesc, { color: muted }]}>
            {t("paymentsDesc")}
          </Text>
        </View>

        <GradientButton
          label={t("logPayment")}
          onPress={() => {
            setEditingPayment(undefined);
            setShowModal(true);
          }}
          colors={G.tealCyan}
          style={styles.addBtn}
          textStyle={styles.addBtnText}
        />

        <FlatList
          data={state.payments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PaymentItem
              payment={item}
              onPress={() => openEdit(item)}
              onLongPress={() => setDeleteTarget(item)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              message={t("noPayments")}
              gradient={G.silverAlt}
              icon="check-circle"
            />
          }
          ListHeaderComponent={
            state.payments.length > 0 ? (
              <View style={styles.totalWrap}>
                <GroupTotalRow
                  label={t("totalPaid")}
                  value={formatCurrency(calculation.totalPaidBaseCurrency, baseCurrency)}
                  iconName="credit-card"
                  gradient={G.subtotal}
                  dividerTop={false}
                />
                <View style={styles.totalDivider} />
              </View>
            ) : null
          }
        />
      </View>

      <AddPaymentModal
        visible={showModal}
        editing={editingPayment}
        onClose={handleClose}
      />

      <ConfirmDeleteSheet
        visible={!!deleteTarget}
        itemName={t("paymentItem")}
        onConfirm={() => {
          if (deleteTarget) deletePayment(deleteTarget.id);
          setDeleteTarget(undefined);
        }}
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
    width: "100%",
    alignSelf: "center",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  headerDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  addBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },
  totalWrap: { marginBottom: 20 },
  totalDivider: { height: 1, marginTop: 16, marginHorizontal: 4, backgroundColor: "rgba(0,0,0,0.15)" },
});
