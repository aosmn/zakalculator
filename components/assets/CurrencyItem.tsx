import ListItem from "@/components/shared/ListItem";
import { CURRENCY_GRADIENTS, Gradient } from "@/constants/Gradients";
import { useZakah } from "@/context/ZakahContext";
import { CurrencyHolding } from "@/types";
import { formatCurrency } from "@/utils/formatting";
import { convertToBase } from "@/utils/zakahCalculations";
import React from "react";

function getIconGradient(seed: string): Gradient {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return CURRENCY_GRADIENTS[Math.abs(h) % CURRENCY_GRADIENTS.length];
}

interface Props {
  holding: CurrencyHolding;
  onPress: () => void;
  onDelete: () => void;
}

export default function CurrencyItem({ holding, onPress, onDelete }: Props) {
  const { state } = useZakah();
  const { baseCurrency } = state.priceSettings;

  const baseValue = convertToBase(
    holding.amount,
    holding.currency,
    baseCurrency,
    state.exchangeRates,
  );
  const gradient = getIconGradient(holding.label + holding.currency);
  const displayValue =
    holding.currency === baseCurrency
      ? formatCurrency(holding.amount, baseCurrency)
      : formatCurrency(baseValue, baseCurrency);

  return (
    <ListItem
      icon={{ name: "briefcase", gradient }}
      midStart={`${holding.label} · ${holding.currency}`}
      bottomStart={formatCurrency(holding.amount, holding.currency)}
      midEnd={displayValue}
      onDelete={onDelete}
      stripColors={gradient}
      onPress={onPress}
    />
  );
}
