import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const storage = {
  /**
   * Synchronous read (Web fast-path for instant React state hydration without screen flicker)
   */
  getSync: (key: string): string | null => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (_) {}
    return null;
  },

  /**
   * Asynchronous read (Universal for Native iOS / Android / Expo Go + Web fallback)
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;

      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    } catch (err) {
      console.warn(`storage.getItem error for key ${key}:`, err);
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch (_) {}
      return null;
    }
  },

  /**
   * Universal write (persists to both AsyncStorage and Web localStorage)
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      console.warn(`storage.setItem error for key ${key}:`, err);
    }
  },

  /**
   * Universal remove (clears from both AsyncStorage and Web localStorage)
   */
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.warn(`storage.removeItem error for key ${key}:`, err);
    }
  },
};
