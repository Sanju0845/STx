import React, { createContext, useContext, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  PRIMARY: string;
  BG: string;
  SURFACE: string;
  ON_SURFACE: string;
  TEXT2: string;
  OUTLINE: string;
  SURF_LOW: string;
  SEC_CONT: string;
  TER_FIXED: string;
  ERR_CONT: string;
  ERR_COLOR: string;
  CARD_BG: string;
  HEADER_BG: string;
  HEADER_BORDER: string;
  PILL_BG: string;
}

const LIGHT: Theme = {
  mode: 'light',
  isDark: false,
  PRIMARY: '#004CD2',
  BG: '#F7F9FB',
  SURFACE: '#FFFFFF',
  ON_SURFACE: '#191C1E',
  TEXT2: '#424656',
  OUTLINE: '#C3C5D8',
  SURF_LOW: '#F2F4F6',
  SEC_CONT: '#DAE2FD',
  TER_FIXED: '#D3E4FE',
  ERR_CONT: '#FFDAD6',
  ERR_COLOR: '#BA1A1A',
  CARD_BG: '#FFFFFF',
  HEADER_BG: 'rgba(255,255,255,0.85)',
  HEADER_BORDER: 'rgba(255,255,255,0.4)',
  PILL_BG: '#FFFFFF',
};

const DARK: Theme = {
  mode: 'dark',
  isDark: true,
  PRIMARY: '#4D8AFF',
  BG: '#0F1117',
  SURFACE: '#1C1F2E',
  ON_SURFACE: '#E8EAF0',
  TEXT2: '#9096A8',
  OUTLINE: '#2E3244',
  SURF_LOW: '#171A27',
  SEC_CONT: '#1A2A4A',
  TER_FIXED: '#1A2F4A',
  ERR_CONT: '#3D1515',
  ERR_COLOR: '#FF6B6B',
  CARD_BG: '#1C1F2E',
  HEADER_BG: 'rgba(15,17,23,0.9)',
  HEADER_BORDER: 'rgba(255,255,255,0.08)',
  PILL_BG: '#1C1F2E',
};

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: LIGHT,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  const toggleTheme = useCallback(() => {
    setMode((m) => (m === 'light' ? 'dark' : 'light'));
  }, []);

  const theme = mode === 'light' ? LIGHT : DARK;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
