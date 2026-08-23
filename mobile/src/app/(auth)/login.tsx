/**
 * Tactical Command Mobile Login Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Zap, Lock, Mail } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const success = await login(email, password);
    if (success) {
      router.replace('/(tabs)' as any);
    } else {
      setError('Invalid credentials. Please verify your email and password.');
    }
  };

  const handleDemoPreset = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('admin123');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        {/* Branding Header */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 2,
              backgroundColor: colors.surface,
              borderColor: colors.borderHighlight,
              borderWidth: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Shield size={28} color={colors.primary} />
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: colors.primary,
              fontFamily: fonts.mono,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            TACTICAL AI CRM
          </Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
            Field Sales Command
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
            Autonomous Multi-Agent Intelligence On-The-Go
          </Text>
        </View>

        {/* Login Form Card */}
        <Card variant="highlight" style={{ padding: 20 }}>
          <Input
            label="OFFICIAL EMAIL"
            value={email}
            onChangeText={setEmail}
            placeholder="admin@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="SECURITY PASSWORD"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <View style={{ alignItems: 'flex-end', marginBottom: 12 }}>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password' as any)}>
              <Text style={{ color: colors.primary, fontSize: 10, fontFamily: fonts.mono, fontWeight: '700' }}>
                FORGOT PASSWORD?
              </Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <Text
              style={{
                color: colors.danger,
                fontSize: 12,
                fontFamily: fonts.mono,
                marginBottom: 12,
              }}
            >
              {error}
            </Text>
          ) : null}

          <Button
            title="AUTHENTICATE & ENTER COMMAND"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            onPress={handleLogin}
            style={{ marginTop: 2 }}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 14 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <Text style={{ marginHorizontal: 8, color: colors.textMuted, fontSize: 9, fontFamily: fonts.mono }}>
              OR SIGN IN WITH SSO
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          <View style={{ gap: 6 }}>
            <Button
              title="GOOGLE WORKSPACE SSO"
              variant="outline"
              size="sm"
              onPress={async () => {
                const ok = await useAuthStore.getState().ssoLogin('google', `sso_google_${Date.now()}`);
                if (ok) router.replace('/(tabs)' as any);
              }}
            />
            <Button
              title="MICROSOFT ENTRA SSO"
              variant="outline"
              size="sm"
              onPress={async () => {
                const ok = await useAuthStore.getState().ssoLogin('microsoft', `sso_ms_${Date.now()}`);
                if (ok) router.replace('/(tabs)' as any);
              }}
            />
          </View>
        </Card>

        {/* Register Account Footer */}
        <View style={{ marginTop: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: fonts.mono }}>
            NEW TO FIELD COMMAND?
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register' as any)}>
            <Text style={{ color: colors.primary, fontSize: 11, fontFamily: fonts.mono, fontWeight: '700' }}>
              ENROLL OPERATOR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Demo Preset Credentials */}
        <View style={{ marginTop: 18, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '600',
              color: colors.textMuted,
              fontFamily: fonts.mono,
              marginBottom: 8,
              textTransform: 'uppercase',
            }}
          >
            QUICK FIELD ACCESS PRESETS:
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => handleDemoPreset('admin@gmail.com')}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 2,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: colors.primary, fontSize: 11, fontFamily: fonts.mono, fontWeight: '700' }}>
                ADMIN ROLE
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDemoPreset('sales@aicrm.dev')}
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 2,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: fonts.mono, fontWeight: '700' }}>
                FIELD REP ROLE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
