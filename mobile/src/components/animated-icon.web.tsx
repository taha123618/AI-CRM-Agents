/**
 * Tactical Command Mobile - Web Animated Splash Screen
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, Platform, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

const BOOT_STEPS = [
  'INITIALIZING 9-AGENT SWARM...',
  'SYNCHRONIZING REVENUE TELEMETRY...',
  'ESTABLISHING ENCRYPTED UPLINK...',
  'TACTICAL FIELD COMMAND READY',
];

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const [statusIndex, setStatusIndex] = useState(0);

  const containerOpacity = useSharedValue(1);
  const containerScale = useSharedValue(1);
  const logoScale = useSharedValue(0.85);
  const logoOpacity = useSharedValue(0);

  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.5);

  const progress = useSharedValue(0.08);

  const finishSplash = () => {
    setVisible(false);
  };

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
    logoScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.5)) });

    ring1Scale.value = withRepeat(
      withTiming(2.2, { duration: 1600, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    ring1Opacity.value = withRepeat(
      withTiming(0, { duration: 1600, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );

    progress.value = withTiming(1, {
      duration: 1500,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    });

    const step1 = setTimeout(() => setStatusIndex(1), 400);
    const step2 = setTimeout(() => setStatusIndex(2), 850);
    const step3 = setTimeout(() => setStatusIndex(3), 1250);

    const exitTimer = setTimeout(() => {
      containerScale.value = withTiming(1.04, { duration: 350, easing: Easing.inOut(Easing.ease) });
      containerOpacity.value = withTiming(
        0,
        { duration: 350, easing: Easing.inOut(Easing.ease) },
        (finished) => {
          if (finished) {
            runOnJS(finishSplash)();
          }
        }
      );
    }, 1600);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(exitTimer);
    };
  }, []);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ scale: containerScale.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const { height: screenHeight } = Dimensions.get('window');
  const isCompact = screenHeight < 680;

  if (!visible) return null;

  return (
    <Animated.View style={[styles.splashOverlay, containerAnimatedStyle]}>
      {/* Corner HUD Telemetry Brackets */}
      <View style={[styles.hudCorner, styles.hudTopLeft, isCompact && { top: 12, left: 12 }]}>
        <Text style={styles.hudText}>SYS.LOC // 0x7F-COMMAND</Text>
        {!isCompact && <Text style={styles.hudSubText}>NODE: AUTONOMOUS</Text>}
      </View>

      <View style={[styles.hudCorner, styles.hudTopRight, isCompact && { top: 12, right: 12 }]}>
        <Text style={[styles.hudText, { textAlign: 'right' }]}>SWARM // 9 AGENTS</Text>
        {!isCompact && <Text style={[styles.hudSubText, { textAlign: 'right' }]}>NET: ACTIVE</Text>}
      </View>

      <View style={[styles.hudCorner, styles.hudBottomLeft, isCompact && { bottom: 12, left: 12 }]}>
        {!isCompact && <Text style={styles.hudSubText}>SECURITY: SHA-256 OTP</Text>}
        <Text style={styles.hudText}>v1.0.0 PROD</Text>
      </View>

      <View style={[styles.hudCorner, styles.hudBottomRight, isCompact && { bottom: 12, right: 12 }]}>
        {!isCompact && <Text style={[styles.hudSubText, { textAlign: 'right' }]}>ENV: WEB EMBED</Text>}
        <Text style={[styles.hudText, { textAlign: 'right', color: Colors.dark.primary }]}>
          STATUS: ENGAGED
        </Text>
      </View>

      {/* Center Core */}
      <View style={styles.centerContainer}>
        <View style={[styles.radarWrapper, isCompact && { marginBottom: 14 }]}>
          <Animated.View style={[styles.radarRing, ring1Style]} />
          <Animated.View style={[styles.logoBadge, logoAnimatedStyle]}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <View style={[styles.brandContainer, isCompact && { marginBottom: 20 }]}>
          <Text style={styles.brandTitle}>AI CRM FLEET</Text>
          <Text style={styles.brandSubtitle}>AUTONOMOUS REVENUE INTELLIGENCE</Text>
        </View>

        <View style={styles.telemetryContainer}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{BOOT_STEPS[statusIndex]}</Text>
          </View>

          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, progressAnimatedStyle]} />
          </View>

          <View style={styles.telemetryFooter}>
            <Text style={styles.telemetryCode}>SYS.INITIALIZE</Text>
            <Text style={styles.telemetryPercent}>
              {Math.min(100, Math.round(((statusIndex + 1) / BOOT_STEPS.length) * 100))}%
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export function AnimatedIcon() {
  return null;
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0B0C10',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  hudCorner: {
    position: 'absolute',
    padding: 24,
  },
  hudTopLeft: {
    top: 0,
    left: 0,
  },
  hudTopRight: {
    top: 0,
    right: 0,
  },
  hudBottomLeft: {
    bottom: 0,
    left: 0,
  },
  hudBottomRight: {
    bottom: 0,
    right: 0,
  },
  hudText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#FFB800',
    letterSpacing: 1.2,
  },
  hudSubText: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: '#9AA0A6',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  radarWrapper: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  radarRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#FFB800',
    backgroundColor: 'rgba(255, 184, 0, 0.03)',
  },
  logoBadge: {
    width: 80,
    height: 80,
    backgroundColor: '#0B0C10',
    borderColor: '#FFB800',
    borderWidth: 1.5,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFB800',
    letterSpacing: 1.5,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  telemetryContainer: {
    width: 240,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    backgroundColor: '#00FF9D',
  },
  statusText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFB800',
  },
  telemetryFooter: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  telemetryCode: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: '#9AA0A6',
    letterSpacing: 0.5,
  },
  telemetryPercent: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: '#FFB800',
    fontWeight: '700',
  },
});
