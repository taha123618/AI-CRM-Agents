/**
 * Tactical Command Mobile 403 Unauthorized / Access Restricted Screen
 * Directly mapped to frontend/src/pages/UnauthorizedPage.tsx
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function UnauthorizedScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 56 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Header Warning Icon */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 2,
              backgroundColor: colors.surface,
              borderColor: colors.danger,
              borderWidth: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <ShieldAlert size={28} color={colors.danger} />
          </View>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: colors.danger,
              fontFamily: fonts.mono,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            SECURITY RESTRICTION
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
            403 — Insufficient Privileges
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'center', fontFamily: fonts.mono }}>
            ROLE-BASED ACCESS CONTROL (RBAC) AUTHORIZATION REQUIRED
          </Text>
        </View>

        {/* Warning Card */}
        <Card variant="danger" style={{ padding: 20, marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 11,
              color: colors.textSecondary,
              lineHeight: 16,
              fontFamily: fonts.mono,
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            YOUR CURRENT OPERATOR ROLE (
            <Text style={{ color: colors.primary, fontWeight: '700' }}>
              {user?.role || 'GUEST'}
            </Text>
            ) DOES NOT HAVE PERMISSION TO ACCESS THIS COMMAND RESOURCE.
          </Text>

          {/* Session Telemetry Box */}
          <View
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderWidth: 1,
              padding: 12,
              gap: 6,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>OPERATOR ID:</Text>
              <Text style={{ fontSize: 10, color: colors.text, fontFamily: fonts.mono }}>
                {user?.email || 'UNAUTHENTICATED'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>DEPARTMENT / ROLE:</Text>
              <Text style={{ fontSize: 10, color: colors.primary, fontFamily: fonts.mono, fontWeight: '700', textTransform: 'uppercase' }}>
                {user?.role || 'NONE'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Controls */}
        <View style={{ gap: 10 }}>
          <Button
            title="RETURN TO COMMAND DASHBOARD"
            variant="primary"
            size="lg"
            onPress={() => router.replace('/(tabs)' as any)}
          />

          <Button
            title="TERMINATE SESSION & SIGN OUT"
            variant="outline"
            size="md"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </View>
  );
}
