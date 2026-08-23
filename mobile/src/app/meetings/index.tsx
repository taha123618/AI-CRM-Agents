/**
 * Tactical Command Mobile AI Meeting Scheduler & Briefing Studio
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, ArrowLeft, Clock, Users, Sparkles, CheckCircle2, Video } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

export default function MeetingsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [briefingGenerated, setBriefingGenerated] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await api.getMeetings();
    setMeetings(res);
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
            MEETING INTELLIGENCE
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            BRIEFING STUDIO
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
      >
        {/* Schedule Studio Metrics */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <StatCard label="TODAY'S MEETINGS" value="3 SESSIONS" subValue="100% Pre-Briefed" trend="up" variant="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard label="ACCEPTANCE RATE" value="94.2%" subValue="AI Scheduler" trend="up" variant="success" />
          </View>
        </View>

        {/* 1-Click AI Pre-Meeting Briefing */}
        <Card variant="highlight" style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary }}>
              INSTANT PARTICIPANT DOSSIER GENERATOR
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 12, lineHeight: 16 }}>
            MeetingSchedulerAgent aggregates stakeholder LinkedIn history, recent company press, and deal risk factors into a 60-second audio summary.
          </Text>

          {briefingGenerated ? (
            <View style={{ backgroundColor: colors.surface, padding: 10, borderWidth: 1, borderColor: colors.success, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} color={colors.success} />
                <Text style={{ fontSize: 11, fontFamily: fonts.mono, color: colors.success, fontWeight: '700' }}>
                  DOSSIER SYNTHESIZED • 3 KEY OBJECTIONS IDENTIFIED
                </Text>
              </View>
            </View>
          ) : null}

          <Button
            title={briefingGenerated ? "RE-GENERATE BRIEFING" : "GENERATE AI BRIEFING DOSSIER"}
            variant="primary"
            size="md"
            onPress={() => setBriefingGenerated(true)}
          />
        </Card>

        <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted }}>
          UPCOMING STRATEGIC SESSIONS:
        </Text>

        <View style={{ gap: 10 }}>
          {meetings.map((mt) => (
            <Card key={mt.id} style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text, flex: 1 }}>
                  {mt.title}
                </Text>
                <Badge label={mt.status.toUpperCase()} variant={mt.status === 'confirmed' ? 'success' : 'warning'} />
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Clock size={12} color={colors.primary} />
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.primary, fontWeight: '700' }}>
                  {mt.time}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Users size={12} color={colors.textMuted} />
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textSecondary }}>
                  {mt.attendees?.join(', ')}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
