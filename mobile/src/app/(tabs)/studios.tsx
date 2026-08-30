/**
 * Tactical Command Mobile AI Studios & Modules Hub
 * Direct access to all 17 frontend feature studios within the Tab Navigator
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Sparkles,
  Search,
  Bot,
  BarChart3,
  Compass,
  Zap,
  Mic,
  MessageSquare,
  Mail,
  TrendingUp,
  Calendar,
  Sliders,
  FileSpreadsheet,
  Globe,
  Shield,
  Users,
  Briefcase,
  GitBranch,
  Layers,
  ArrowRight,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AnimatedEntrance } from '@/components/ui/AnimatedEntrance';
import { ScalePressable } from '@/components/ui/ScalePressable';
import { StatCard } from '@/components/ui/StatCard';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface StudioItem {
  id: string;
  title: string;
  category: 'CORE CRM' | 'AI INTELLIGENCE' | 'SALES OUTREACH' | 'GOVERNANCE';
  desc: string;
  route: string;
  icon: any;
  badge: string;
  badgeVariant: 'primary' | 'success' | 'warning' | 'info' | 'purple';
}

const ALL_STUDIOS: StudioItem[] = [
  // CORE CRM
  {
    id: 'deals',
    title: 'DEALS & PIPELINE',
    category: 'CORE CRM',
    desc: 'Pipeline stages, revenue hazard rates, health scores & dynamic custom fields.',
    route: '/(tabs)/deals',
    icon: Briefcase,
    badge: 'PIPELINE',
    badgeVariant: 'primary',
  },
  {
    id: 'leads',
    title: 'LEADS & BANT RADAR',
    category: 'CORE CRM',
    desc: 'BANT scoring radar, WhatsApp auto-pilot qualification, and 1-click deal conversion.',
    route: '/(tabs)/leads',
    icon: Users,
    badge: 'INBOUND',
    badgeVariant: 'info',
  },
  {
    id: 'customers',
    title: 'CUSTOMER 360 & CHURN',
    category: 'CORE CRM',
    desc: 'MRR/ARR breakdown, health telemetry, and 1-click autonomous retention playbooks.',
    route: '/(tabs)/customers',
    icon: Compass,
    badge: 'RETENTION',
    badgeVariant: 'success',
  },
  {
    id: 'activities',
    title: 'VOICE NOTES & DEBRIEFS',
    category: 'CORE CRM',
    desc: 'Captured audio notes, buyer intent scores, and extracted action item checklists.',
    route: '/(tabs)/activities',
    icon: Mic,
    badge: 'AUDIO',
    badgeVariant: 'purple',
  },

  // AI INTELLIGENCE
  {
    id: 'war-room',
    title: 'DEAL WAR ROOM',
    category: 'AI INTELLIGENCE',
    desc: 'Multi-agent consensus verdicts, SWOT matrices, live competitor battlecards, and 1-click proposals.',
    route: '/(tabs)/war-room',
    icon: Sparkles,
    badge: 'WAR ROOM',
    badgeVariant: 'primary',
  },
  {
    id: 'forecasting',
    title: 'MONTE CARLO FORECAST',
    category: 'AI INTELLIGENCE',
    desc: '10,000 stochastic ARR simulation runs with P10/P50/P90 confidence boundaries.',
    route: '/(tabs)/forecasting',
    icon: BarChart3,
    badge: 'SIMULATION',
    badgeVariant: 'success',
  },
  {
    id: 'voice-ai',
    title: 'VOICE AI INTELLIGENCE',
    category: 'AI INTELLIGENCE',
    desc: 'Real-time speech turn intent scoring, dynamic objection battlecards, and CRM synthesis.',
    route: '/(tabs)/voice-ai',
    icon: Mic,
    badge: 'REALTIME',
    badgeVariant: 'purple',
  },
  {
    id: 'journey',
    title: 'AUTONOMOUS JOURNEY',
    category: 'AI INTELLIGENCE',
    desc: 'Telemetry lifecycle stages (onboarding, adoption, renewal) and proactive retention swarms.',
    route: '/(tabs)/journey',
    icon: Compass,
    badge: 'LIFECYCLE',
    badgeVariant: 'info',
  },
  {
    id: 'agents',
    title: 'AI SWARM FLEET',
    category: 'AI INTELLIGENCE',
    desc: 'Live telemetry across all 9 specialized BaseAgents with 1-click Swarm Pulse heartbeat.',
    route: '/(tabs)/agents',
    icon: Bot,
    badge: '9 AGENTS',
    badgeVariant: 'primary',
  },
  {
    id: 'custom-agents',
    title: 'CUSTOM AGENT BUILDER',
    category: 'AI INTELLIGENCE',
    desc: 'No-code visual creator for custom prompt engineering, toolkits, and trigger bindings.',
    route: '/(tabs)/custom-agents',
    icon: Sliders,
    badge: 'NO-CODE',
    badgeVariant: 'warning',
  },

  // SALES OUTREACH
  {
    id: 'sequences',
    title: 'AI SDR SEQUENCES',
    category: 'SALES OUTREACH',
    desc: 'Omnichannel multi-touch outreach cadences (Email, WhatsApp, Voice AI) with cohort enrollment.',
    route: '/(tabs)/sequences',
    icon: Zap,
    badge: 'CADENCE',
    badgeVariant: 'primary',
  },
  {
    id: 'whatsapp',
    title: 'WHATSAPP AUTO-PILOT',
    category: 'SALES OUTREACH',
    desc: '24/7 AI lead qualification, customer support chats, and template broadcast campaigns.',
    route: '/(tabs)/whatsapp',
    icon: MessageSquare,
    badge: '24/7 HUB',
    badgeVariant: 'success',
  },
  {
    id: 'emails',
    title: 'EMAIL INTELLIGENCE',
    category: 'SALES OUTREACH',
    desc: 'Synthesized inbox, sentiment badges, AI draft composer, and background task queue.',
    route: '/(tabs)/emails',
    icon: Mail,
    badge: 'INBOX',
    badgeVariant: 'info',
  },
  {
    id: 'meetings',
    title: 'MEETINGS & DOSSIERS',
    category: 'SALES OUTREACH',
    desc: 'Calendar timeline, acceptance telemetry, and 1-click AI participant briefing dossiers.',
    route: '/(tabs)/meetings',
    icon: Calendar,
    badge: 'BRIEFING',
    badgeVariant: 'primary',
  },

  // GOVERNANCE & ANALYTICS
  {
    id: 'analytics',
    title: 'EXECUTIVE ANALYTICS',
    category: 'GOVERNANCE',
    desc: 'Fleet win rates, deal cycle duration, daily ARR velocity, and top rep leaderboard.',
    route: '/(tabs)/analytics',
    icon: TrendingUp,
    badge: 'VELOCITY',
    badgeVariant: 'success',
  },
  {
    id: 'workflows',
    title: 'WORKFLOW TRIGGERS',
    category: 'GOVERNANCE',
    desc: 'Multi-agent workflow triggers, webhook execution logs, and full CRUD automation.',
    route: '/(tabs)/workflows',
    icon: GitBranch,
    badge: 'AUTOMATION',
    badgeVariant: 'primary',
  },
  {
    id: 'reports',
    title: 'REPORTS & CSV EXPORT',
    category: 'GOVERNANCE',
    desc: '1-click formula-sanitized CSV exports for Deals, Leads, Voice Debriefs, and Audit Logs.',
    route: '/(tabs)/reports',
    icon: FileSpreadsheet,
    badge: 'EXPORT',
    badgeVariant: 'info',
  },
  {
    id: 'multi-language',
    title: 'MULTI-LANGUAGE I18N',
    category: 'GOVERNANCE',
    desc: '8 locale switchers, RTL/LTR layout synchronization, and dynamic LLM translation cache.',
    route: '/(tabs)/multi-language',
    icon: Globe,
    badge: '8 LOCALES',
    badgeVariant: 'purple',
  },
  {
    id: 'settings',
    title: 'PLATFORM GOVERNANCE',
    category: 'GOVERNANCE',
    desc: 'RBAC user management, server metrics, outbound webhooks with SSRF defense, and audit trails.',
    route: '/(tabs)/settings',
    icon: Shield,
    badge: 'SECURITY',
    badgeVariant: 'warning',
  },
  {
    id: 'explore',
    title: 'FLEET SHOWCASE & ROI',
    category: 'GOVERNANCE',
    desc: 'SaaS product capability explorer and live interactive sales fleet ARR accelerator model.',
    route: '/(tabs)/explore',
    icon: Layers,
    badge: 'SHOWCASE',
    badgeVariant: 'primary',
  },
];

export default function StudiosHubScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'CORE CRM', 'AI INTELLIGENCE', 'SALES OUTREACH', 'GOVERNANCE'];

  const filteredStudios = ALL_STUDIOS.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.badge.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Tactical Bar */}
      <View
        style={{
          paddingTop: 54,
          paddingBottom: 14,
          paddingHorizontal: 16,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ fontSize: 9, fontFamily: fonts.mono, color: colors.textMuted, textTransform: 'uppercase' }}>
            AUTONOMOUS PLATFORM
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
            AI COMMAND STUDIOS
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ThemeToggle size="sm" />
          <Badge label="17 MODULES" variant="primary" />
        </View>
      </View>

      {/* Search & Filter Bar */}
      <View style={{ backgroundColor: colors.card, paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 10,
            paddingVertical: 6,
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Search size={14} color={colors.textMuted} />
          <TextInput
            placeholder="FILTER STUDIOS & MODULES..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              color: colors.text,
              fontSize: 11,
              fontFamily: fonts.mono,
              padding: 0,
            }}
          />
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <ScalePressable
                key={cat}
                scaleTo={0.94}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setSelectedCategory(cat);
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 2,
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                  borderWidth: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    fontFamily: fonts.mono,
                    color: active ? colors.primaryText : colors.textSecondary,
                  }}
                >
                  {cat}
                </Text>
              </ScalePressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid of Studios */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 10, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        {filteredStudios.map((studio, index) => {
          const Icon = studio.icon;
          return (
            <AnimatedEntrance key={studio.id} animation="fadeInUp" index={index} staggerMs={35}>
              <ScalePressable
                scaleTo={0.98}
                onPress={() => router.push(studio.route as any)}
              >
                <Card style={{ padding: 14, marginBottom: 0 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          backgroundColor: colors.surface,
                          borderWidth: 1,
                          borderColor: colors.border,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Icon size={16} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                          {studio.title}
                        </Text>
                        <Text style={{ fontSize: 9, fontFamily: fonts.mono, color: colors.textMuted }}>
                          {studio.category}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Badge label={studio.badge} variant={studio.badgeVariant} size="sm" />
                      <ArrowRight size={14} color={colors.textMuted} />
                    </View>
                  </View>

                  <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, lineHeight: 16 }}>
                    {studio.desc}
                  </Text>
                </Card>
              </ScalePressable>
            </AnimatedEntrance>
          );
        })}
      </ScrollView>
    </View>
  );
}
