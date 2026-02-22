import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@zakah_theme';

interface ThemeContextValue {
  colorScheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );

  // Restore saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setColorScheme(saved);
    });
  }, []);

  function toggleTheme() {
    const next = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(next);
    AsyncStorage.setItem(THEME_KEY, next);
  }

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeToggle() {
  return useContext(ThemeContext);
}
