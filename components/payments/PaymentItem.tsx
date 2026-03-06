import ListItem from "@/components/shared/ListItem";
import { useThemeColor } from "@/components/Themed";
import { useLanguage } from "@/context/LanguageContext";
import { ZakahPayment } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatting";
import React from "react";

interface Props {
  payment: ZakahPayment;
  onPress: () => void;
  onLongPress: () => void;
}

export default function PaymentItem({ payment, onPress, onLongPress }: Props) {
  const { t } = useLanguage();
  const isPending = payment.status === "pending";
  const tint = useThemeColor({}, "tint");
  const amber = "#D97706";

  return (
    <ListItem
      topStart={formatDate(payment.paidAt)}
      midStart={payment.note ?? undefined}
      midEnd={formatCurrency(payment.amountDisplayCurrency, payment.currency)}
      midEndColor={isPending ? amber : tint}
      accentColor={isPending ? amber : tint}
      onPress={onPress}
      onLongPress={onLongPress}
    />
  );
}
