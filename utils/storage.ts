import AsyncStorage from '@react-native-async-storage/async-storage';
import { ZakahState } from '@/types';

const STORAGE_KEY = '@zakah_calculator_v1';

export async function loadState(): Promise<ZakahState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ZakahState;
  } catch {
    return null;
  }
}

export async function saveState(state: ZakahState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // silently fail — data will still be in memory
  }
}
