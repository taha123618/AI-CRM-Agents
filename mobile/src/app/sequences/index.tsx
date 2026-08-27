/**
 * Tactical Command Mobile AI SDR Multi-Touch Cadence Studio
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Send, ArrowLeft, Plus, Play, CheckCircle2, Sparkles, Mail, MessageSquare, Phone } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

export default function SequencesScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [sequences, setSequences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrolledSuccess, setEnrolledSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await api.getSequences();
    setSequences(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnroll = (seqId: string) => {
    setEnrollingId(seqId);
    setTimeout(() => {
      setEnrollingId(null);
      setEnrolledSuccess(seqId);
      setSequences((prev) =>
        prev.map((s) => (s.id === seqId ? { ...s, enrolled_count: s.enrolled_count + 5 } : s))
      );
    }, 1000);
  };

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
            OMNICHANNEL CADENCES
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            AI SDR SEQUENCES
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 14, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
      >
        {/* Cadence Studio Metrics */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <StatCard label="AVG REPLY RATE" value="46.5%" subValue="+8.2% with AI" trend="up" variant="success" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard label="ACTIVE ENROLLEES" value="67" subValue="12 new today" trend="up" variant="primary" />
          </View>
        </View>

        <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted }}>
          ACTIVE OUTREACH CADENCES:
        </Text>

        <View style={{ gap: 12 }}>
          {sequences.map((seq) => (
            <Card key={seq.id} variant="highlight" style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text, flex: 1 }}>
                  {seq.name}
                </Text>
                <Badge label={`${seq.reply_rate}% REPLY RATE`} variant="success" />
              </View>

              {/* Step Channels Indicator */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Mail size={12} color={colors.primary} />
                  <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textMuted }}>Email</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <MessageSquare size={12} color={colors.success} />
                  <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textMuted }}>WhatsApp</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Phone size={12} color={colors.warning} />
                  <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textMuted }}>Voice AI</Text>
                </View>
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.primary, marginLeft: 'auto', fontWeight: '700' }}>
                  {seq.steps_count} STEPS
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textMuted }}>
                  Enrolled Leads: <Text style={{ color: colors.text, fontWeight: '700' }}>{seq.enrolled_count}</Text>
                </Text>
                <Badge label={String(seq?.status || 'ACTIVE').toUpperCase()} variant="primary" />
              </View>

              {enrolledSuccess === seq.id ? (
                <View style={{ backgroundColor: colors.surface, padding: 8, borderWidth: 1, borderColor: colors.success, marginBottom: 8 }}>
                  <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.success, fontWeight: '700', textAlign: 'center' }}>
                    +5 QUALIFIED LEADS ENROLLED & DISPATCHED
                  </Text>
                </View>
              ) : null}

              <Button
                title={enrollingId === seq.id ? "ENROLLING COHORT..." : "ENROLL NEW LEAD COHORT"}
                variant="primary"
                size="sm"
                isLoading={enrollingId === seq.id}
                onPress={() => handleEnroll(seq.id)}
              />
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
