/**
 * Tactical Command Mobile Tabs Navigation Layout
 * Hosts only essential core buttons in the bottom view with a slide-out Tactical Sidebar Drawer
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  LayoutDashboard,
  Briefcase,
  Mic,
  Bell,
  Menu,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useNotificationStore } from '@/stores/notificationStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { SidebarDrawer } from '@/components/navigation/SidebarDrawer';

export default function TabLayout() {
  const { colors, fonts } = useTheme();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const openSidebar = useSidebarStore((state) => state.openSidebar);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
            fontSize: 9,
            fontWeight: '800',
            fontFamily: fonts.mono,
            letterSpacing: 0.3,
          },
        }}
      >
        {/* 4 Essential Core Bottom Bar Tabs + 1 Menu Drawer Trigger */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'DASHBOARD',
            tabBarIcon: ({ color, size }) => (
              <LayoutDashboard color={color} size={size || 20} />
            ),
          }}
        />
        <Tabs.Screen
          name="deals"
          options={{
            title: 'DEALS',
            tabBarIcon: ({ color, size }) => (
              <Briefcase color={color} size={size || 20} />
            ),
          }}
        />
        <Tabs.Screen
          name="activities"
          options={{
            title: 'VOICE NOTES',
            tabBarIcon: ({ color, size }) => (
              <Mic color={color} size={size || 20} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'ALERTS',
            tabBarIcon: ({ color, size }) => (
              <View>
                <Bell color={color} size={size || 20} />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -6,
                      backgroundColor: colors.danger,
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
        <Tabs.Screen
          name="studios"
          options={{
            title: 'MENU',
            tabBarIcon: ({ color, size }) => (
              <Menu color={color} size={size || 20} />
            ),
            tabBarButton: ({ style, children }) => (
              <TouchableOpacity
                style={style}
                activeOpacity={0.7}
                onPress={() => {
                  openSidebar();
                }}
              >
                {children}
              </TouchableOpacity>
            ),
          }}
        />

        {/* In-Tab Feature Screens (Navigable via Sidebar Drawer & Quick Launchers with Bottom Bar Visible) */}
        <Tabs.Screen name="leads" options={{ href: null, title: 'LEADS' }} />
        <Tabs.Screen name="customers" options={{ href: null, title: 'CUSTOMERS' }} />
        <Tabs.Screen name="war-room" options={{ href: null, title: 'WAR ROOM' }} />
        <Tabs.Screen name="forecasting" options={{ href: null, title: 'FORECASTING' }} />
        <Tabs.Screen name="journey" options={{ href: null, title: 'CUSTOMER JOURNEY' }} />
        <Tabs.Screen name="sequences" options={{ href: null, title: 'AI SDR SEQUENCES' }} />
        <Tabs.Screen name="voice-ai" options={{ href: null, title: 'VOICE AI' }} />
        <Tabs.Screen name="whatsapp" options={{ href: null, title: 'WHATSAPP HUB' }} />
        <Tabs.Screen name="emails" options={{ href: null, title: 'EMAILS' }} />
        <Tabs.Screen name="analytics" options={{ href: null, title: 'ANALYTICS' }} />
        <Tabs.Screen name="agents" options={{ href: null, title: 'AGENTS SWARM' }} />
        <Tabs.Screen name="meetings" options={{ href: null, title: 'MEETINGS' }} />
        <Tabs.Screen name="custom-agents" options={{ href: null, title: 'CUSTOM AGENTS' }} />
        <Tabs.Screen name="workflows" options={{ href: null, title: 'WORKFLOWS' }} />
        <Tabs.Screen name="reports" options={{ href: null, title: 'REPORTS' }} />
        <Tabs.Screen name="multi-language" options={{ href: null, title: 'MULTI-LANGUAGE' }} />
        <Tabs.Screen name="settings" options={{ href: null, title: 'SETTINGS' }} />
        <Tabs.Screen name="explore" options={{ href: null, title: 'SHOWCASE' }} />
      </Tabs>

      {/* Global Tactical Sidebar Drawer */}
      <SidebarDrawer />
    </View>
  );
}
