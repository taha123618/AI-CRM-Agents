/**
 * Tactical Top Header Component
 * Provides sidebar toggle button, page title, telemetry, and quick actions
 */

import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Menu, Search, Shield, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useNotificationStore } from '@/stores/notificationStore';

interface TacticalHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export function TacticalHeader({ title, subtitle, rightAction }: TacticalHeaderProps) {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const openSidebar = useSidebarStore((state) => state.openSidebar);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <View
      style={{
        paddingTop: Platform.OS === 'ios' ? 52 : 38,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left: Title & Subtitle */}
      <View>
        {subtitle && (
          <Text
            style={{
              fontSize: 9,
              fontFamily: fonts.mono,
              color: colors.primary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {subtitle}
          </Text>
        )}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '800',
            color: colors.text,
            letterSpacing: 0.2,
          }}
        >
          {title}
        </Text>
      </View>

      {/* Right Action */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {rightAction ? (
          rightAction
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/notifications' as any)}
            style={{
              width: 34,
              height: 34,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Bell size={16} color={colors.textSecondary} />
            {unreadCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  width: 6,
                  height: 6,
                  backgroundColor: colors.danger,
                }}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
