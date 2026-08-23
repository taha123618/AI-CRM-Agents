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
          <TouchableOpacity
            key={tab}
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
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
      >
        {activeTab === 'verdict' && (
          <View style={{ gap: 14 }}>
            <Card variant="highlight" style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Shield size={18} color={colors.primary} />
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
          </View>
        )}

        {activeTab === 'swot' && (
          <View style={{ gap: 12 }}>
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
                THREATS (EXTERNAL RISKS)
              </Text>
              {data?.swot?.threats?.map((t: string, idx: number) => (
                <Text key={idx} style={{ fontSize: 11, color: colors.text, fontFamily: fonts.mono, marginVertical: 2 }}>
                  ! {t}
                </Text>
              ))}
            </Card>

            <Card style={{ padding: 14 }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary, marginBottom: 6 }}>
                OPPORTUNITIES
              </Text>
              {data?.swot?.opportunities?.map((o: string, idx: number) => (
                <Text key={idx} style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginVertical: 2 }}>
                  • {o}
                </Text>
              ))}
            </Card>
          </View>
        )}

        {activeTab === 'competitors' && (
          <View style={{ gap: 10 }}>
            {data?.competitors?.map((comp: any, idx: number) => (
              <Card key={idx} style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                    {comp.name}
                  </Text>
                  <Badge label={`${comp.threat_level} THREAT`} variant={comp.threat_level === 'High' ? 'danger' : 'warning'} />
                </View>
                <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono }}>
                  KILLER DIFFERENTIATOR: {comp.differentiator}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'proposal' && (
          <Card variant="highlight" style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <FileText size={18} color={colors.primary} />
              <Text style={{ fontSize: 12, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary }}>
                1-CLICK SMART PROPOSAL STUDIO
              </Text>
            </View>

            <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 14, lineHeight: 16 }}>
              Generate custom enterprise tier proposal with SLA terms and dispatch e-sign link directly to the prospect.
            </Text>

            {proposalSent ? (
              <View style={{ backgroundColor: colors.surface, padding: 12, borderWidth: 1, borderColor: colors.success, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color={colors.success} />
                  <Text style={{ fontSize: 11, fontFamily: fonts.mono, color: colors.success, fontWeight: '700' }}>
                    PROPOSAL DISPATCHED TO BUYING COMMITTEE
                  </Text>
                </View>
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textMuted, marginTop: 4 }}>
                  E-Signature tracking active via Task Queue.
                </Text>
              </View>
            ) : null}

            <Button
              title={proposalSent ? "DISPATCH REVISED PROPOSAL" : "GENERATE & SEND PROPOSAL"}
              variant="primary"
              size="lg"
              onPress={() => setProposalSent(true)}
            />
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
