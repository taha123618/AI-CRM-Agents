/**
 * Tactical Command Mobile Reset Password Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ResetPasswordScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const { resetPassword, isLoading } = useAuthStore();

  const [token, setToken] = useState(params.token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (params.token) {
      setToken(params.token);
    }
  }, [params.token]);

  // Password strength checks
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const score = [hasMinLength, hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;

  const handleReset = async () => {
    setError('');

    if (!token.trim()) {
      setError('A valid single-use reset token is required.');
      return;
    }

    if (!newPassword || newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your new password.');
      return;
    }

    if (score < 4) {
      setError('New password must satisfy complexity rules (min 8 chars, uppercase, lowercase, numbers, symbols).');
      return;
    }

    try {
      await resetPassword({
        token: token.trim(),
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        router.replace('/(auth)/login' as any);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Password reset failed. Invalid or expired token.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: 56, paddingBottom: 40 }}>
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
            <ShieldCheck size={26} color={colors.primary} />
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
            CREDENTIAL OVERWRITE
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
            Set New Password
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'center' }}>
            Re-encrypt operator credentials with modern SHA-256 single-use token
          </Text>
        </View>

        {/* Reset Form Card */}
        <Card variant="highlight" style={{ padding: 20 }}>
          <Input
            label="RECOVERY TOKEN / AUTHORIZATION KEY"
            value={token}
            onChangeText={setToken}
            placeholder="paste_single_use_token_here"
            autoCapitalize="none"
          />

          <Input
            label="NEW SECURITY PASSWORD"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••••••"
            secureTextEntry
          />

          {/* Complexity Meter */}
          {newPassword.length > 0 && (
            <View style={{ marginBottom: 12, padding: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 9, fontFamily: fonts.mono, color: colors.textMuted }}>COMPLEXITY SCORE:</Text>
                <Text
                  style={{
                    fontSize: 9,
                    fontFamily: fonts.mono,
                    fontWeight: '700',
                    color: score >= 4 ? colors.success : score >= 3 ? colors.warning : colors.danger,
                  }}
                >
                  {score >= 4 ? 'STRONG' : score >= 3 ? 'MODERATE' : 'WEAK'} ({score}/5)
                </Text>
              </View>
              <View style={{ height: 3, backgroundColor: colors.border, flexDirection: 'row' }}>
                <View
                  style={{
                    flex: score / 5,
                    backgroundColor: score >= 4 ? colors.success : score >= 3 ? colors.warning : colors.danger,
                  }}
                />
              </View>
            </View>
          )}

          <Input
            label="CONFIRM NEW PASSWORD"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••••••"
            secureTextEntry
          />

          {error ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <AlertCircle size={14} color={colors.danger} />
              <Text style={{ color: colors.danger, fontSize: 11, fontFamily: fonts.mono, flex: 1 }}>
                {error}
              </Text>
            </View>
          ) : null}

          {success ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <CheckCircle2 size={14} color={colors.success} />
              <Text style={{ color: colors.success, fontSize: 11, fontFamily: fonts.mono }}>
                PASSWORD RE-ENCRYPTED. REDIRECTING TO SIGN IN...
              </Text>
            </View>
          ) : null}

          <Button
            title="APPLY NEW CREDENTIALS"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            onPress={handleReset}
            style={{ marginTop: 4 }}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
