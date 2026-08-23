/**
 * Tactical Command Mobile Design System — Theme & Design Tokens
 * Synchronized with AI CRM Tactical Void Black & Tactical Amber Gold aesthetics.
 */

import { Platform } from 'react-native';

export interface ThemeColors {
  background: string;
  backgroundElement?: string;
  backgroundSelected?: string;
  card: string;
  cardSubtle: string;
  surface: string;
  border: string;
  borderHighlight: string;
  borderMuted: string;
  
  // Brand & Semantic
  primary: string;
  primaryHover: string;
  primaryText: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  purple: string;
  
  // Typography
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // Status Badges
  badgeHealthHigh: string;
  badgeHealthMed: string;
  badgeHealthLow: string;
  badgeStalled: string;
}

export const Colors: { dark: ThemeColors; light: ThemeColors } = {
  dark: {
    background: '#0B0C10',
    backgroundElement: '#1A1D24',
    backgroundSelected: '#252B36',
    card: '#12141A',
    cardSubtle: '#181C24',
    surface: '#1E232E',
    border: '#2A323D',
    borderHighlight: '#FFB800',
    borderMuted: '#1E2530',
    
    // Brand & Semantic
    primary: '#FFB800',         // Tactical Gold
    primaryHover: '#E5A500',
    primaryText: '#0B0C10',
    secondary: '#00E5FF',       // Tactical Cyan
    success: '#00FF9D',         // Emerald Green
    warning: '#FFB800',         // Amber
    danger: '#FF2A54',          // Tactical Red
    purple: '#A855F7',          // AI Purple
    
    // Typography
    text: '#F0F2F5',
    textSecondary: '#A3AEBF',
    textMuted: '#64748B',
    textInverse: '#0B0C10',
    
    // Status Badges
    badgeHealthHigh: '#00FF9D22',
    badgeHealthMed: '#FFB80022',
    badgeHealthLow: '#FF2A5422',
    badgeStalled: '#FF2A5433',
  },
  light: {
    background: '#F4F5F7',
    backgroundElement: '#E4E7EB',
    backgroundSelected: '#D0D5DD',
    card: '#FFFFFF',
    cardSubtle: '#F8FAFC',
    surface: '#EAECEF',
    border: '#D0D5DD',
    borderHighlight: '#D97706',
    borderMuted: '#E2E8F0',
    
    // Brand & Semantic
    primary: '#D97706',         // Deep Amber
    primaryHover: '#B45309',
    primaryText: '#FFFFFF',
    secondary: '#0284C7',       // Ocean Blue
    success: '#059669',         // Deep Green
    warning: '#D97706',         // Deep Amber
    danger: '#DC2626',          // Red
    purple: '#9333EA',
    
    // Typography
    text: '#0B0C10',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
    
    // Status Badges
    badgeHealthHigh: '#05966918',
    badgeHealthMed: '#D9770618',
    badgeHealthLow: '#DC262618',
    badgeStalled: '#DC262622',
  },
};

export type ThemeColor = keyof ThemeColors;
export type ThemeMode = 'dark' | 'light';

export const Fonts = {
  mono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'monospace',
  }),
  sans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  heading: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }),
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 6,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Typography = {
  titleLarge: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  titleMedium: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  titleSmall: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  telemetry: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    fontWeight: '600' as const,
  },
};
