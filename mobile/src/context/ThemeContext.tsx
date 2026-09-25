import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode, DesignPattern } from '../types';
import { storage } from '../services/storage';

const THEME_STORAGE_KEY = 'salon_theme_mode';

interface ThemeColors {
  background: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentLight: string;
  accentText: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  divider: string;
  glassGlow: string;
  inputBg: string;
  inputBorder: string;
  surfaceMuted: string;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
}

// Soft Neumorphic Light Palette
const lightColors: ThemeColors = {
  background: '#EBEDF2',
  cardBg: '#EBEDF2',
  cardBorder: 'rgba(255, 255, 255, 0.9)',
  textPrimary: '#1E232E',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  accent: '#18181B',
  accentLight: 'rgba(24, 24, 27, 0.08)',
  accentText: '#FFFFFF',
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  divider: 'rgba(209, 213, 219, 0.6)',
  glassGlow: 'rgba(255, 255, 255, 0.95)',
  inputBg: '#E2E5EE',
  inputBorder: 'rgba(255, 255, 255, 0.85)',
  surfaceMuted: '#E2E5EE',
  buttonSecondaryBg: '#E2E5EE',
  buttonSecondaryText: '#374151',
};

// Soft Neumorphic Dark Onyx Palette
const darkColors: ThemeColors = {
  background: '#12141A',
  cardBg: '#161922',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  accent: '#F8FAFC',
  accentLight: 'rgba(255, 255, 255, 0.08)',
  accentText: '#12141A',
  success: '#34D399',
  successBg: 'rgba(52, 211, 153, 0.14)',
  warning: '#FBBF24',
  warningBg: 'rgba(251, 191, 36, 0.14)',
  danger: '#F87171',
  dangerBg: 'rgba(248, 113, 113, 0.14)',
  divider: 'rgba(255, 255, 255, 0.07)',
  glassGlow: 'rgba(255, 255, 255, 0.05)',
  inputBg: '#101217',
  inputBorder: 'rgba(255, 255, 255, 0.08)',
  surfaceMuted: '#1A1E29',
  buttonSecondaryBg: '#1E2330',
  buttonSecondaryText: '#E2E8F0',
};

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  designPattern: DesignPattern;
  setDesignPattern?: (pattern: DesignPattern) => void;
  colors: ThemeColors;
  getCardStyle: () => any;
  getPillStyle: (active?: boolean) => any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Synchronous web hydration for theme mode
  const [mode, setMode] = useState<ThemeMode>(() => {
    const sync = storage.getSync(THEME_STORAGE_KEY);
    if (sync === 'dark' || sync === 'light') return sync;
    return 'light';
  });

  // Universal restoration for native mobile platforms
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await storage.getItem(THEME_STORAGE_KEY);
        if ((stored === 'dark' || stored === 'light') && isMounted) {
          setMode(stored);
        }
      } catch (_) {}
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fixed design pattern style: Soft Neumorphic permanently
  const designPattern: DesignPattern = 'neumorphic';

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      storage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  };

  const colors = mode === 'light' ? lightColors : darkColors;

  const getCardStyle = () => {
    return {
      backgroundColor: colors.cardBg,
      borderColor: mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.08)',
      borderTopColor: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.12)',
      borderLeftColor: mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.12)',
      borderWidth: 1.5,
      borderRadius: 22,
      shadowColor: mode === 'light' ? '#B8B9C4' : '#000000',
      shadowOffset: { width: 5, height: 6 },
      shadowOpacity: mode === 'light' ? 0.38 : 0.55,
      shadowRadius: 10,
      elevation: 4,
    };
  };

  const getPillStyle = (active = false) => {
    if (active) {
      return {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
        borderWidth: 1,
        borderRadius: 20,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 3,
      };
    }
    return {
      backgroundColor: colors.surfaceMuted,
      borderColor: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.06)',
      borderWidth: 1,
      borderRadius: 20,
      shadowColor: mode === 'light' ? '#B8BDCF' : '#000000',
      shadowOffset: { width: 2, height: 3 },
      shadowOpacity: mode === 'light' ? 0.3 : 0.4,
      shadowRadius: 4,
      elevation: 2,
    };
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleMode,
        designPattern,
        setDesignPattern: () => {}, // No-op: Soft neumorphic is fixed
        colors,
        getCardStyle,
        getPillStyle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
