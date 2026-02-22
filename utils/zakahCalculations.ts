import {
  ExchangeRate,
  MetalHolding,
  ZakahCalculationResult,
  ZakahState,
} from '@/types';

export const NISAB_GOLD_GRAMS = 85;
export const ZAKAH_RATE = 0.025;

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function convertToBase(
  amount: number,
  currency: string,
  baseCurrency: string,
  exchangeRates: ExchangeRate[]
): number {
  if (currency === baseCurrency) return amount;
  const rate = exchangeRates.find((r) => r.fromCurrency === currency);
  if (!rate) return 0;
  return amount * rate.rate;
}

// Price is already in base currency — no conversion needed.
// customPrice: per-gram market price for this specific purity (overrides base-price derivation).
export function goldValue(
  holding: MetalHolding,
  goldPricePerGram: number,
  customPrice?: number
): number {
  if (customPrice !== undefined) return holding.weightGrams * customPrice;
  const purityFraction =
    holding.purityUnit === 'karats' ? holding.purity / 24 : holding.purity / 100;
  return holding.weightGrams * purityFraction * goldPricePerGram;
}

export function silverValue(holding: MetalHolding, silverPricePerGram: number): number {
  const purityFraction = holding.purity / 100;
  return holding.weightGrams * purityFraction * silverPricePerGram;
}

export function calculateZakah(state: ZakahState): ZakahCalculationResult {
  const { currencyHoldings, metalHoldings, priceSettings, exchangeRates, payments } = state;
  const { goldPricePerGram, silverPricePerGram, baseCurrency, goldPurityPrices } = priceSettings;

  const currenciesTotal = currencyHoldings.reduce((sum, h) => {
    return sum + convertToBase(h.amount, h.currency, baseCurrency, exchangeRates);
  }, 0);

  const goldHoldings = metalHoldings.filter((h) => h.type === 'gold');
  const silverHoldings = metalHoldings.filter((h) => h.type === 'silver');

  const goldTotal = goldHoldings.reduce((sum, h) => {
    const customPrice = goldPurityPrices?.[String(h.purity)];
    return sum + goldValue(h, goldPricePerGram, customPrice);
  }, 0);
  const silverTotal = silverHoldings.reduce((sum, h) => sum + silverValue(h, silverPricePerGram), 0);

  const totalWealthBaseCurrency = currenciesTotal + goldTotal + silverTotal;

  const nisabValueBaseCurrency = NISAB_GOLD_GRAMS * goldPricePerGram;

  const isAboveNisab = totalWealthBaseCurrency >= nisabValueBaseCurrency;

  const zakahDueBaseCurrency = isAboveNisab ? totalWealthBaseCurrency * ZAKAH_RATE : 0;

  const totalPaidBaseCurrency = payments.reduce((sum, p) => sum + p.amountBaseCurrency, 0);

  const remainingBaseCurrency = Math.max(0, zakahDueBaseCurrency - totalPaidBaseCurrency);

  return {
    totalWealthBaseCurrency,
    nisabValueBaseCurrency,
    isAboveNisab,
    zakahDueBaseCurrency,
    totalPaidBaseCurrency,
    remainingBaseCurrency,
    breakdown: { currenciesTotal, goldTotal, silverTotal },
  };
}
