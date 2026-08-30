/**
 * Tactical Command Animated Icon & Splash Overlay Component
 * Styled for high-contrast Void Black (#0B0C10) & Tactical Gold (#FFB800) aesthetics.
 */

import React, { useState } from 'react';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Colors } from '@/constants/theme';

const INITIAL_SCALE_FACTOR = Dimensions.get('screen').height / 90;
const DURATION = 600;

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    40: {
      opacity: 1,
    },
    80: {
      opacity: 0,
      easing: Easing.out(Easing.ease),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1.05 }],
      easing: Easing.out(Easing.ease),
    },
  });

  const content = (
    <View style={styles.splashContent}>
      <View style={styles.tacticalLogoBox}>
        <Text style={styles.tacticalLogoText}>AI</Text>
      </View>
      <Text style={styles.splashTitle}>AI CRM FIELD COMMAND</Text>
      <Text style={styles.splashSubtitle}>TACTICAL SALES INTELLIGENCE</Text>
    </View>
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}
    >
      {content}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}
    >
      {content}
    </View>
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.2 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.2 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={keyframe.duration(DURATION)} style={styles.background} />
      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <View style={styles.iconBadge}>
          <Text style={styles.iconBadgeText}>CRM</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tacticalLogoBox: {
    width: 64,
    height: 64,
    backgroundColor: Colors.dark.card,
    borderColor: Colors.dark.primary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tacticalLogoText: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.dark.primary,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  splashTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.dark.text,
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginBottom: 4,
  },
  splashSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.primary,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
    zIndex: 100,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    width: 110,
    height: 110,
    backgroundColor: Colors.dark.surface,
    borderColor: Colors.dark.borderHighlight,
    borderWidth: 1,
    position: 'absolute',
  },
  iconBadge: {
    width: 80,
    height: 80,
    backgroundColor: Colors.dark.card,
    borderColor: Colors.dark.primary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.dark.primary,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
