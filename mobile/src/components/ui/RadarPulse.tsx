/**
 * Tactical Command Mobile - RadarPulse Indicator
 * Smooth continuous radar wave / pulse ring animation for active swarms and live agents.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

export interface RadarPulseProps {
  size?: number;
  color?: string;
  active?: boolean;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const RadarPulse: React.FC<RadarPulseProps> = ({
  size = 12,
  color,
  active = true,
  style,
  children,
}) => {
  const { colors } = useTheme();
  const pulseColor = color || colors.primary;

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withTiming(2.2, {
          duration: 1800,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false
      );
      opacity.value = withRepeat(
        withTiming(0, {
          duration: 1800,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false
      );
    } else {
      scale.value = 1;
      opacity.value = 0;
    }
  }, [active]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      {active && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: pulseColor,
              borderRadius: size,
            },
            pulseStyle,
          ]}
        />
      )}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: pulseColor,
        }}
      >
        {children}
      </View>
    </View>
  );
};
