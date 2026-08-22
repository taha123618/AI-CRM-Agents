import { ReactNode } from 'react';

export interface FeatureItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: ReactNode;
  statLabel: string;
  statValue: string;
  accentColor: string;
  badgeText: string;
}

export interface ShowcaseModule {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  description: string;
  icon: ReactNode;
  metrics: { label: string; value: string; trend?: string }[];
  terminalLogs: string[];
  mockupContent: ReactNode;
}

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  badge: string;
  subBullets: string[];
  icon: ReactNode;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  metric: string;
  metricLabel: string;
  avatarText: string;
}

export interface PricingTier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  features: string[];
  ctaLabel: string;
  ctaVariant: 'primary' | 'outline';
  badge?: string;
}

export interface TrustedBrand {
  name: string;
  category: string;
  iconName: string;
}
