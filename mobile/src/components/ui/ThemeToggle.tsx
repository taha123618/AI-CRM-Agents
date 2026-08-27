/**
 * Tactical Command Theme Toggle Component
 * Provides a tactile, animated button to switch between Dark & Light themes with haptic feedback
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { ScalePressable } from '@/components/ui/ScalePressable';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  style?: ViewStyle;
}

export function ThemeToggle({ size = 'md', showLabel = false, style }: ThemeToggleProps) {
  const { isDark, toggleTheme, colors, fonts } = useTheme();

  const handleToggle = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await toggleTheme();
  };

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const buttonDimension = size === 'sm' ? 30 : size === 'lg' ? 44 : 36;

  return (
    <ScalePressable
      scaleTo={0.92}
      onPress={handleToggle}
      style={[
        styles.button,
        {
          minWidth: showLabel ? undefined : buttonDimension,
          height: buttonDimension,
          paddingHorizontal: showLabel ? 12 : 0,
          backgroundColor: colors.surface,
          borderColor: isDark ? colors.border : colors.primary,
        },
        style,
      ]}
      accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      accessibilityRole="button"
    >
      <View style={styles.iconContainer}>
        {isDark ? (
          <Sun size={iconSize} color={colors.primary} />
        ) : (
          <Moon size={iconSize} color={colors.primary} />
        )}
      </View>
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
              fontFamily: fonts.mono,
              fontSize: size === 'sm' ? 10 : 11,
            },
          ]}
        >
          {isDark ? 'LIGHT MODE' : 'DARK MODE'}
        </Text>
      )}
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 2,
    gap: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
