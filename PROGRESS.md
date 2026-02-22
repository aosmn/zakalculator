# ZaKalculator — Progress Summary

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
| 2 | Overview | `overview.tsx` | Per-currency and per-purity asset summaries |
| 3 | Prices | `prices.tsx` | Gold/silver prices, per-karat overrides, base currency, exchange rates, backup/restore |
| 4 | Zakah | `zakah.tsx` | Nisab status, wealth breakdown, zakah due/paid/remaining |
| 5 | Payments | `payments.tsx` | Log and review zakah payments |

---

## Features Implemented

### Assets Tab
- **Balances** section: currency holdings, always sorted A→Z
  - Group by Currency toggle (mutually exclusive with Group by Label)
  - Group by Label toggle
- **Gold** section: holdings with karat purity, sorted A→Z, Group by Purity toggle
- **Silver** section: holdings with percentage purity, sorted A→Z, Group by Purity toggle
- Add / edit (tap) / delete (long-press with confirmation sheet) for all holding types
- Currency selection via searchable `CurrencyPickerSheet` (25 common currencies)
- Section descriptions and separators between sections

### Overview Tab
- **Balances by Currency**: total amount per currency + base equivalent + zakah amount (2.5%), right-aligned
- **Gold by Purity**: total weight per karat group + value + zakah weight (2.5%), right-aligned; Total row uses 24k-equivalent weight
- **Silver by Purity**: total weight per purity group + value
- **Grand Total**: all assets in base currency
- Section descriptions and separators between sections

### Prices Tab
- Organised into three named sections with descriptions and separators:
  - **Base Currency**: dropdown selector; all values normalised to this currency
  - **Metal Prices**: Gold price per gram (24k) + optional per-karat overrides (10k–22k); Silver price per gram; placeholder shows derived value from 24k base
  - **Exchange Rates**: from-currency → base rate table; add/edit/delete
- **Backup & Restore**: export full data as timestamped JSON; import from file with inline confirmation
- Fields pre-populate correctly on load and after import (useEffect sync)

### Zakah Tab (formerly Summary)
- **Nisab Card**: threshold value + green/red Above/Below badge
- **Wealth Breakdown Card**: currencies, gold, silver subtotals → total wealth; Gold row includes 24k-equivalent weight and zakah-in-grams indicators (right-aligned, amber)
- **Zakah Card**: Zakah Due / Total Paid / Remaining (red when > 0)

### Payments Tab
- Log payments with amount, currency (dropdown), and optional note
- **Date field**: auto-stamped on creation; editable via native date picker (iOS spinner, Android dialog, web `<input type="date">`)
- Tap a payment to edit; save changes or delete (inline confirmation) from the edit modal
- Haptic feedback on log/save
- Payments listed newest-first
- Footer shows total paid

---

## UI & Theming

### Brand Palette (from ZaKalculator logo)
| Role | Light | Dark |
|------|-------|------|
| Background | `#F4F1EC` (warm cream) | `#0F2535` (deep navy) |
| Card | `#EDE8DF` (warm cream) | `#172F44` (mid navy) |
| Text | `#1A3A5C` (navy) | `#F5EDD5` (cream) |
| Tint | `#0E7A6E` (dark teal) | `#2BBFAD` (bright teal) |
| Warning/Gold | `#C9922A` | `#C9922A` |
| Header/Tab bar | App background | `#0F2535` |
| Active tab | `#8B6315` (dark gold) | `#2BBFAD` (teal) |

### Dark / Light Mode Toggle
- Sun/moon icon in every screen header
- Preference persisted in AsyncStorage (`@zakah_theme`)
- Overrides system setting; works on web via custom `useColorScheme` hook

### Header
- Custom `HeaderTitle` component: app icon + "ZaKalculator" text on every screen
- Bottom border matching tab bar top border

### App Icon
- ZaKalculator logo set as icon, adaptive icon, favicon, and splash screen
- Splash background: `#2A6B88`

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
| Theme | `ThemeContext` — in-app dark/light toggle, AsyncStorage persistence, overrides `useColorScheme` |
| Persistence | `AsyncStorage` — full JSON blob on every write, key `@zakah_calculator_v1` |
| Calculations | Pure functions in `utils/zakahCalculations.ts` |
| Formatting | `utils/formatting.ts` — currency, weight, date, purity |
| Navigation | Expo Router file-based tabs; URLs match tab names |
| UI | React Native + custom themed components, `useThemeColor` throughout |

---

## Shared Components

| Component | Purpose |
|-----------|---------|
| `FormInput` | Themed text input with label |
| `SectionHeader` | Bold section title + optional "+ Add" button |
| `SectionSeparator` | Themed horizontal divider between sections |
| `EmptyState` | Centred empty message |
| `ConfirmDeleteSheet` | Bottom sheet delete confirmation |
| `PickerRow` | Horizontal scrollable pill picker |
| `CurrencyPickerSheet` | Searchable currency selector (25 currencies) |
| `DataManagement` | Export/import JSON backup (Backup & Restore card) |

---

## Release Prep
- App name: **ZaKalculator**
- Android package: `com.zakalculator.app`, `versionCode: 1`
- Web PWA metadata configured
- `eas.json`: development / preview / production build profiles
- Targeting: **Android + Web**

---

## Commits

| Hash | Description |
|------|-------------|
| `e91eb17` | Initial Expo scaffold |
| `b1dd1d3` | Implement full Zakah Calculator app |
| `adc5e81` | Refine Overview and Summary gold indicators |
| `1fc346f` | Add payment edit, delete, and date picker |
| `8dc7eb3` | Restyle UI with brand palette and dark/light mode toggle |
| `0d98a22` | Prepare for release |
| `c515c29` | Add section descriptions, separators, and header logo |
| `9892e8d` | Add export/import, fix price fields, rename tabs |
