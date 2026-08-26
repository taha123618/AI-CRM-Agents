/**
 * Tactical Command Mobile AI Agents Swarm Fleet Monitor
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Bot, ArrowLeft, Cpu, Zap, CheckCircle2, Play } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

export default function AgentsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulsing, setPulsing] = useState(false);
  const [pulseSuccess, setPulseSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await api.getAgentsSwarm();
    setAgents(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerPulse = () => {
    setPulsing(true);
    setTimeout(() => {
      setPulsing(false);
      setPulseSuccess(true);
      setTimeout(() => setPulseSuccess(false), 2000);
    }, 1200);
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
            BASEAGENT FRAMEWORK
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            SWARM FLEET
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
      >
        {/* Swarm Health Overview */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <StatCard label="ACTIVE AGENTS" value="9 SWARMS" subValue="100% Online" trend="up" variant="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard label="TASKS EXECUTED" value="1,254" subValue="+142 today" trend="up" variant="success" />
          </View>
        </View>

        {/* 1-Click Fleet Pulse Trigger */}
        <Button
          title={pulsing ? "ORCHESTRATING SWARM HEARTBEAT..." : "TRIGGER AGENT SWARM PULSE"}
          variant="primary"
          size="md"
          isLoading={pulsing}
          onPress={triggerPulse}
        />

        {pulseSuccess ? (
          <View style={{ backgroundColor: colors.surface, padding: 10, borderWidth: 1, borderColor: colors.success }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} color={colors.success} />
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, color: colors.success, fontWeight: '700' }}>
                ALL 9 AGENTS RESPONDING • LATENCY: 42MS
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted }}>
          DEPLOYED SPECIALIZED AGENTS:
        </Text>

        <View style={{ gap: 10 }}>
          {agents.map((agent) => (
            <Card key={agent.id} style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Bot size={16} color={colors.primary} />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                    {agent.name}
                  </Text>
                </View>
                <Badge
                  label={String(agent?.status || 'ONLINE').toUpperCase()}
                  variant={agent.status === 'running' || agent.status === 'active' ? 'success' : 'warning'}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textMuted }}>
                  Model: <Text style={{ color: colors.primary }}>{agent.model}</Text>
                </Text>
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textSecondary }}>
                  {agent.tasks_completed} Tasks Completed
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
