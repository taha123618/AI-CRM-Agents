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
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useNotificationStore } from '@/stores/notificationStore';
import { NotificationItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function NotificationsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'critical') return n.severity === 'critical';
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
    markAsRead(item.id);
    if (item.entity_type === 'deal' && item.entity_id) {
      router.push(`/deals/${item.entity_id}` as any);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
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
            Alerts & Triage ({unreadCount})
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={markAllAsRead}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <CheckCheck size={14} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700', fontFamily: fonts.mono }}>
              MARK ALL READ
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: colors.cardSubtle,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          gap: 8,
        }}
      >
        {(['all', 'unread', 'critical'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingVertical: 5,
              paddingHorizontal: 12,
              backgroundColor: filter === f ? colors.primary : colors.surface,
              borderRadius: 2,
              borderWidth: 1,
              borderColor: filter === f ? colors.primary : colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: filter === f ? colors.primaryText : colors.textSecondary,
                fontFamily: fonts.mono,
                textTransform: 'uppercase',
              }}
            >
              {f === 'all' ? 'ALL ALERTS' : f === 'unread' ? `UNREAD (${unreadCount})` : 'CRITICAL'}
            </Text>
          </TouchableOpacity>
        ))}
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
              No Alerts
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
              You are completely caught up on all lead qualifications and deal risk radar alerts.
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Card
            key={item.id}
            onPress={() => handleNotificationPress(item)}
            variant={item.severity === 'critical' ? 'danger' : 'default'}
            style={{
              marginBottom: 10,
              opacity: item.is_read ? 0.75 : 1,
              borderLeftWidth: 3,
              borderLeftColor:
                item.severity === 'critical'
                  ? colors.danger
                  : item.severity === 'success'
                  ? colors.success
                  : colors.primary,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ marginRight: 10, marginTop: 2 }}>{getSeverityIcon(item.severity)}</View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: colors.text,
                      flex: 1,
                      marginRight: 6,
                    }}
                  >
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
                  <Badge label={item.type.replace('_', ' ')} variant="muted" size="sm" />

                  {item.entity_id && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700', fontFamily: fonts.mono, marginRight: 2 }}>
                        VIEW ENTITY
                      </Text>
                      <ArrowRight size={10} color={colors.primary} />
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}
