# Zakah Calculator — Progress Summary

## Overview
A full-featured Zakah calculator built on Expo Router (tabs). Users track assets (currency balances, gold, silver), configure prices and exchange rates, log zakah payments, and view live summaries of what they owe vs. what they've paid.

---

## Zakah Rules Implemented
- **Nisab** = 85g of 24k gold (priced in base currency)
- **Rate** = 2.5% of total wealth if above nisab
- All values normalised to a user-chosen base currency
- Gold values use per-purity custom prices if set, otherwise derived from 24k base price × purity fraction

---

## Tab Structure

| # | Tab | Screen | Description |
|---|-----|--------|-------------|
| 1 | Assets | `index.tsx` | Manage currency balances, gold and silver holdings |
| 2 | Overview | `five.tsx` | Per-currency and per-purity asset summaries |
| 3 | Prices | `four.tsx` | Gold/silver prices, per-karat overrides, base currency, exchange rates |
| 4 | Summary | `two.tsx` | Nisab status, wealth breakdown, zakah due/paid/remaining |
| 5 | Payments | `three.tsx` | Log and review zakah payments |

---

## Features Implemented

### Assets Tab
- **Balances** section: currency holdings, always sorted A→Z
  - Group by Currency toggle
  - Group by Label toggle (mutually exclusive with Group by Currency)
- **Gold** section: holdings with karat purity, sorted A→Z, Group by Purity toggle
- **Silver** section: holdings with percentage purity, sorted A→Z, Group by Purity toggle
- Add / edit (tap) / delete (long-press with confirmation sheet) for all holding types
- Currency selection via searchable `CurrencyPickerSheet` (25 common currencies)

### Overview Tab
- **Balances by Currency**: total amount per currency + base equivalent + zakah amount (2.5%), right-aligned
- **Gold by Purity**: total weight per karat group + value + zakah weight (2.5%), right-aligned; Total row uses 24k-equivalent weight
- **Silver by Purity**: total weight per purity group + value
- **Grand Total**: all assets in base currency

### Prices Tab
- Base currency selector (dropdown)
- Gold price per gram (24k) in base currency
- Optional per-karat price overrides (10k–22k); placeholder shows derived value from 24k base
- Silver price per gram in base currency
- Exchange rates table (from-currency → base); currency selected via dropdown

### Summary Tab
- **Nisab Card**: threshold value + green/red Above/Below badge
- **Wealth Breakdown Card**: currencies, gold, silver subtotals → total wealth; Gold row includes 24k-equivalent weight and zakah-in-grams indicators (right-aligned, amber)
- **Summary Card**: Zakah Due / Total Paid / Remaining (red when > 0)

### Payments Tab
- Log payments with amount, currency (dropdown), and optional note
- Haptic feedback on successful log
- Payments listed newest-first; long-press to delete
- Footer shows total paid

---

## Data Model

```
CurrencyHolding    id, label, currency (ISO), amount
MetalHolding       id, label, type (gold|silver), weightGrams, purity, purityUnit (karats|percentage)
PriceSettings      goldPricePerGram, silverPricePerGram, baseCurrency, goldPurityPrices (Record<karat, price>)
ExchangeRate       id, fromCurrency, rate (1 from = rate base)
ZakahPayment       id, amountBaseCurrency, currency, amountDisplayCurrency, note, paidAt
```

---

## Technical Architecture

| Layer | Implementation |
|-------|---------------|
| State | `ZakahContext` — single context, action functions, `useMemo` for calculations |
| Persistence | `AsyncStorage` — full JSON blob on every write, key `@zakah_calculator_v1` |
| Calculations | Pure functions in `utils/zakahCalculations.ts` |
| Formatting | `utils/formatting.ts` — currency, weight, date, purity |
| Navigation | Expo Router file-based tabs |
| UI | React Native + custom themed components, dark mode via `useThemeColor` |

---

## Shared Components

| Component | Purpose |
|-----------|---------|
| `FormInput` | Themed text input with label |
| `SectionHeader` | Bold section title + optional "+ Add" button |
| `EmptyState` | Centred empty message |
| `ConfirmDeleteSheet` | Bottom sheet delete confirmation |
| `PickerRow` | Horizontal scrollable pill picker |
| `CurrencyPickerSheet` | Searchable currency selector (25 currencies) |

---

## Commits
| Hash | Description |
|------|-------------|
| `e91eb17` | Initial Expo scaffold |
| `b1dd1d3` | Full app implementation |
| `adc5e81` | Refine Overview and Summary gold indicators |
