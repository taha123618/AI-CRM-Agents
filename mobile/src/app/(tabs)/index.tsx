/**
 * Field Command Dashboard Screen
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  Mic,
  ShieldCheck,
  RotateCw,
  Plus,
  Briefcase,
  User as UserIcon,
  Users,
  Building2,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useDealsStore } from '@/stores/dealsStore';
import { useVoiceNotesStore } from '@/stores/voiceNotesStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { HealthIndicator } from '@/components/ui/HealthIndicator';
import { Button } from '@/components/ui/Button';

export default function DashboardScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const { deals, isLoading: dealsLoading, fetchDeals } = useDealsStore();
  const { notes, fetchNotes } = useVoiceNotesStore();
  const { fetchNotifications } = useNotificationStore();
  const { pendingCount, isSyncing, syncNow } = useOfflineSync();

  useEffect(() => {
    fetchDeals();
    fetchNotes();
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    await Promise.all([fetchDeals(), fetchNotes(), fetchNotifications(), syncNow()]);
  };

  // KPI Calculations
  const totalPipeline = deals.reduce((acc, d) => acc + (d.value || 0), 0);
  const activeDealsCount = deals.filter(
    (d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost'
  ).length;
  const stalledDeals = deals.filter((d) => d.is_stalled);
  const avgHealthScore =
    deals.length > 0
      ? Math.round(deals.reduce((acc, d) => acc + (d.health_score || 0), 0) / deals.length)
      : 0;

  const urgentDeals = deals
    .filter((d) => d.is_stalled || (d.health_score && d.health_score < 60))
    .slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Header */}
      <View
        style={{
          paddingTop: 54,
          paddingBottom: 14,
          paddingHorizontal: 16,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: colors.primary,
              fontFamily: fonts.mono,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            AI CRM FIELD COMMAND
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: colors.text,
              letterSpacing: 0.2,
            }}
          >
            Tactical Overview
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {/* Telemetry / Sync Status */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={syncNow}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderColor: pendingCount > 0 ? colors.warning : colors.border,
              borderWidth: 1,
              borderRadius: 2,
              paddingHorizontal: 8,
              paddingVertical: 5,
            }}
          >
            <RotateCw
              size={12}
              color={pendingCount > 0 ? colors.warning : colors.success}
              style={isSyncing ? { transform: [{ rotate: '45deg' }] } : undefined}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: pendingCount > 0 ? colors.warning : colors.success,
                fontFamily: fonts.mono,
                marginLeft: 4,
              }}
            >
              {isSyncing ? 'SYNCING...' : pendingCount > 0 ? `${pendingCount} PENDING` : 'ONLINE'}
            </Text>
          </TouchableOpacity>

          {/* Platform Settings & Governance Hub */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/settings' as any)}
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 2,
              padding: 5,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <UserIcon size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={dealsLoading || isSyncing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Quick Voice Note CTA Banner */}
        <Card
          variant="highlight"
          style={{
            backgroundColor: colors.surface,
            padding: 16,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Zap size={14} color={colors.primary} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: colors.primary,
                  fontFamily: fonts.mono,
                  marginLeft: 4,
                  textTransform: 'uppercase',
                }}
              >
                Instant Field Intelligence
              </Text>
            </View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 2,
              }}
            >
              Capture Voice Note
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted }}>
              Record prospect meeting audio for autonomous transcript & task generation.
            </Text>
          </View>

          <Button
            title="RECORD"
            variant="primary"
            size="sm"
            icon={<Mic size={14} color={colors.primaryText} />}
            onPress={() => router.push('/voice/record' as any)}
          />
        </Card>

        {/* 4 Primary KPI Telemetry Cards */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <StatCard
            label="PIPELINE ARR"
            value={`$${(totalPipeline / 1000).toFixed(0)}k`}
            subValue={`${deals.length} deals total`}
            trend="up"
            variant="primary"
          />
          <StatCard
            label="ACTIVE PIPELINE"
            value={activeDealsCount}
            subValue="In negotiation"
            trend="neutral"
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <StatCard
            label="STALLED RISKS"
            value={stalledDeals.length}
            subValue={stalledDeals.length > 0 ? 'Requires attention' : 'All deals healthy'}
            trend={stalledDeals.length > 0 ? 'down' : 'neutral'}
            variant={stalledDeals.length > 0 ? 'danger' : 'default'}
            icon={<AlertTriangle size={14} color={stalledDeals.length > 0 ? colors.danger : colors.textMuted} />}
          />
          <StatCard
            label="AI HEALTH AVG"
            value={`${avgHealthScore}%`}
            subValue="Multi-agent radar"
            trend={avgHealthScore > 70 ? 'up' : 'down'}
            variant={avgHealthScore > 70 ? 'success' : 'default'}
            icon={<ShieldCheck size={14} color={avgHealthScore > 70 ? colors.success : colors.warning} />}
          />
        </View>

        {/* Autonomous Field Intelligence Hub */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/leads' as any)}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 2,
                padding: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Users size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, fontFamily: fonts.mono, textTransform: 'uppercase' }}>
                  LEADS (BANT)
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 2 }}>
                Prospect Radar
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>
                BANT scores & AI outreach
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/customers' as any)}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 2,
                padding: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Building2 size={16} color={colors.secondary} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.secondary, fontFamily: fonts.mono, textTransform: 'uppercase' }}>
                  CUSTOMER 360
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 2 }}>
                Churn Prevention
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>
                Account ARR & Playbooks
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Command Studios Matrix */}
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: colors.textMuted,
              fontFamily: fonts.mono,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            SPECIALIZED AI COMMAND STUDIOS:
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[
              { title: 'WAR ROOM', route: '/war-room', icon: '⚔️' },
              { title: 'FORECASTING', route: '/forecasting', icon: '📈' },
              { title: 'JOURNEY', route: '/journey', icon: '🧭' },
              { title: 'AI SDR SEQUENCES', route: '/sequences', icon: '⚡' },
              { title: 'VOICE AI STUDIO', route: '/voice-ai', icon: '🎙️' },
              { title: 'WHATSAPP HUB', route: '/whatsapp', icon: '💬' },
              { title: 'EMAIL INTEL', route: '/emails', icon: '✉️' },
              { title: 'ANALYTICS', route: '/analytics', icon: '📊' },
              { title: 'AGENTS SWARM', route: '/agents', icon: '🤖' },
              { title: 'MEETINGS', route: '/meetings', icon: '📅' },
              { title: 'CUSTOM AGENTS', route: '/custom-agents', icon: '🛠️' },
              { title: 'REPORTS & EXPORT', route: '/reports', icon: '📋' },
              { title: 'MULTI-LANGUAGE', route: '/multi-language', icon: '🌐' },
              { title: 'GOVERNANCE & RBAC', route: '/settings', icon: '🛡️' },
              { title: 'FLEET SHOWCASE', route: '/explore', icon: '✨' },
            ].map((mod, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => router.push(mod.route as any)}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  paddingVertical: 7,
                  paddingHorizontal: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 11 }}>{mod.icon}</Text>
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, fontWeight: '700', color: colors.text }}>
                  {mod.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section: Priority Attention Deals */}
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: colors.textSecondary,
                fontFamily: fonts.mono,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              PRIORITY DEALS ({urgentDeals.length})
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/deals' as any)}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: colors.primary,
                  fontFamily: fonts.mono,
                }}
              >
                VIEW ALL →
              </Text>
            </TouchableOpacity>
          </View>

          {urgentDeals.length === 0 ? (
            <Card style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: colors.success, fontSize: 13, fontWeight: '600' }}>
                ✓ All active deals are moving within normal stage velocity.
              </Text>
            </Card>
          ) : (
            urgentDeals.map((deal) => (
              <Card
                key={deal.id}
                onPress={() => router.push(`/deals/${deal.id}` as any)}
                variant={deal.is_stalled ? 'danger' : 'default'}
                style={{ marginBottom: 10 }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: colors.text,
                      flex: 1,
                      marginRight: 8,
                    }}
                  >
                    {deal.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: colors.primary,
                      fontFamily: fonts.mono,
                    }}
                  >
                    ${deal.value.toLocaleString()}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Badge label={deal.stage.replace('_', ' ')} variant="primary" size="sm" />
                  <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.mono }}>
                    {deal.company_name}
                  </Text>
                </View>

                <HealthIndicator
                  score={deal.health_score}
                  isStalled={deal.is_stalled}
                  riskFactors={deal.risk_factors}
                  compact={false}
                />

                {deal.next_actions && deal.next_actions.length > 0 && (
                  <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderMuted }}>
                    <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700', fontFamily: fonts.mono }}>
                      NEXT AI ACTION: {deal.next_actions[0]}
                    </Text>
                  </View>
                )}
              </Card>
            ))
          )}
        </View>

        {/* Section: Recent Field Voice Notes */}
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: colors.textSecondary,
                fontFamily: fonts.mono,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              RECENT FIELD INTELLIGENCE
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/activities' as any)}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: colors.primary,
                  fontFamily: fonts.mono,
                }}
              >
                ALL NOTES →
              </Text>
            </TouchableOpacity>
          </View>

          {notes.slice(0, 2).map((note) => (
            <Card key={note.id} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: colors.text,
                    flex: 1,
                  }}
                >
                  {note.title}
                </Text>
                <Badge
                  label={`${note.buyer_intent_score}% INTENT`}
                  variant={note.buyer_intent_score >= 80 ? 'success' : 'warning'}
                  size="sm"
                />
              </View>
              <Text numberOfLines={2} style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>
                {note.summary}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>
                  ⏱️ {note.duration_seconds}s • {note.entity_name}
                </Text>
                <Text style={{ fontSize: 10, color: colors.primary, fontFamily: fonts.mono }}>
                  {note.action_items.length} ACTION ITEMS
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
