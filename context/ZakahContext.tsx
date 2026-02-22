import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadAppData, saveAppData } from '@/utils/storage';
import { calculateZakah, generateId } from '@/utils/zakahCalculations';
import {
  CurrencyHolding,
  ExchangeRate,
  MetalHolding,
  Person,
  PersonalData,
  PriceSettings,
  StoredAppData,
  ZakahCalculationResult,
  ZakahPayment,
  ZakahState,
} from '@/types';

const DEFAULT_PERSON_ID = generateId();

const DEFAULT_APP_DATA: StoredAppData = {
  version: 2,
  activePerson: DEFAULT_PERSON_ID,
  people: [
    {
      id: DEFAULT_PERSON_ID,
      name: 'Me',
      data: {
        currencyHoldings: [],
        metalHoldings: [],
        payments: [],
      },
    },
  ],
  shared: {
    priceSettings: {
      goldPricePerGram: 95,
      silverPricePerGram: 1.0,
      baseCurrency: 'USD',
      goldPurityPrices: {},
    },
    exchangeRates: [],
  },
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
  updatePayment: (id: string, data: Omit<ZakahPayment, 'id'>) => void;
  deletePayment: (id: string) => void;
  importState: (data: ZakahState) => void;

  // Multi-person
  people: Person[];
  activePerson: Person;
  switchPerson: (id: string) => void;
  addPerson: (name: string) => void;
  renamePerson: (id: string, name: string) => void;
  deletePerson: (id: string) => void;
  importAppData: (data: StoredAppData) => void;
}

const ZakahContext = createContext<ZakahContextValue | null>(null);

export function ZakahProvider({ children }: { children: React.ReactNode }) {
  const [appData, setAppData] = useState<StoredAppData>(DEFAULT_APP_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    loadAppData().then((saved) => {
      if (saved) setAppData(saved);
      setIsLoaded(true);
    });
  }, []);

  // Persist on every change (skip before load)
  useEffect(() => {
    if (!isLoaded) return;
    saveAppData(appData);
  }, [appData, isLoaded]);

  // Derive ZakahState from active person + shared settings
  const active = appData.people.find((p) => p.id === appData.activePerson) ?? appData.people[0];
  const state: ZakahState = useMemo(
    () => ({
      ...active.data,
      priceSettings: appData.shared.priceSettings,
      exchangeRates: appData.shared.exchangeRates,
    }),
    [active.data, appData.shared]
  );

  const calculation = useMemo(() => calculateZakah(state), [state]);

  function mutatePersonData(updater: (prev: PersonalData) => PersonalData) {
    setAppData((prev) => ({
      ...prev,
      people: prev.people.map((p) =>
        p.id === prev.activePerson ? { ...p, data: updater(p.data) } : p
      ),
    }));
  }

  function mutateShared(updater: (prev: StoredAppData['shared']) => StoredAppData['shared']) {
    setAppData((prev) => ({ ...prev, shared: updater(prev.shared) }));
  }

  // Currency holdings
  const addCurrencyHolding = (data: Omit<CurrencyHolding, 'id'>) =>
    mutatePersonData((d) => ({ ...d, currencyHoldings: [...d.currencyHoldings, { id: generateId(), ...data }] }));

  const updateCurrencyHolding = (id: string, data: Omit<CurrencyHolding, 'id'>) =>
    mutatePersonData((d) => ({
      ...d,
      currencyHoldings: d.currencyHoldings.map((h) => (h.id === id ? { id, ...data } : h)),
    }));

  const deleteCurrencyHolding = (id: string) =>
    mutatePersonData((d) => ({ ...d, currencyHoldings: d.currencyHoldings.filter((h) => h.id !== id) }));

  // Metal holdings
  const addMetalHolding = (data: Omit<MetalHolding, 'id'>) =>
    mutatePersonData((d) => ({ ...d, metalHoldings: [...d.metalHoldings, { id: generateId(), ...data }] }));

  const updateMetalHolding = (id: string, data: Omit<MetalHolding, 'id'>) =>
    mutatePersonData((d) => ({
      ...d,
      metalHoldings: d.metalHoldings.map((h) => (h.id === id ? { id, ...data } : h)),
    }));

  const deleteMetalHolding = (id: string) =>
    mutatePersonData((d) => ({ ...d, metalHoldings: d.metalHoldings.filter((h) => h.id !== id) }));

  // Price settings
  const updatePriceSettings = (data: Partial<PriceSettings>) =>
    mutateShared((s) => ({ ...s, priceSettings: { ...s.priceSettings, ...data } }));

  // Exchange rates
  const addExchangeRate = (data: Omit<ExchangeRate, 'id'>) =>
    mutateShared((s) => ({ ...s, exchangeRates: [...s.exchangeRates, { id: generateId(), ...data }] }));

  const updateExchangeRate = (id: string, data: Omit<ExchangeRate, 'id'>) =>
    mutateShared((s) => ({
      ...s,
      exchangeRates: s.exchangeRates.map((r) => (r.id === id ? { id, ...data } : r)),
    }));

  const deleteExchangeRate = (id: string) =>
    mutateShared((s) => ({ ...s, exchangeRates: s.exchangeRates.filter((r) => r.id !== id) }));

  // Payments
  const logPayment = (data: Omit<ZakahPayment, 'id'>) =>
    mutatePersonData((d) => ({ ...d, payments: [{ id: generateId(), ...data }, ...d.payments] }));

  const updatePayment = (id: string, data: Omit<ZakahPayment, 'id'>) =>
    mutatePersonData((d) => ({
      ...d,
      payments: d.payments.map((p) => (p.id === id ? { id, ...data } : p)),
    }));

  const deletePayment = (id: string) =>
    mutatePersonData((d) => ({ ...d, payments: d.payments.filter((p) => p.id !== id) }));

  // Legacy import — replaces active person's data + shared settings
  const importState = (data: ZakahState) => {
    setAppData((prev) => ({
      ...prev,
      people: prev.people.map((p) =>
        p.id === prev.activePerson
          ? {
              ...p,
              data: {
                currencyHoldings: data.currencyHoldings,
                metalHoldings: data.metalHoldings,
                payments: data.payments,
              },
            }
          : p
      ),
      shared: {
        priceSettings: data.priceSettings,
        exchangeRates: data.exchangeRates,
      },
    }));
  };

  // Multi-person actions
  const switchPerson = (id: string) =>
    setAppData((prev) => ({ ...prev, activePerson: id }));

  const addPerson = (name: string) => {
    const id = generateId();
    setAppData((prev) => ({
      ...prev,
      activePerson: id,
      people: [
        ...prev.people,
        { id, name, data: { currencyHoldings: [], metalHoldings: [], payments: [] } },
      ],
    }));
  };

  const renamePerson = (id: string, name: string) =>
    setAppData((prev) => ({
      ...prev,
      people: prev.people.map((p) => (p.id === id ? { ...p, name } : p)),
    }));

  const deletePerson = (id: string) => {
    setAppData((prev) => {
      if (prev.people.length <= 1) return prev;
      const remaining = prev.people.filter((p) => p.id !== id);
      const nextActive =
        prev.activePerson === id
          ? remaining[0].id
          : prev.activePerson;
      return { ...prev, people: remaining, activePerson: nextActive };
    });
  };

  const importAppData = (data: StoredAppData) => setAppData(data);

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
        updatePayment,
        deletePayment,
        importState,
        people: appData.people,
        activePerson: active,
        switchPerson,
        addPerson,
        renamePerson,
        deletePerson,
        importAppData,
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
