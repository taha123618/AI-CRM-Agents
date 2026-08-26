/**
 * Status, Stage and Risk Factor Badge Primitive
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'muted';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const { colors, fonts } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.badgeHealthHigh, text: colors.success, border: colors.success };
      case 'warning':
        return { bg: colors.badgeHealthMed, text: colors.warning, border: colors.warning };
      case 'danger':
        return { bg: colors.badgeHealthLow, text: colors.danger, border: colors.danger };
      case 'info':
        return { bg: colors.surface, text: colors.secondary, border: colors.secondary };
      case 'purple':
        return { bg: colors.surface, text: colors.purple, border: colors.purple };
      case 'muted':
        return { bg: colors.surface, text: colors.textMuted, border: colors.border };
      case 'primary':
      default:
        return { bg: colors.surface, text: colors.primary, border: colors.primary };
    }
  };

  const scheme = getColors();

  const containerStyle: ViewStyle = {
    backgroundColor: scheme.bg,
    borderColor: scheme.border,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: size === 'sm' ? 6 : 8,
    paddingVertical: size === 'sm' ? 2 : 4,
    alignSelf: 'flex-start',
  };

  const textStyle: TextStyle = {
    color: scheme.text,
    fontSize: size === 'sm' ? 10 : 11,
    fontWeight: '700',
    fontFamily: fonts.mono,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  };

  return (
    <View style={[containerStyle, style]}>
      <Text style={textStyle}>{String(label || '')}</Text>
    </View>
  );
};
