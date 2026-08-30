/**
 * Tactical Command Mobile Forgot Password / Credential Recovery Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const { forgotPassword, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [simulatedToken, setSimulatedToken] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid official work email address.');
      return;
    }

    try {
      await forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
      // For local testing & sandbox field simulation
      setSimulatedToken(`demo_recovery_${Date.now()}`);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch recovery link. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: 56, paddingBottom: 60 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Back Link */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login' as any)}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 6 }}
        >
          <ArrowLeft size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 11, fontFamily: fonts.mono, fontWeight: '700' }}>
            BACK TO SIGN IN
          </Text>
        </TouchableOpacity>

        {/* Header Branding */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 2,
              backgroundColor: colors.surface,
              borderColor: colors.borderHighlight,
              borderWidth: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <KeyRound size={26} color={colors.primary} />
          </View>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: colors.primary,
              fontFamily: fonts.mono,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            SECURITY RECOVERY
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
            Reset Password
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'center' }}>
            Zero-enumeration cryptographic token recovery workflow
          </Text>
        </View>

        {submitted ? (
          /* Confirmation Success State */
          <Card variant="highlight" style={{ padding: 20 }}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: colors.surface,
                  borderColor: colors.success,
                  borderWidth: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <CheckCircle2 size={24} color={colors.success} />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: colors.success,
                  fontFamily: fonts.mono,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                DISPATCH INITIATED
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  lineHeight: 16,
                  fontFamily: fonts.mono,
                }}
              >
                If an active account exists for <Text style={{ color: colors.primary }}>{email}</Text>, a single-use recovery token has been queued to your inbox.
              </Text>
            </View>

            {/* Sandbox / Local Test Shortcut */}
            {simulatedToken && (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.borderHighlight,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontSize: 9, fontFamily: fonts.mono, color: colors.primary, fontWeight: '700', marginBottom: 4 }}>
                  FIELD DEMO / SANDBOX TOKEN:
                </Text>
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textMuted, marginBottom: 8 }}>
                  {simulatedToken}
                </Text>
                <Button
                  title="ENTER RESET KEY NOW"
                  variant="outline"
                  size="sm"
                  onPress={() => router.push(`/(auth)/reset-password?token=${simulatedToken}&email=${encodeURIComponent(email)}` as any)}
                />
              </View>
            )}

            <Button
              title="RETURN TO COMMAND LOGIN"
              variant="primary"
              size="md"
              onPress={() => router.push('/(auth)/login' as any)}
            />
          </Card>
        ) : (
          /* Input Form Card */
          <Card variant="highlight" style={{ padding: 20 }}>
            <Input
              label="REGISTERED WORK EMAIL"
              value={email}
              onChangeText={setEmail}
              placeholder="operator@enterprise.io"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {error ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <AlertCircle size={14} color={colors.danger} />
                <Text style={{ color: colors.danger, fontSize: 11, fontFamily: fonts.mono, flex: 1 }}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Button
              title="DISPATCH RECOVERY LINK"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              onPress={handleSubmit}
              style={{ marginTop: 4 }}
            />

            <View style={{ marginTop: 14, padding: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ fontSize: 9, color: colors.textMuted, fontFamily: fonts.mono, lineHeight: 14 }}>
                * Standard RFC-5321 envelope delivery with single-use DB-hashed recovery tokens. Tokens expire after 60 minutes.
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
