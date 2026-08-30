/**
 * Customer 360 & Churn Prevention Radar Screen
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import {
  Search,
  ArrowLeft,
  Building2,
  ShieldAlert,
  ShieldCheck,
  Zap,
  TrendingUp,
  Activity,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useCustomerStore } from '@/stores/customerStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AnimatedEntrance } from '@/components/ui/AnimatedEntrance';

export default function CustomersScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const {
    customers,
    isLoading,
    isTriggeringPlaybookId,
    fetchCustomers,
    triggerRetentionPlaybook,
    searchQuery,
    setSearchQuery,
  } = useCustomerStore();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.company_name?.toLowerCase().includes(q) ||
      c.plan?.toLowerCase().includes(q)
    );
  });

  const totalMRR = customers.reduce((sum, c) => sum + (c.mrr || 0), 0);

  const handleRetention = async (id: string, name?: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await triggerRetentionPlaybook(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Retention Activated', `CustomerSuccessAgent has triggered immediate executive retention playbook for ${name || 'account'}.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to launch retention playbook.');
    }
  };

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
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
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
              CUSTOMER SUCCESS & ARR
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
              Customer 360 Radar
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>
              ACTIVE MRR
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.primary, fontFamily: fonts.mono }}>
              ${totalMRR.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 2,
            paddingHorizontal: 10,
          }}
        >
          <Search size={16} color={colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search accounts, plans, companies..."
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 8,
              color: colors.text,
              fontSize: 13,
            }}
          />
        </View>
      </View>

      {/* High-Performance FlashList */}
      <FlashList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchCustomers} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <Building2 size={36} color={colors.textMuted} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary }}>
              No customer accounts found.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isAtRisk = item.churn_risk === 'high' || (item.churn_probability && item.churn_probability > 40);
          const isTriggering = isTriggeringPlaybookId === item.id;

          return (
            <AnimatedEntrance animation="fadeInUp" index={index} staggerMs={40}>
              <Card variant={isAtRisk ? 'danger' : 'default'} style={{ marginBottom: 12, padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                      {item.name || item.company_name}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                      Plan: <Text style={{ fontFamily: fonts.mono, color: colors.primary }}>{item.plan}</Text>
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: colors.primary, fontFamily: fonts.mono }}>
                      ${(item.mrr || 0).toLocaleString()}/mo
                    </Text>
                    <Badge
                      label={isAtRisk ? 'CHURN RISK' : 'HEALTHY'}
                      variant={isAtRisk ? 'danger' : 'success'}
                    />
                  </View>
                </View>

                {/* Telemetry Metrics Grid */}
                <View style={{ flexDirection: 'row', gap: 6, marginVertical: 6 }}>
                  <View style={{ flex: 1, backgroundColor: colors.surface, padding: 6, borderWidth: 1, borderColor: colors.borderMuted, borderRadius: 2 }}>
                    <Text style={{ fontSize: 9, color: colors.textMuted, fontFamily: fonts.mono }}>HEALTH SCORE</Text>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text, fontFamily: fonts.mono }}>
                      {item.health_score || 85}%
                    </Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: colors.surface, padding: 6, borderWidth: 1, borderColor: colors.borderMuted, borderRadius: 2 }}>
                    <Text style={{ fontSize: 9, color: colors.textMuted, fontFamily: fonts.mono }}>CHURN PROB</Text>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: isAtRisk ? colors.danger : colors.success, fontFamily: fonts.mono }}>
                      {item.churn_probability || 10}%
                    </Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: colors.surface, padding: 6, borderWidth: 1, borderColor: colors.borderMuted, borderRadius: 2 }}>
                    <Text style={{ fontSize: 9, color: colors.textMuted, fontFamily: fonts.mono }}>SEATS USED</Text>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text, fontFamily: fonts.mono }}>
                      {item.license_usage_percent || 90}%
                    </Text>
                  </View>
                </View>

                {/* Recommended CS Action */}
                {item.recommended_actions && item.recommended_actions.length > 0 && (
                  <View style={{ backgroundColor: colors.surface, padding: 8, borderWidth: 1, borderColor: colors.borderMuted, borderRadius: 2, marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary, fontFamily: fonts.mono }}>
                      AI CS RETENTION PLAN:
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.text }}>{item.recommended_actions[0]}</Text>
                  </View>
                )}

                {/* 1-Click Retention Playbook Trigger */}
                <Button
                  title={isTriggering ? "DISPATCHING AI RETENTION INTERVENTION..." : "LAUNCH AUTONOMOUS RETENTION PLAYBOOK"}
                  variant={isAtRisk ? "danger" : "primary"}
                  size="md"
                  icon={<Zap size={14} color={isAtRisk ? "#FFFFFF" : colors.primaryText} />}
                  isLoading={isTriggering}
                  onPress={() => handleRetention(item.id, item.name || item.company_name)}
                />
              </Card>
            </AnimatedEntrance>
          );
        }}
      />
    </View>
  );
}
