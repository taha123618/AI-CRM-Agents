/**
 * Field Sales Metric Telemetry Card
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'success';
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trend,
  icon,
  variant = 'default',
  style,
}) => {
  const { colors, fonts } = useTheme();

  const getBorderColor = () => {
    switch (variant) {
      case 'primary':
        return colors.borderHighlight;
      case 'danger':
        return colors.danger;
      case 'success':
        return colors.success;
      default:
        return colors.border;
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderColor: getBorderColor(),
          borderWidth: 1,
          borderRadius: 2,
          padding: 14,
          flex: 1,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text
          style={{
            fontSize: 11,
            color: colors.textSecondary,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontFamily: fonts.mono,
          }}
        >
          {label}
        </Text>
        {icon && <View>{icon}</View>}
      </View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          color: colors.text,
          fontFamily: fonts.mono,
          marginBottom: 2,
        }}
      >
        {value}
      </Text>
      {subValue && (
        <Text
          style={{
            fontSize: 11,
            color: trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.textMuted,
            fontFamily: fonts.mono,
          }}
        >
          {subValue}
        </Text>
      )}
    </View>
  );
};
