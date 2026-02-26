import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, I18nManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en, ar, TranslationKey } from '@/constants/translations';

const LANG_KEY = '@zakah_language';

const translations = { en, ar };

interface LanguageContextValue {
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => en[key],
});

function applyRTL(isRTL: boolean) {
  // I18nManager.forceRTL is a no-op on React Native Web, and setting
  // document.dir breaks RN Web's flex layout. RTL on web is handled
  // per-component via the lang value from LanguageContext.
  if (Platform.OS !== 'web') {
    I18nManager.forceRTL(isRTL);
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((saved) => {
      if (saved === 'en' || saved === 'ar') {
        setLangState(saved);
        applyRTL(saved === 'ar');
      }
    });
  }, []);

  function setLang(l: 'en' | 'ar') {
    setLangState(l);
    AsyncStorage.setItem(LANG_KEY, l);
    applyRTL(l === 'ar');
    // Native needs a restart to re-apply I18nManager layout direction;
    // web updates live via document.dir so no alert needed there.
    if (Platform.OS !== 'web') {
      Alert.alert(
        l === 'ar' ? 'تغيير اللغة' : 'Language Changed',
        l === 'ar'
          ? 'أعد تشغيل التطبيق لتطبيق اتجاه التخطيط الجديد.'
          : 'Restart the app to apply the new layout direction.',
      );
    }
  }

  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let str = translations[lang][key] ?? en[key];
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      }
    }
    return str;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
