import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadState, saveState } from '@/utils/storage';
import { calculateZakah, generateId } from '@/utils/zakahCalculations';
import {
  CurrencyHolding,
  ExchangeRate,
  MetalHolding,
  PriceSettings,
  ZakahCalculationResult,
  ZakahPayment,
  ZakahState,
} from '@/types';

const DEFAULT_STATE: ZakahState = {
  currencyHoldings: [],
  metalHoldings: [],
  priceSettings: {
    goldPricePerGram: 95,
    silverPricePerGram: 1.0,
    baseCurrency: 'USD',
    goldPurityPrices: {},
  },
  exchangeRates: [],
  payments: [],
};

interface ZakahContextValue {
  state: ZakahState;
  calculation: ZakahCalculationResult;
  isLoaded: boolean;

  addCurrencyHolding: (data: Omit<CurrencyHolding, 'id'>) => void;
  updateCurrencyHolding: (id: string, data: Omit<CurrencyHolding, 'id'>) => void;
  deleteCurrencyHolding: (id: string) => void;

  addMetalHolding: (data: Omit<MetalHolding, 'id'>) => void;
  updateMetalHolding: (id: string, data: Omit<MetalHolding, 'id'>) => void;
  deleteMetalHolding: (id: string) => void;

  updatePriceSettings: (data: Partial<PriceSettings>) => void;

  addExchangeRate: (data: Omit<ExchangeRate, 'id'>) => void;
  updateExchangeRate: (id: string, data: Omit<ExchangeRate, 'id'>) => void;
  deleteExchangeRate: (id: string) => void;

  logPayment: (data: Omit<ZakahPayment, 'id'>) => void;
  deletePayment: (id: string) => void;
}

const ZakahContext = createContext<ZakahContextValue | null>(null);

export function ZakahProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ZakahState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const isFirstLoad = useRef(true);

  // Load persisted state on mount
  useEffect(() => {
    loadState().then((saved) => {
      if (saved) setState(saved);
      setIsLoaded(true);
      isFirstLoad.current = false;
    });
  }, []);

  // Persist state on every change (skip the very first render before load)
  useEffect(() => {
    if (!isLoaded) return;
    saveState(state);
  }, [state, isLoaded]);

  const calculation = useMemo(() => calculateZakah(state), [state]);

  function mutate(updater: (prev: ZakahState) => ZakahState) {
    setState((prev) => updater(prev));
  }

  // Currency holdings
  const addCurrencyHolding = (data: Omit<CurrencyHolding, 'id'>) =>
    mutate((s) => ({ ...s, currencyHoldings: [...s.currencyHoldings, { id: generateId(), ...data }] }));

  const updateCurrencyHolding = (id: string, data: Omit<CurrencyHolding, 'id'>) =>
    mutate((s) => ({
      ...s,
      currencyHoldings: s.currencyHoldings.map((h) => (h.id === id ? { id, ...data } : h)),
    }));

  const deleteCurrencyHolding = (id: string) =>
    mutate((s) => ({ ...s, currencyHoldings: s.currencyHoldings.filter((h) => h.id !== id) }));

  // Metal holdings
  const addMetalHolding = (data: Omit<MetalHolding, 'id'>) =>
    mutate((s) => ({ ...s, metalHoldings: [...s.metalHoldings, { id: generateId(), ...data }] }));

  const updateMetalHolding = (id: string, data: Omit<MetalHolding, 'id'>) =>
    mutate((s) => ({
      ...s,
      metalHoldings: s.metalHoldings.map((h) => (h.id === id ? { id, ...data } : h)),
    }));

  const deleteMetalHolding = (id: string) =>
    mutate((s) => ({ ...s, metalHoldings: s.metalHoldings.filter((h) => h.id !== id) }));

  // Price settings
  const updatePriceSettings = (data: Partial<PriceSettings>) =>
    mutate((s) => ({ ...s, priceSettings: { ...s.priceSettings, ...data } }));

  // Exchange rates
  const addExchangeRate = (data: Omit<ExchangeRate, 'id'>) =>
    mutate((s) => ({ ...s, exchangeRates: [...s.exchangeRates, { id: generateId(), ...data }] }));

  const updateExchangeRate = (id: string, data: Omit<ExchangeRate, 'id'>) =>
    mutate((s) => ({
      ...s,
      exchangeRates: s.exchangeRates.map((r) => (r.id === id ? { id, ...data } : r)),
    }));

  const deleteExchangeRate = (id: string) =>
    mutate((s) => ({ ...s, exchangeRates: s.exchangeRates.filter((r) => r.id !== id) }));

  // Payments
  const logPayment = (data: Omit<ZakahPayment, 'id'>) =>
    mutate((s) => ({ ...s, payments: [{ id: generateId(), ...data }, ...s.payments] }));

  const deletePayment = (id: string) =>
    mutate((s) => ({ ...s, payments: s.payments.filter((p) => p.id !== id) }));

  return (
    <ZakahContext.Provider
      value={{
        state,
        calculation,
        isLoaded,
        addCurrencyHolding,
        updateCurrencyHolding,
        deleteCurrencyHolding,
        addMetalHolding,
        updateMetalHolding,
        deleteMetalHolding,
        updatePriceSettings,
        addExchangeRate,
        updateExchangeRate,
        deleteExchangeRate,
        logPayment,
        deletePayment,
      }}>
      {children}
    </ZakahContext.Provider>
  );
}

export function useZakah(): ZakahContextValue {
  const ctx = useContext(ZakahContext);
  if (!ctx) throw new Error('useZakah must be used within ZakahProvider');
  return ctx;
}
