/**
 * Tactical Command Mobile AI Deal War Room & Strategy Studio
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Target, Award, ArrowLeft, Swords, Sparkles, FileText, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { AnimatedEntrance } from '@/components/ui/AnimatedEntrance';
import { ScalePressable } from '@/components/ui/ScalePressable';
import { RadarPulse } from '@/components/ui/RadarPulse';

export default function WarRoomScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'verdict' | 'swot' | 'competitors' | 'proposal'>('verdict');
  const [proposalSent, setProposalSent] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await api.getWarRoomStrategy();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

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
            MULTI-AGENT CONSENSUS
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            DEAL WAR ROOM
          </Text>
        </View>
      </View>

      {/* Feature Navigation Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {(['verdict', 'swot', 'competitors', 'proposal'] as const).map((tab) => (
          <ScalePressable
            key={tab}
            scaleTo={0.95}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab ? colors.primary : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                fontFamily: fonts.mono,
                color: activeTab === tab ? colors.primary : colors.textMuted,
                textTransform: 'uppercase',
              }}
            >
              {tab}
            </Text>
          </ScalePressable>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
      >
        {activeTab === 'verdict' && (
          <AnimatedEntrance animation="fadeInUp" delay={40} style={{ gap: 14 }}>
            <Card variant="highlight" style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <RadarPulse size={10} color={colors.primary} />
                  <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary }}>
                    SWARM CONSENSUS VERDICT
                  </Text>
                </View>
                <Badge label={`${data?.consensus?.confidence || 92}% CONFIDENCE`} variant="success" />
              </View>

              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 8 }}>
                {data?.consensus?.verdict || 'GO / FAST-TRACK'}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, fontFamily: fonts.mono, lineHeight: 18 }}>
                {data?.consensus?.strategy || 'Target Enterprise Tier with 15% discount for upfront annual commitment.'}
              </Text>
            </Card>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <StatCard label="CLOSE PROBABILITY" value="88%" subValue="+14% this week" trend="up" variant="success" />
              </View>
              <View style={{ flex: 1 }}>
                <StatCard label="AVG STAGE TIME" value="3.8d" subValue="-2.1d vs avg" trend="up" variant="primary" />
              </View>
            </View>

            <Card style={{ padding: 14 }}>
              <Text style={{ fontSize: 10, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted, marginBottom: 8 }}>
                RECOMMENDED PLAYBOOK:
              </Text>
              <Text style={{ fontSize: 11, color: colors.text, fontFamily: fonts.mono, lineHeight: 16 }}>
                1. Schedule executive sync with VP Engineering.
                2. Highlight zero-latency voice debrief studio & offline sync.
                3. Deliver customized Proposal Tier with SLA guarantees.
              </Text>
            </Card>
          </AnimatedEntrance>
        )}

        {activeTab === 'swot' && (
          <AnimatedEntrance animation="fadeInUp" delay={40} style={{ gap: 12 }}>
            <Card style={{ padding: 14, borderColor: colors.success }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.success, marginBottom: 6 }}>
                STRENGTHS (OUR ADVANTAGE)
              </Text>
              {data?.swot?.strengths?.map((s: string, idx: number) => (
                <Text key={idx} style={{ fontSize: 11, color: colors.text, fontFamily: fonts.mono, marginVertical: 2 }}>
                  + {s}
                </Text>
              ))}
            </Card>

            <Card style={{ padding: 14, borderColor: colors.danger }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.danger, marginBottom: 6 }}>
                WEAKNESSES & RISKS
              </Text>
              {data?.swot?.weaknesses?.map((w: string, idx: number) => (
                <Text key={idx} style={{ fontSize: 11, color: colors.text, fontFamily: fonts.mono, marginVertical: 2 }}>
                  - {w}
                </Text>
              ))}
            </Card>

            <Card style={{ padding: 14, borderColor: colors.primary }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary, marginBottom: 6 }}>
                OPPORTUNITIES
              </Text>
              {data?.swot?.opportunities?.map((o: string, idx: number) => (
                <Text key={idx} style={{ fontSize: 11, color: colors.text, fontFamily: fonts.mono, marginVertical: 2 }}>
                  * {o}
                </Text>
              ))}
            </Card>
          </AnimatedEntrance>
        )}

        {activeTab === 'competitors' && (
          <AnimatedEntrance animation="fadeInUp" delay={40} style={{ gap: 12 }}>
            {data?.competitors?.map((comp: any, idx: number) => (
              <Card key={idx} variant="subtle" style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>
                    {comp.name}
                  </Text>
                  <Badge label={`${comp.threat_level?.toUpperCase()} THREAT`} variant={comp.threat_level === 'high' ? 'danger' : 'warning'} />
                </View>
                <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 6 }}>
                  Our Win Strategy: {comp.counter_strategy}
                </Text>
                <View style={{ backgroundColor: colors.surface, padding: 8, borderWidth: 1, borderColor: colors.borderMuted }}>
                  <Text style={{ fontSize: 10, color: colors.primary, fontFamily: fonts.mono }}>
                    KILLER ARGUMENT: {comp.killer_pitch}
                  </Text>
                </View>
              </Card>
            ))}
          </AnimatedEntrance>
        )}

        {activeTab === 'proposal' && (
          <AnimatedEntrance animation="fadeInUp" delay={40} style={{ gap: 14 }}>
            <Card variant="highlight" style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <FileText size={16} color={colors.primary} />
                <Text style={{ fontSize: 12, fontFamily: fonts.mono, fontWeight: '800', color: colors.primary }}>
                  1-CLICK PROPOSAL STUDIO
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                Autonomous Enterprise Agreement
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 12 }}>
                Generated from multi-agent pricing matrix, risk profile, and stakeholder consensus.
              </Text>

              {proposalSent ? (
                <View style={{ backgroundColor: colors.surface, padding: 12, borderColor: colors.success, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color={colors.success} />
                  <Text style={{ fontSize: 11, color: colors.success, fontFamily: fonts.mono, fontWeight: '700' }}>
                    PROPOSAL DISPATCHED TO BUYING COMMITTEE
                  </Text>
                </View>
              ) : (
                <Button
                  title="GENERATE & SEND PROPOSAL"
                  variant="primary"
                  size="lg"
                  icon={<Sparkles size={14} color={colors.primaryText} />}
                  onPress={() => setProposalSent(true)}
                />
              )}
            </Card>
          </AnimatedEntrance>
        )}
      </ScrollView>
    </View>
  );
}
