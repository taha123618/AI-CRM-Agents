/**
 * Tactical Command Mobile Card Primitive
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ScalePressable } from './ScalePressable';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'highlight' | 'subtle' | 'danger';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
}) => {
  const { colors } = useTheme();

  const getBorderColor = () => {
    switch (variant) {
      case 'highlight':
        return colors.borderHighlight;
      case 'danger':
        return colors.danger;
      case 'subtle':
        return colors.borderMuted;
      default:
        return colors.border;
    }
  };

  const cardStyle: ViewStyle = {
    backgroundColor: variant === 'subtle' ? colors.cardSubtle : colors.card,
    borderColor: getBorderColor(),
    borderWidth: 1,
    borderRadius: 2,
    padding: 16,
    marginBottom: 12,
  };

  if (onPress) {
    return (
      <ScalePressable
        scaleTo={0.98}
        onPress={onPress}
        style={[cardStyle, style]}
      >
        {children}
      </ScalePressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
