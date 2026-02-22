# Zakah Calculator App — Implementation Plan

## Context
Building a full-featured Zakah calculator on top of the existing Expo Router (tabs) scaffold. The app lets users track their assets (currencies, gold, silver), configure prices and exchange rates, log zakah payments, and see a live summary of what they owe vs. what they've paid.

Zakah rules implemented:
- Nisab = 85g of 24k gold
- Rate = 2.5% of total wealth if above nisab
- All values normalized to a user-chosen base currency

---

## Dependencies to Install
```
npx expo install @react-native-async-storage/async-storage
npx expo install expo-haptics
```

---

## File Structure

### New files to create
```
types/index.ts                          # All TS interfaces
context/ZakahContext.tsx                # Global state + AsyncStorage persistence
utils/zakahCalculations.ts              # Pure calculation functions
utils/formatting.ts                     # Currency/number/weight formatters
utils/storage.ts                        # AsyncStorage key + typed load/save

components/shared/FormInput.tsx         # Themed TextInput with label
components/shared/SectionHeader.tsx     # Bold section title + optional "+" button
components/shared/EmptyState.tsx        # Centered "nothing here" message
components/shared/ConfirmDeleteSheet.tsx# Bottom modal to confirm deletion
components/shared/PickerRow.tsx         # Inline pill-button picker

components/assets/CurrencyItem.tsx      # Row: currency label, amount, base value
components/assets/GoldSilverItem.tsx    # Row: metal label, weight, purity, value
components/assets/AddCurrencyModal.tsx  # Modal: add/edit currency holding
components/assets/AddMetalModal.tsx     # Modal: add/edit gold/silver holding
components/assets/PriceSettings.tsx     # Inline section: gold/silver prices + exchange rates

components/summary/NisabCard.tsx        # Nisab threshold + above/below badge
components/summary/ZakahBreakdownCard.tsx # Itemized totals (currencies, gold, silver)
components/summary/SummaryCard.tsx      # Due / Paid / Remaining (color-coded)

components/payments/PaymentItem.tsx     # Row: date, amount, note
components/payments/AddPaymentModal.tsx # Modal: log a payment

app/(tabs)/three.tsx                    # NEW: Payments tab screen
```

### Files to modify
```
app/_layout.tsx                         # Wrap root with <ZakahProvider>
app/(tabs)/_layout.tsx                  # Add 3rd tab (Payments), update icons + titles
app/(tabs)/index.tsx                    # Replace with Assets screen
app/(tabs)/two.tsx                      # Replace with Summary screen
constants/Colors.ts                     # Add success, danger, warning, muted colors
```

---

## Data Models (`types/index.ts`)

```ts
interface CurrencyHolding {
  id: string;
  label: string;       // e.g. "Savings Account"
  currency: string;    // ISO code: "USD", "EGP"
  amount: number;
}

interface MetalHolding {
  id: string;
  label: string;
  type: 'gold' | 'silver';
  weightGrams: number;
  purity: number;              // karats (gold) or percentage (silver)
  purityUnit: 'karats' | 'percentage';
}

interface PriceSettings {
  goldPricePerGramUSD: number;    // 24k gold per gram in USD
  silverPricePerGramUSD: number;
  baseCurrency: string;           // ISO code
}

interface ExchangeRate {
  id: string;
  fromCurrency: string;
  rate: number;   // 1 fromCurrency = rate baseCurrency
}

interface ZakahPayment {
  id: string;
  amountBaseCurrency: number;
  currency: string;
  amountDisplayCurrency: number;
  note: string;
  paidAt: string;   // ISO date string
}

interface ZakahState {
  currencyHoldings: CurrencyHolding[];
  metalHoldings: MetalHolding[];
  priceSettings: PriceSettings;
  exchangeRates: ExchangeRate[];
  payments: ZakahPayment[];
}

interface ZakahCalculationResult {
  totalWealthBaseCurrency: number;
  nisabValueBaseCurrency: number;
  isAboveNisab: boolean;
  zakahDueBaseCurrency: number;
  totalPaidBaseCurrency: number;
  remainingBaseCurrency: number;
  breakdown: { currenciesTotal: number; goldTotal: number; silverTotal: number };
}
```

---

## State Management (`context/ZakahContext.tsx`)

- Single context holding `ZakahState`
- On mount: load from AsyncStorage (`@zakah_calculator_v1`)
- On every write: update state → persist full JSON blob
- Derives `ZakahCalculationResult` on every state change (useMemo)
- Exposes typed action functions (no reducer boilerplate):
  - `addCurrencyHolding`, `updateCurrencyHolding`, `deleteCurrencyHolding`
  - `addMetalHolding`, `updateMetalHolding`, `deleteMetalHolding`
  - `updatePriceSettings`
  - `addExchangeRate`, `updateExchangeRate`, `deleteExchangeRate`
  - `logPayment`, `deletePayment`
- ID generation: `Date.now().toString(36) + Math.random().toString(36).slice(2)`

---

## Calculation Logic (`utils/zakahCalculations.ts`)

```
NISAB_GOLD_GRAMS = 85
ZAKAH_RATE = 0.025

convertToBase(amount, currency, baseCurrency, exchangeRates) → number
  - passthrough if currency === baseCurrency
  - multiply by matching ExchangeRate.rate
  - return 0 if no rate found

goldValueUSD(holding, goldPricePerGramUSD)
  → weightGrams × (purity / 24) × goldPricePerGramUSD

silverValueUSD(holding, silverPricePerGramUSD)
  → weightGrams × (purity / 100) × silverPricePerGramUSD

calculateZakah(state) → ZakahCalculationResult
  1. currenciesTotal = sum of all holdings converted to base
  2. goldTotal = sum of gold USD values → converted to base
  3. silverTotal = sum of silver USD values → converted to base
  4. totalWealth = currenciesTotal + goldTotal + silverTotal
  5. nisabValue = 85 × goldPricePerGramUSD → converted to base
  6. isAboveNisab = totalWealth >= nisabValue
  7. zakahDue = isAboveNisab ? totalWealth × 0.025 : 0
  8. totalPaid = sum of payments.amountBaseCurrency
  9. remaining = Math.max(0, zakahDue - totalPaid)
```

---

## Screens

### Tab 1 — Assets (`index.tsx`)
- Scroll view with 4 sections:
  1. **Currencies** — list of `CurrencyItem` + "Add" → `AddCurrencyModal`
  2. **Gold** — list of `GoldSilverItem` (type=gold) + "Add" → `AddMetalModal`
  3. **Silver** — list of `GoldSilverItem` (type=silver) + "Add" → `AddMetalModal`
  4. **Prices & Rates** — `PriceSettings` (gold price, silver price, base currency, exchange rates)
- Tap row to edit, long-press to delete via `ConfirmDeleteSheet`

### Tab 2 — Summary (`two.tsx`)
- `NisabCard` — nisab value + above/below badge (green/red)
- `ZakahBreakdownCard` — currencies / gold / silver totals → total wealth
- `SummaryCard` — Zakah Due / Total Paid / Remaining (remaining red if > 0)

### Tab 3 — Payments (`three.tsx`)
- "Log Payment" button → `AddPaymentModal`
- FlatList of `PaymentItem` rows (newest first)
- `EmptyState` when no payments
- Footer: "Total Paid: X.XX [baseCurrency]"

---

## Navigation (`app/(tabs)/_layout.tsx`)

| Tab | Screen | Icon |
|-----|--------|------|
| Assets | index | `dollar` |
| Summary | two | `calculator` |
| Payments | three | `check-circle` |

---

## Colors Extension (`constants/Colors.ts`)
```ts
// Add to both light and dark:
success: '#22C55E'
danger:  '#EF4444'
warning: '#F59E0B'
muted:   '#9CA3AF'
```

---

## Implementation Order

### Phase 1 — Foundation
1. Install dependencies
2. `types/index.ts`
3. `utils/storage.ts`
4. `utils/zakahCalculations.ts`
5. `utils/formatting.ts`
6. `context/ZakahContext.tsx`
7. Modify `app/_layout.tsx` → wrap with `<ZakahProvider>`

### Phase 2 — Shared UI
8. `constants/Colors.ts` — add semantic colors
9. `components/shared/FormInput.tsx`
10. `components/shared/SectionHeader.tsx`
11. `components/shared/EmptyState.tsx`
12. `components/shared/ConfirmDeleteSheet.tsx`
13. `components/shared/PickerRow.tsx`

### Phase 3 — Assets Tab
14. `components/assets/AddCurrencyModal.tsx`
15. `components/assets/CurrencyItem.tsx`
16. `components/assets/AddMetalModal.tsx`
17. `components/assets/GoldSilverItem.tsx`
18. `components/assets/PriceSettings.tsx`
19. Replace `app/(tabs)/index.tsx`

### Phase 4 — Summary Tab
20. `components/summary/NisabCard.tsx`
21. `components/summary/ZakahBreakdownCard.tsx`
22. `components/summary/SummaryCard.tsx`
23. Replace `app/(tabs)/two.tsx`

### Phase 5 — Payments Tab
24. `components/payments/PaymentItem.tsx`
25. `components/payments/AddPaymentModal.tsx`
26. Create `app/(tabs)/three.tsx`
27. Modify `app/(tabs)/_layout.tsx` — add third tab

### Phase 6 — Polish
28. Haptic feedback on payment log (`expo-haptics`)
29. `EmptyState` on all list screens
30. Verify dark mode with `useThemeColor` throughout

---

## Verification Checklist
- [ ] `npm run web` — all 3 tabs render
- [ ] Add a currency holding → appears in Assets + updates Summary
- [ ] Set gold price → gold holdings calculate correctly
- [ ] Log a payment → Remaining decreases on Summary tab
- [ ] Set wealth below nisab → Zakah Due shows 0
- [ ] Reload app → all data persists (AsyncStorage)
