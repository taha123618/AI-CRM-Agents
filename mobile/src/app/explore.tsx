/**
 * Tactical Command Mobile SaaS Showcase & Product Explorer
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Compass,
  ArrowLeft,
  Bot,
  Zap,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

const PILLARS = [
  {
    title: 'MULTI-AGENT CONSENSUS',
    desc: 'Autonomous swarms evaluate buyer intent, stage hazard rates, and competitive differentiation in real-time.',
    icon: Bot,
    metric: '9 SPECIALIZED AGENTS',
  },
  {
    title: 'STOCHASTIC FORECASTING',
    desc: 'Monte Carlo simulations running 10,000 iterations for P10/P50/P90 ARR confidence bounds.',
    icon: BarChart3,
    metric: '98.4% CONFIDENCE',
  },
  {
    title: 'AUDIO INTELLIGENCE STUDIO',
    desc: 'Speech turn analysis, dynamic objection battlecards, and 60-second automated CRM synthesis.',
    icon: Sparkles,
    metric: '< 500MS INFERENCE',
  },
  {
    title: '24/7 WHATSAPP AUTO-PILOT',
    desc: 'Omnichannel qualification and customer support with human co-pilot override.',
    icon: MessageSquare,
    metric: '100% SLA RETENTION',
  },
];

export default function ExploreScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  // ROI Calculator State
  const [repCount, setRepCount] = useState(10);
  const [avgDeal, setAvgDeal] = useState(25000);

  const hoursSavedPerYear = repCount * 520;
  const arrGain = Math.round(repCount * avgDeal * 0.35);

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 11, fontFamily: fonts.mono, fontWeight: '700' }}>
            COMMAND
          </Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 9, fontFamily: fonts.mono, color: colors.textMuted, textTransform: 'uppercase' }}>
            PRODUCT OVERVIEW
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            FLEET SHOWCASE
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 14, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Tactical Hero Banner */}
        <Card variant="highlight" style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Cpu size={16} color={colors.primary} />
            <Text style={{ fontSize: 10, fontFamily: fonts.mono, fontWeight: '800', color: colors.primary, textTransform: 'uppercase' }}>
              AUTONOMOUS MULTI-AGENT SWARM CRM
            </Text>
          </View>

          <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 8, letterSpacing: -0.5 }}>
            THE INTELLIGENCE ENGINE FOR ENTERPRISE SALES
          </Text>

          <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, lineHeight: 16, marginBottom: 14 }}>
            Eliminate 80% of manual CRM data entry with real-time audio intelligence, stochastic revenue forecasting, and proactive churn retention swarms.
          </Text>

          <Button
            title="LAUNCH FIELD COMMAND DASHBOARD"
            variant="primary"
            size="md"
            onPress={() => router.push('/(tabs)' as any)}
          />
        </Card>

        {/* Core Architecture Telemetry */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <StatCard label="AI MULTIPLIER" value="4.8X" subValue="Rep Velocity Gain" trend="up" variant="success" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard label="SWARM LATENCY" value="28MS" subValue="Zero-Lag Inference" trend="up" variant="primary" />
          </View>
        </View>

        {/* 4 Specialized Capability Pillars */}
        <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted }}>
          SPECIALIZED SYSTEM PILLARS:
        </Text>

        <View style={{ gap: 10 }}>
          {PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <Card key={idx} style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Icon size={16} color={colors.primary} />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                      {p.title}
                    </Text>
                  </View>
                  <Badge label={p.metric} variant="primary" size="sm" />
                </View>
                <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, lineHeight: 16 }}>
                  {p.desc}
                </Text>
              </Card>
            );
          })}
        </View>

        {/* Interactive ROI Calculator */}
        <Card style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <TrendingUp size={16} color={colors.primary} />
            <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary }}>
              INTERACTIVE REVENUE ROI CALCULATOR
            </Text>
          </View>

          <Text style={{ fontSize: 10, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 12 }}>
            Adjust sales fleet size to calculate projected annual ARR acceleration.
          </Text>

          {/* Quick Steppers */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 11, fontFamily: fonts.mono, color: colors.text }}>
              SALES REPS: <Text style={{ color: colors.primary, fontWeight: '800' }}>{repCount}</Text>
            </Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                onPress={() => setRepCount(Math.max(1, repCount - 5))}
                style={{ backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: colors.border }}
              >
                <Text style={{ color: colors.text, fontFamily: fonts.mono, fontWeight: '800' }}>-5</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRepCount(repCount + 5)}
                style={{ backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: colors.border }}
              >
                <Text style={{ color: colors.text, fontFamily: fonts.mono, fontWeight: '800' }}>+5</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ backgroundColor: colors.surface, padding: 12, borderWidth: 1, borderColor: colors.border, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textMuted }}>HOURS SAVED / YEAR:</Text>
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, color: colors.text, fontWeight: '700' }}>
                {hoursSavedPerYear.toLocaleString()} hrs
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textMuted }}>PROJECTED ARR EXPANSION:</Text>
              <Text style={{ fontSize: 13, fontFamily: fonts.mono, color: colors.success, fontWeight: '800' }}>
                +${arrGain.toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
