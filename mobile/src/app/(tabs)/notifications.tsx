/**
 * Real-Time Notification Center & Alert Triage
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Zap,
  CheckCircle,
  Info,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const ALERT_TABS = [
  { key: 'all', label: 'ALL ALERTS' },
  { key: 'unread', label: 'UNREAD' },
  { key: 'deal_risk', label: 'DEAL RISKS' },
  { key: 'lead_alert', label: 'LEAD ALERTS' },
  { key: 'workflow_event', label: 'SWARM EVENTS' },
];

export default function NotificationsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.is_read;
    if (activeTab === 'deal_risk') return n.type === 'deal_risk';
    if (activeTab === 'lead_alert') return n.type === 'lead_alert';
    if (activeTab === 'workflow_event') return n.type === 'workflow_event';
    return true;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle size={18} color={colors.danger} />;
      case 'success':
        return <CheckCircle size={18} color={colors.success} />;
      case 'warning':
        return <Zap size={18} color={colors.warning} />;
      default:
        return <Info size={18} color={colors.secondary} />;
    }
  };

  const handleNotificationPress = (item: NotificationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markAsRead(item.id);
    if (item.entity_type === 'deal' && item.entity_id) {
      router.push(`/deals/${item.entity_id}` as any);
    } else if (item.entity_type === 'lead') {
      router.push('/leads' as any);
    }
  };

  const handleMarkAll = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    markAllAsRead();
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
            REAL-TIME INTELLIGENCE
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: colors.text,
            }}
          >
            Notification Radar
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleMarkAll}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              paddingHorizontal: 8,
              paddingVertical: 5,
              borderRadius: 2,
              gap: 4,
            }}
          >
            <CheckCheck size={12} color={colors.primary} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary, fontFamily: fonts.mono }}>
              MARK ALL READ
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={{ backgroundColor: colors.cardSubtle, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}>
          {ALERT_TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 2,
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                  borderWidth: 1,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', fontFamily: fonts.mono, color: active ? colors.primaryText : colors.textSecondary }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchNotifications} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Card style={{ padding: 24, alignItems: 'center', marginTop: 20 }}>
            <Bell size={32} color={colors.textMuted} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 4 }}>
              All Clear
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
              No active alerts matching the selected triage filter.
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleNotificationPress(item)}
            style={{ marginBottom: 10 }}
          >
            <Card
              variant={!item.is_read ? (item.severity === 'critical' ? 'danger' : 'highlight') : 'default'}
              style={{ padding: 12 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ marginTop: 2, marginRight: 10 }}>
                  {getSeverityIcon(item.severity)}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={{ fontSize: 14, fontWeight: item.is_read ? '600' : '800', color: colors.text, flex: 1, marginRight: 6 }}>
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>
                      {item.timestamp}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 16, marginBottom: 6 }}>
                    {item.message}
                  </Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge label={item.type.replace('_', ' ').toUpperCase()} variant="info" />
                    {item.entity_id && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary, fontFamily: fonts.mono }}>
                          VIEW ENTITY
                        </Text>
                        <ArrowRight size={10} color={colors.primary} />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
