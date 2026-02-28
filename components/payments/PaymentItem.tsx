import { useThemeColor } from "@/components/Themed";
import { useLanguage } from "@/context/LanguageContext";
import { ZakahPayment } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatting";
import React, { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  payment: ZakahPayment;
  onPress: () => void;
  onLongPress: () => void;
}

export default function PaymentItem({ payment, onPress, onLongPress }: Props) {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const card = useThemeColor({}, "card");
  const border = useThemeColor({}, "border");
  const text = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");
  const success = useThemeColor({}, "success");

  const [hovered, setHovered] = useState(false);
  const hoverAnim = useRef(new Animated.Value(0)).current;

  function onHoverIn() {
    setHovered(true);
    Animated.spring(hoverAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 3,
    }).start();
  }
  function onHoverOut() {
    setHovered(false);
    Animated.spring(hoverAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 40,
      bounciness: 3,
    }).start();
  }

  const translateY = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const hoverShadow = hovered
    ? {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }
    : {};

  return (
    <Animated.View
      style={[
        styles.row,
        hoverShadow,
        {
          backgroundColor: card,
          borderColor: border,
          borderStartColor: success,
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        style={styles.pressable}
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View style={isRTL ? styles.right : styles.left}>
          <Text style={[styles.date, { color: muted }]}>
            {formatDate(payment.paidAt)}
          </Text>
          {payment.note ? (
            <Text style={[styles.note, { color: text }]}>{payment.note}</Text>
          ) : null}
        </View>
        <Text style={[styles.amount, { color: success }]}>
          {formatCurrency(payment.amountDisplayCurrency, payment.currency)}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderStartWidth: 3,
  },
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 16,
  },
  left: { flex: 1, marginEnd: 8 },
  right: { flex: 1, marginStart: 8 },
  date: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  note: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  amount: { fontSize: 18, fontFamily: "Inter_700Bold" },
});
