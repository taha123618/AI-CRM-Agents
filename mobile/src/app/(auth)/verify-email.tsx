/**
 * Tactical Command Mobile Email Verification Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MailCheck, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Shield } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function VerifyEmailScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const { verifyEmail, isLoading } = useAuthStore();

  const [token, setToken] = useState(params.token || '');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>(
    params.token ? 'verifying' : 'idle'
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (params.token) {
      handleVerify(params.token);
    }
  }, [params.token]);

  const handleVerify = async (tokToVerify?: string) => {
    const activeToken = tokToVerify || token;
    if (!activeToken.trim()) {
      setStatus('error');
      setMessage('A valid verification token is required.');
      return;
    }

    setStatus('verifying');
    try {
      const res = await verifyEmail(activeToken.trim());
      setStatus('success');
      setMessage(res.message || 'Email address successfully verified. Operator account is now active.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Verification token is invalid or has expired.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 56 }}>
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

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
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
            <MailCheck size={26} color={colors.primary} />
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
            IDENTITY VERIFICATION
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
            Verify Official Email
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'center' }}>
            Confirm mailbox ownership to unlock full CRM swarm telemetry
          </Text>
        </View>

        {/* Verification Status Card */}
        <Card variant="highlight" style={{ padding: 20 }}>
          {status === 'verifying' ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 12 }} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary, fontFamily: fonts.mono }}>
                VALIDATING CRYPTOGRAPHIC TOKEN...
              </Text>
            </View>
          ) : status === 'success' ? (
            <View style={{ alignItems: 'center' }}>
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
                  marginBottom: 6,
                  textTransform: 'uppercase',
                }}
              >
                MAILBOX VERIFIED
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  fontFamily: fonts.mono,
                  lineHeight: 16,
                  marginBottom: 16,
                }}
              >
                {message}
              </Text>
              <Button
                title="PROCEED TO COMMAND LOGIN"
                variant="primary"
                size="md"
                onPress={() => router.push('/(auth)/login' as any)}
              />
            </View>
          ) : (
            <View>
              <Input
                label="VERIFICATION TOKEN"
                value={token}
                onChangeText={setToken}
                placeholder="paste_email_token_here"
                autoCapitalize="none"
              />

              {status === 'error' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <AlertCircle size={14} color={colors.danger} />
                  <Text style={{ color: colors.danger, fontSize: 11, fontFamily: fonts.mono, flex: 1 }}>
                    {message}
                  </Text>
                </View>
              )}

              <Button
                title="VERIFY & CONFIRM MAILBOX"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                onPress={() => handleVerify()}
                style={{ marginTop: 4 }}
              />
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}
