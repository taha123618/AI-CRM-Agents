/**
 * Field Agent Profile, System Settings & Data Sync Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  User as UserIcon,
  Shield,
  Server,
  Database,
  RefreshCw,
  LogOut,
  Trash2,
  CheckCircle2,
  Lock,
  Moon,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { useDealsStore } from '@/stores/dealsStore';
import { useVoiceNotesStore } from '@/stores/voiceNotesStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Config } from '@/constants/config';
import { OfflineStorage } from '@/services/offlineStorage';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function ProfileSettingsScreen() {
  const { colors, fonts, isDark } = useTheme();
  const router = useRouter();

  const { user, logout } = useAuthStore();
  const { fetchDeals, deals } = useDealsStore();
  const { fetchNotes, notes } = useVoiceNotesStore();
  const { fetchNotifications } = useNotificationStore();

  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function loadQueue() {
      const q = await OfflineStorage.getOfflineQueue();
      setQueueCount(q.length);
    }
    loadQueue();
  }, []);

  const handleForceResync = async () => {
    setIsSyncing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Promise.all([fetchDeals(), fetchNotes(), fetchNotifications()]);
      const q = await OfflineStorage.getOfflineQueue();
      setQueueCount(q.length);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sync Completed', 'All CRM pipeline deals, voice notes, and triggers are synchronized with the server.');
    } catch (e) {
      Alert.alert('Sync Warning', 'Could not establish connection with server. Local cached state preserved.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePurgeCache = () => {
    Alert.alert(
      'Purge Offline Data',
      'This will clear local cached records and reset offline data storage. Unsynced actions will be reset.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purge Storage',
          style: 'destructive',
          onPress: async () => {
            await OfflineStorage.clearOfflineQueue();
            setQueueCount(0);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Storage Cleared', 'Local offline storage has been reset.');
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out of Field Command',
      'Are you sure you want to end your active session and sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login' as any);
          },
        },
      ]
    );
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
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: colors.primary,
              fontFamily: fonts.mono,
              textTransform: 'uppercase',
            }}
          >
            FIELD COMMAND SETTINGS
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
            User Profile & System Telemetry
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        {/* Section 1: User Identity Card */}
        <Card variant="highlight" style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor: colors.surface,
                borderColor: colors.borderHighlight,
                borderWidth: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <UserIcon size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                {user?.full_name || 'Field Sales Commander'}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.mono }}>
                {user?.email || 'admin@gmail.com'}
              </Text>
            </View>
            <Badge label={String(user?.role || 'ADMIN').toUpperCase()} variant="primary" />
          </View>

          <View style={{ paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.borderMuted, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.mono }}>ACCESS LEVEL:</Text>
              <Text style={{ fontSize: 11, color: colors.success, fontWeight: '700', fontFamily: fonts.mono }}>
                RBAC Level 1 [Full Swarm Control]
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.mono }}>SESSION TYPE:</Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono }}>
                JWT Bearer (Auto-Refresh)
              </Text>
            </View>
          </View>
        </Card>

        {/* Section 2: Server & Connection Telemetry */}
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Server size={16} color={colors.secondary} style={{ marginRight: 6 }} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: colors.secondary,
                fontFamily: fonts.mono,
                textTransform: 'uppercase',
              }}
            >
              BACKEND SERVER CONNECTION
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>API Base URL:</Text>
              <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '700', color: colors.text, fontFamily: fonts.mono }}>
                {Config.API_BASE_URL}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>WebSocket Gateway:</Text>
              <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '700', color: colors.text, fontFamily: fonts.mono }}>
                {Config.WS_URL}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>Environment:</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: Config.IS_PROD ? colors.success : colors.warning, fontFamily: fonts.mono }}>
                {Config.APP_ENV.toUpperCase()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Section 3: Offline Storage & Sync Controls */}
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Database size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: colors.primary,
                fontFamily: fonts.mono,
                textTransform: 'uppercase',
              }}
            >
              OFFLINE CACHE & QUEUE TELEMETRY
            </Text>
          </View>

          <View style={{ gap: 8, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>Cached Deals:</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, fontFamily: fonts.mono }}>
                {deals.length} records
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>Cached Voice Notes:</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, fontFamily: fonts.mono }}>
                {notes.length} records
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>Pending Sync Queue:</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: queueCount > 0 ? colors.warning : colors.success, fontFamily: fonts.mono }}>
                {queueCount} mutations pending
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button
              title="FORCE RESYNC"
              variant="primary"
              size="sm"
              icon={<RefreshCw size={12} color={colors.primaryText} />}
              isLoading={isSyncing}
              onPress={handleForceResync}
              style={{ flex: 1 }}
            />
            <Button
              title="PURGE CACHE"
              variant="outline"
              size="sm"
              icon={<Trash2 size={12} color={colors.danger} />}
              onPress={handlePurgeCache}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {/* Section 4: Sign Out Button */}
        <Button
          title="SIGN OUT OF FIELD SALES COMMAND"
          variant="danger"
          size="lg"
          icon={<LogOut size={16} color="#FFFFFF" />}
          onPress={handleLogout}
        />
      </ScrollView>
    </View>
  );
}
