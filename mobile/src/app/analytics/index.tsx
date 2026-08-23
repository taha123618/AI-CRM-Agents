/**
 * Tactical Command Mobile Executive Analytics & Pipeline Velocity
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart3, ArrowLeft, TrendingUp, Trophy, Zap, Shield } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

export default function AnalyticsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const res = await api.getAnalytics();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (val: number) => `$${(val / 1000).toFixed(0)}k`;

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
            PIPELINE TELEMETRY
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            EXECUTIVE ANALYTICS
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
      >
        {/* Core KPI Matrix */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <StatCard label="FLEET WIN RATE" value={`${data?.win_rate || 68.4}%`} subValue="+5.2% vs target" trend="up" variant="success" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard label="AVG CYCLE TIME" value={`${data?.avg_cycle_days || 14.2}d`} subValue="-4.6d velocity" trend="up" variant="primary" />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <StatCard label="DAILY VELOCITY" value={data ? formatCurrency(data.pipeline_velocity) : '$85k'} subValue="Per active rep" trend="up" variant="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard label="AI MULTIPLIER" value={data?.agent_efficiency_gain || '4.8x'} subValue="Swarm efficiency" trend="up" variant="success" />
          </View>
        </View>

        {/* Rep Leaderboard */}
        <Card style={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Trophy size={16} color={colors.primary} />
            <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary }}>
              TOP FIELD OPERATOR LEADERBOARD
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            {data?.top_performers?.map((rep: any, idx: number) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 6,
                  borderBottomWidth: idx < data.top_performers.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 12, fontFamily: fonts.mono, fontWeight: '800', color: colors.primary }}>
                    #{idx + 1}
                  </Text>
                  <View>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                      {rep.name}
                    </Text>
                    <Text style={{ fontSize: 9, fontFamily: fonts.mono, color: colors.textMuted }}>
                      {rep.deals_closed} Deals Won
                    </Text>
                  </View>
                </View>

                <Badge label={formatCurrency(rep.arr_generated)} variant="success" />
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
