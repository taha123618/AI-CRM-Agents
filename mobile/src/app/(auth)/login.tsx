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
  Platform,
  StyleSheet,
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
            style={{ marginTop: 6 }}
          />
        </Card>

        {/* Quick Demo Preset Credentials */}
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: colors.textMuted,
              fontFamily: fonts.mono,
              marginBottom: 10,
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
