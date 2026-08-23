/**
 * Custom hook for Tactical Command Theme tokens and light/dark color resolution
 */

import { useColorScheme } from 'react-native';
import { Colors, ThemeColors, Fonts, Spacing, Radius, Typography } from '@/constants/theme';

export function useTheme() {
  const systemScheme = useColorScheme();
  const isDark = systemScheme !== 'light';
  const colors: ThemeColors = isDark ? Colors.dark : Colors.light;

  return {
    isDark,
    colors,
    fonts: Fonts,
    spacing: Spacing,
    radius: Radius,
    typography: Typography,
  };
}
