/**
 * Form Input Component with Tactical Command styling
 */

import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  prefix?: string;
  suffix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  prefix,
  suffix,
  style,
  ...props
}) => {
  const { colors, fonts } = useTheme();

  return (
    <View style={[{ marginBottom: 14 }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: colors.textSecondary,
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontFamily: fonts.mono,
          }}
        >
          {String(label)}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: 2,
          paddingHorizontal: 12,
        }}
      >
        {prefix && (
          <Text
            style={{
              color: colors.primary,
              marginRight: 6,
              fontFamily: fonts.mono,
              fontWeight: '700',
            }}
          >
            {prefix}
          </Text>
        )}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[
            {
              flex: 1,
              paddingVertical: 10,
              color: colors.text,
              fontSize: 14,
            },
            style,
          ]}
          {...props}
        />
        {suffix && (
          <Text
            style={{
              color: colors.textMuted,
              marginLeft: 6,
              fontSize: 12,
              fontFamily: fonts.mono,
            }}
          >
            {suffix}
          </Text>
        )}
      </View>
      {error && (
        <Text
          style={{
            fontSize: 11,
            color: colors.danger,
            marginTop: 4,
            fontFamily: fonts.mono,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
