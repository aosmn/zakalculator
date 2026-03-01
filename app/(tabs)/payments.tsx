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
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function GroupHeader({ label }: { label: string }) {
  const muted = useThemeColor({}, "muted");
  const border = useThemeColor({}, "border");
  return (
    <View style={styles.groupHeaderRow}>
      <Text style={[styles.groupHeaderText, { color: muted }]}>{label}</Text>
      <View style={[styles.groupHeaderLine, { backgroundColor: border }]} />
    </View>
  );
}

export default function PaymentsScreen() {
  const { state, deletePayment, calculation } = useZakah();
  const { t } = useLanguage();
  const { baseCurrency } = state.priceSettings;
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");

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

  const pendingPayments = state.payments.filter((p) => p.status === "pending");
  const completedPayments = state.payments.filter((p) => !p.status || p.status === "completed");

  const pendingTotal = pendingPayments.reduce((sum, p) => sum + p.amountBaseCurrency, 0);

  const hasAny = state.payments.length > 0;

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: bg }]}>
      <View style={styles.pageWrap}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: text }]}>{t("tabPayments")}</Text>
          <Text style={[styles.headerDesc, { color: muted }]}>{t("paymentsDesc")}</Text>
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

        <ScrollView contentContainerStyle={styles.list}>
          {!hasAny && (
            <EmptyState
              message={t("noPayments")}
              gradient={G.silverAlt}
              icon="check-circle"
            />
          )}

          {/* Pending section */}
          {pendingPayments.length > 0 && (
            <>
              <GroupHeader label={t("pendingPayments")} />
              {pendingPayments.map((item) => (
                <PaymentItem
                  key={item.id}
                  payment={item}
                  onPress={() => openEdit(item)}
                  onLongPress={() => setDeleteTarget(item)}
                />
              ))}
              <GroupTotalRow
                label={t("pendingTotal")}
                value={formatCurrency(pendingTotal, baseCurrency)}
                iconName="clock"
                gradient={G.amber}
                dividerTop={false}
                dividerBottom={completedPayments.length > 0}
              />
            </>
          )}

          {/* Completed section */}
          {completedPayments.length > 0 && (
            <>
              <GroupHeader label={t("completedPayments")} />
              {completedPayments.map((item) => (
                <PaymentItem
                  key={item.id}
                  payment={item}
                  onPress={() => openEdit(item)}
                  onLongPress={() => setDeleteTarget(item)}
                />
              ))}
              <GroupTotalRow
                label={t("totalPaid")}
                value={formatCurrency(calculation.totalPaidBaseCurrency, baseCurrency)}
                iconName="credit-card"
                gradient={G.subtotal}
                dividerTop={false}
              />
            </>
          )}
        </ScrollView>
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
  addBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 },
  groupHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 8,
  },
  groupHeaderText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginRight: 8,
    letterSpacing: 0.5,
  },
  groupHeaderLine: { flex: 1, height: 1 },
});
