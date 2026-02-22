export interface CurrencyHolding {
  id: string;
  label: string;
  currency: string;
  amount: number;
}

export interface MetalHolding {
  id: string;
  label: string;
  type: 'gold' | 'silver';
  weightGrams: number;
  purity: number;
  purityUnit: 'karats' | 'percentage';
}

export interface PriceSettings {
  goldPricePerGram: number;    // 24k base price per gram in base currency
  silverPricePerGram: number;  // per gram in base currency
  baseCurrency: string;
  // Optional per-karat market prices (key = karat as string, e.g. "21").
  // If set, used directly instead of deriving from the 24k base price.
  goldPurityPrices: Record<string, number>;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  rate: number;
}

export interface ZakahPayment {
  id: string;
  amountBaseCurrency: number;
  currency: string;
  amountDisplayCurrency: number;
  note: string;
  paidAt: string;
}

export interface ZakahState {
  currencyHoldings: CurrencyHolding[];
  metalHoldings: MetalHolding[];
  priceSettings: PriceSettings;
  exchangeRates: ExchangeRate[];
  payments: ZakahPayment[];
}

export interface PersonalData {
  currencyHoldings: CurrencyHolding[];
  metalHoldings: MetalHolding[];
  payments: ZakahPayment[];
}

export interface Person {
  id: string;
  name: string;
  data: PersonalData;
}

export interface StoredAppData {
  version: 2;
  activePerson: string;
  people: Person[];
  shared: {
    priceSettings: PriceSettings;
    exchangeRates: ExchangeRate[];
  };
}

export interface ZakahCalculationResult {
  totalWealthBaseCurrency: number;
  nisabValueBaseCurrency: number;
  isAboveNisab: boolean;
  zakahDueBaseCurrency: number;
  totalPaidBaseCurrency: number;
  remainingBaseCurrency: number;
  breakdown: {
    currenciesTotal: number;
    goldTotal: number;
    silverTotal: number;
  };
}
