/**
 * Tactical Command Mobile Tabs Navigation Layout
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import {
  LayoutDashboard,
  Briefcase,
  Mic,
  GitBranch,
  Bell,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useNotificationStore } from '@/stores/notificationStore';

export default function TabLayout() {
  const { colors, fonts } = useTheme();
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          fontFamily: fonts.mono,
          textTransform: 'uppercase',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size || 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="deals"
        options={{
          title: 'Deals',
          tabBarIcon: ({ color, size }) => (
            <Briefcase color={color} size={size || 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Voice Notes',
          tabBarIcon: ({ color, size }) => (
            <Mic color={color} size={size || 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="workflows"
        options={{
          title: 'Workflows',
          tabBarIcon: ({ color, size }) => (
            <GitBranch color={color} size={size || 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Bell color={color} size={size || 22} />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -6,
                    backgroundColor: colors.danger,
                    borderRadius: 6,
                    paddingHorizontal: 4,
                    paddingVertical: 1,
                    minWidth: 14,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 8,
                      fontWeight: '800',
                      fontFamily: fonts.mono,
                    }}
                  >
                    {unreadCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
