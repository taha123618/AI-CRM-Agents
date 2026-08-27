/**
 * Custom hook for Tactical Command Theme tokens and light/dark color resolution
 */

import { useColorScheme } from 'react-native';
import { Colors, ThemeColors, Fonts, Spacing, Radius, Typography } from '@/constants/theme';
import { useThemeStore, ThemePreference } from '@/stores/themeStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const themeMode = useThemeStore((state) => state.themeMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);

  const isDark = themeMode === 'system' ? systemScheme !== 'light' : themeMode === 'dark';
  const colors: ThemeColors = isDark ? Colors.dark : Colors.light;

  return {
    isDark,
    themeMode,
    toggleTheme,
    setThemeMode,
    colors,
    fonts: Fonts,
    spacing: Spacing,
    radius: Radius,
    typography: Typography,
  };
}
