import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredAppData, ZakahState } from '@/types';
import { generateId } from '@/utils/zakahCalculations';

const LEGACY_KEY = '@zakah_calculator_v1';
const STORAGE_KEY = '@zakah_calculator_v2';

export function isLegacyState(obj: unknown): obj is ZakahState {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Record<string, unknown>;
  return (
    !('version' in s) &&
    Array.isArray(s.currencyHoldings) &&
    Array.isArray(s.metalHoldings) &&
    Array.isArray(s.payments) &&
    typeof s.priceSettings === 'object'
  );
}

export function isStoredAppData(obj: unknown): obj is StoredAppData {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Record<string, unknown>;
  return s.version === 2 && Array.isArray(s.people) && typeof s.activePerson === 'string';
}

function migrateV1ToV2(legacy: ZakahState): StoredAppData {
  const personId = generateId();
  return {
    version: 2,
    activePerson: personId,
    people: [
      {
        id: personId,
        name: 'Me',
        data: {
          currencyHoldings: legacy.currencyHoldings,
          metalHoldings: legacy.metalHoldings,
          payments: legacy.payments,
        },
      },
    ],
    shared: {
      priceSettings: legacy.priceSettings,
      exchangeRates: legacy.exchangeRates,
    },
  };
}

export async function loadAppData(): Promise<StoredAppData | null> {
  try {
    // Try v2 first
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isStoredAppData(parsed)) return parsed;
    }

    // Fall back to v1 migration
    const legacy = await AsyncStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (isLegacyState(parsed)) {
        const migrated = migrateV1ToV2(parsed);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        await AsyncStorage.removeItem(LEGACY_KEY);
        return migrated;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function saveAppData(data: StoredAppData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silently fail — data will still be in memory
  }
}
