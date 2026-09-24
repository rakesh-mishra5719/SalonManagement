import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeMode, DesignPattern } from '../types';

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

const lightColors: ThemeColors = {
  background: '#F9F9FB',
  cardBg: 'rgba(255, 255, 255, 0.72)',
  cardBorder: 'rgba(230, 230, 235, 0.8)',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  accent: '#18181B',
  accentLight: 'rgba(24, 24, 27, 0.06)',
  accentText: '#FFFFFF',
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.10)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.10)',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.10)',
  divider: 'rgba(229, 231, 235, 0.7)',
  glassGlow: 'rgba(255, 255, 255, 0.95)',
  inputBg: 'rgba(255, 255, 255, 0.85)',
  inputBorder: 'rgba(220, 225, 235, 0.9)',
  surfaceMuted: '#F3F4F6',
  buttonSecondaryBg: 'rgba(240, 242, 245, 0.8)',
  buttonSecondaryText: '#374151',
};

const darkColors: ThemeColors = {
  background: '#0B0D13',
  cardBg: 'rgba(20, 24, 33, 0.70)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  accent: '#F9FAFB',
  accentLight: 'rgba(255, 255, 255, 0.08)',
  accentText: '#111827',
  success: '#34D399',
  successBg: 'rgba(52, 211, 153, 0.12)',
  warning: '#FBBF24',
  warningBg: 'rgba(251, 191, 36, 0.12)',
  danger: '#F87171',
  dangerBg: 'rgba(248, 113, 113, 0.12)',
  divider: 'rgba(255, 255, 255, 0.07)',
  glassGlow: 'rgba(255, 255, 255, 0.05)',
  inputBg: 'rgba(25, 30, 42, 0.75)',
  inputBorder: 'rgba(255, 255, 255, 0.12)',
  surfaceMuted: '#151922',
  buttonSecondaryBg: 'rgba(30, 35, 48, 0.8)',
  buttonSecondaryText: '#E5E7EB',
};

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  designPattern: DesignPattern;
  setDesignPattern: (pattern: DesignPattern) => void;
  colors: ThemeColors;
  getCardStyle: () => any;
  getPillStyle: (active?: boolean) => any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Minimalist light mode default as requested
  const [mode, setMode] = useState<ThemeMode>('light');
  // Glassmorphism design pattern default, user can change in settings
  const [designPattern, setDesignPattern] = useState<DesignPattern>('glassmorphism');

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = mode === 'light' ? lightColors : darkColors;

  const getCardStyle = () => {
    if (designPattern === 'glassmorphism') {
      return {
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 20,
        shadowColor: mode === 'light' ? '#000000' : '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: mode === 'light' ? 0.05 : 0.4,
        shadowRadius: 16,
        elevation: 3,
        // Backdrop filter effect for web
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      };
    } else if (designPattern === 'flat-minimal') {
      return {
        backgroundColor: mode === 'light' ? '#FFFFFF' : '#141821',
        borderColor: mode === 'light' ? '#E5E7EB' : '#272F3E',
        borderWidth: 1,
        borderRadius: 12,
        shadowOpacity: 0,
        elevation: 0,
      };
    } else {
      // neumorphic
      return {
        backgroundColor: mode === 'light' ? '#F4F5F8' : '#13161F',
        borderColor: mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.06)',
        borderWidth: 1.5,
        borderRadius: 24,
        shadowColor: mode === 'light' ? '#B8B9C0' : '#000000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: mode === 'light' ? 0.35 : 0.5,
        shadowRadius: 8,
        elevation: 4,
      };
    }
  };

  const getPillStyle = (active = false) => {
    if (active) {
      return {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
        borderWidth: 1,
      };
    }
    return {
      backgroundColor: designPattern === 'glassmorphism' ? colors.cardBg : colors.surfaceMuted,
      borderColor: colors.cardBorder,
      borderWidth: 1,
    };
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleMode,
        designPattern,
        setDesignPattern,
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
