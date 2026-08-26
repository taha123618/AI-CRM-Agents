/**
 * Tactical Command Mobile Button Primitive
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const { colors, fonts } = useTheme();

  const handlePress = () => {
    if (disabled || isLoading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 2,
      borderWidth: 1,
      borderColor: 'transparent',
    };

    // Sizes
    if (size === 'sm') {
      base.paddingVertical = 6;
      base.paddingHorizontal = 12;
    } else if (size === 'lg') {
      base.paddingVertical = 14;
      base.paddingHorizontal = 20;
    } else {
      base.paddingVertical = 10;
      base.paddingHorizontal = 16;
    }

    // Variants
    switch (variant) {
      case 'primary':
        base.backgroundColor = colors.primary;
        base.borderColor = colors.primary;
        break;
      case 'secondary':
        base.backgroundColor = colors.surface;
        base.borderColor = colors.border;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderColor = colors.borderHighlight;
        break;
      case 'danger':
        base.backgroundColor = colors.danger;
        base.borderColor = colors.danger;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        base.borderColor = 'transparent';
        break;
    }

    if (disabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    let base: TextStyle = {
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      fontSize: size === 'sm' ? 12 : size === 'lg' ? 15 : 13,
      fontFamily: fonts.mono,
    };

    switch (variant) {
      case 'primary':
        base.color = colors.primaryText;
        break;
      case 'secondary':
        base.color = colors.text;
        break;
      case 'outline':
        base.color = colors.borderHighlight;
        break;
      case 'danger':
        base.color = '#FFFFFF';
        break;
      case 'ghost':
        base.color = colors.textSecondary;
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || isLoading}
      style={[getContainerStyle(), style]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.primaryText : colors.text}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyle(), icon ? { marginLeft: 8 } : undefined, textStyle]}>
            {String(title ?? '')}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
