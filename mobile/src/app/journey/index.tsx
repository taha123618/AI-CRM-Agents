/**
 * Tactical Command Mobile Customer Journey & Churn Prevention Studio
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Compass, ArrowLeft, ShieldAlert, Zap, CheckCircle2, AlertTriangle, Users } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

export default function JourneyScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interventionRunning, setInterventionRunning] = useState(false);
  const [interventionTriggered, setInterventionTriggered] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await api.getJourneyStages();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerIntervention = () => {
    setInterventionRunning(true);
    setTimeout(() => {
      setInterventionRunning(false);
      setInterventionTriggered(true);
    }, 1200);
  };

  const formatCurrency = (val: number) => `$${(val / 1000).toFixed(0)}k ARR`;

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
            AUTONOMOUS LIFECYCLE
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            CUSTOMER JOURNEY
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
      >
        {/* Churn Risk Radar Cards */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <StatCard label="PORTFOLIO CHURN RISK" value={`${data?.churn_risk_score || 14.2}%`} subValue="-3.1% vs last mo" trend="up" variant="success" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard label="ACTIVE INTERVENTIONS" value={`${data?.active_interventions || 6}`} subValue="4 automated" trend="up" variant="primary" />
          </View>
        </View>

        {/* 1-Click Retention Playbook Trigger */}
        <Card variant="highlight" style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Zap size={18} color={colors.primary} />
            <Text style={{ fontSize: 12, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary }}>
              AUTONOMOUS RETENTION INTERVENTION
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 12, lineHeight: 16 }}>
            Dispatch CustomerSuccessAgent to analyze product telemetry drops and deliver targeted executive re-engagement.
          </Text>

          {interventionTriggered ? (
            <View style={{ backgroundColor: colors.surface, padding: 10, borderWidth: 1, borderColor: colors.success, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} color={colors.success} />
                <Text style={{ fontSize: 11, fontFamily: fonts.mono, color: colors.success, fontWeight: '700' }}>
                  INTERVENTION SWARM DISPATCHED TO 4 AT-RISK ACCOUNTS
                </Text>
              </View>
            </View>
          ) : null}

          <Button
            title={interventionRunning ? "ORCHESTRATING RETENTION AGENT..." : "EXECUTE RETENTION PLAYBOOK"}
            variant="primary"
            size="md"
            isLoading={interventionRunning}
            onPress={triggerIntervention}
          />
        </Card>

        {/* Lifecycle Stage Telemetry Cards */}
        <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted, marginTop: 4 }}>
          LIFECYCLE PIPELINE DISTRIBUTION:
        </Text>

        <View style={{ gap: 10 }}>
          {data?.stages?.map((st: any, idx: number) => (
            <Card
              key={idx}
              style={{
                padding: 14,
                borderColor: st.health === 'critical' ? colors.danger : st.health === 'warning' ? colors.warning : colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>
                  {st.name}
                </Text>
                <Badge
                  label={formatCurrency(st.total_arr)}
                  variant={st.health === 'critical' ? 'danger' : st.health === 'warning' ? 'warning' : 'success'}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textMuted }}>
                  {st.count} Active Customer Accounts
                </Text>
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.primary, fontWeight: '700' }}>
                  HEALTH: {st.health.toUpperCase()}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
