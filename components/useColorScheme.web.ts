import { useThemeToggle } from '@/context/ThemeContext';

export function useColorScheme() {
  return useThemeToggle().colorScheme;
}
