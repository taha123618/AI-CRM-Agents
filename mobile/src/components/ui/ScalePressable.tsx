/**
 * Tactical Command Mobile - ScalePressable Component
 * Provides smooth 60fps micro-spring scaling and haptic feedback on touch.
 */

import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { Pressable, PressableProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ScalePressableProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  enableHaptics?: boolean;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
}

export const ScalePressable: React.FC<ScalePressableProps> = ({
  children,
  style,
  scaleTo = 0.97,
  enableHaptics = true,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
  onPressIn,
  onPressOut,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = (event: any) => {
    scale.value = withSpring(scaleTo, {
      damping: 18,
      stiffness: 300,
      mass: 0.8,
    });
    if (enableHaptics) {
      try {
        Haptics.impactAsync(hapticStyle);
      } catch {}
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    scale.value = withSpring(1, {
      damping: 18,
      stiffness: 300,
      mass: 0.8,
    });
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
};
