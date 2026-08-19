import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'system';

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'app-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored as Theme;
      }
    } catch {
      // Ignore localStorage access errors
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      root.classList.remove('light', 'dark');

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch {
      // Ignore storage write failure
    }
    setThemeState(newTheme);
  };

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
