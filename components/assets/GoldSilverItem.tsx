import { useColorScheme } from "@/components/useColorScheme";
import ListItem from "@/components/shared/ListItem";
import { G } from "@/constants/Gradients";
import { useLanguage } from "@/context/LanguageContext";
import { useZakah } from "@/context/ZakahContext";
import { MetalHolding } from "@/types";
import { formatCurrency, formatPurity, formatWeight } from "@/utils/formatting";
import { goldValue, silverValue } from "@/utils/zakahCalculations";
import { Feather } from "@expo/vector-icons";
import React from "react";

interface Props {
  holding: MetalHolding;
  onPress: () => void;
  onDelete: () => void;
}

export default function GoldSilverItem({ holding, onPress, onDelete }: Props) {
  const { state } = useZakah();
  const { lang } = useLanguage();
  const isDark = useColorScheme() === "dark";
  const {
    goldPricePerGram,
    silverPricePerGram,
    baseCurrency,
    goldPurityPrices,
  } = state.priceSettings;

  const valueBase =
    holding.type === "gold"
      ? goldValue(
          holding,
          goldPricePerGram,
          goldPurityPrices?.[String(holding.purity)],
        )
      : silverValue(holding, silverPricePerGram);

  const gradient =
    holding.type === "gold"
      ? isDark
        ? G.goldDark
        : G.gold
      : isDark
        ? G.silverDark
        : G.silver;
  const iconName: React.ComponentProps<typeof Feather>["name"] =
    holding.type === "gold" ? "star" : "disc";

  return (
    <ListItem
      icon={{ name: iconName, gradient }}
      midStart={holding.label}
      bottomStart={`${formatWeight(holding.weightGrams, lang)} · ${formatPurity(holding.purity, holding.purityUnit)}`}
      midEnd={formatCurrency(valueBase, baseCurrency)}
      onDelete={onDelete}
      stripColors={gradient}
      onPress={onPress}
    />
  );
}
