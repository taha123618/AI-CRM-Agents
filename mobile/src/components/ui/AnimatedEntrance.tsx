/**
 * Tactical Command Mobile - AnimatedEntrance Component
 * Provides clean, fluid entering and stagger animations using Reanimated keyframes and layout animations.
 */

import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInRight,
  ZoomIn,
  LinearTransition,
} from 'react-native-reanimated';

export type AnimationType =
  | 'fadeIn'
  | 'fadeInDown'
  | 'fadeInUp'
  | 'fadeInRight'
  | 'zoomIn';

export interface AnimatedEntranceProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  index?: number;
  staggerMs?: number;
  style?: StyleProp<ViewStyle>;
  enableLayoutTransition?: boolean;
}

export const AnimatedEntrance: React.FC<AnimatedEntranceProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 320,
  index = 0,
  staggerMs = 45,
  style,
  enableLayoutTransition = false,
}) => {
  const calculatedDelay = delay + index * staggerMs;

  const getEnteringAnimation = () => {
    switch (animation) {
      case 'fadeIn':
        return FadeIn.duration(duration).delay(calculatedDelay);
      case 'fadeInDown':
        return FadeInDown.duration(duration)
          .delay(calculatedDelay)
          .springify()
          .damping(18)
          .stiffness(240);
      case 'fadeInRight':
        return FadeInRight.duration(duration)
          .delay(calculatedDelay)
          .springify()
          .damping(18)
          .stiffness(240);
      case 'zoomIn':
        return ZoomIn.duration(duration)
          .delay(calculatedDelay)
          .springify()
          .damping(16)
          .stiffness(200);
      case 'fadeInUp':
      default:
        return FadeInUp.duration(duration)
          .delay(calculatedDelay)
          .springify()
          .damping(18)
          .stiffness(240);
    }
  };

  return (
    <Animated.View
      entering={getEnteringAnimation()}
      layout={enableLayoutTransition ? LinearTransition.springify().damping(18) : undefined}
      style={style}
    >
      {children}
    </Animated.View>
  );
};
