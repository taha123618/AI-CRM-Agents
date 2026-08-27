/**
 * Tactical Command Mobile Register / Operator Provisioning Screen
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
import { UserPlus, Lock, Mail, User, Building, AlertCircle, CheckCircle2, ArrowLeft, Shield } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function RegisterScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const { register, ssoLogin, isLoading } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'sales' | 'support' | 'auditor'>('sales');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password strength checks
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasMinLength, hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;

  const handleRegister = async () => {
    setError('');

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation password.');
      return;
    }

    if (score < 4) {
      setError('Password must satisfy security complexity rules (min 8 chars, mixed case, numbers, symbols).');
      return;
    }

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });
      setSuccess(true);
      setTimeout(() => {
        router.replace('/(tabs)' as any);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please verify your inputs.');
    }
  };

  const handleSsoClick = async (provider: 'google' | 'microsoft') => {
    try {
      const ok = await ssoLogin(
        provider,
        `sso_mobile_${provider}_${Date.now()}`,
        provider === 'google' ? 'field.operator@google.com' : 'field.rep@microsoft.com',
        provider === 'google' ? 'Google Workspace Operator' : 'Microsoft Entra Operator'
      );
      if (ok) {
        router.replace('/(tabs)' as any);
      }
    } catch (err: any) {
      setError(`SSO Registration failed: ${err.message}`);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: 48, paddingBottom: 60 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Back Link */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 6 }}
        >
          <ArrowLeft size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 11, fontFamily: fonts.mono, fontWeight: '700' }}>
            BACK TO LOGIN
          </Text>
        </TouchableOpacity>

        {/* Header Branding */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
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
              marginBottom: 10,
            }}
          >
            <UserPlus size={24} color={colors.primary} />
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
            OPERATOR PROVISIONING
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>
            Create Field Account
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, textAlign: 'center' }}>
            Provision tactical credentials for autonomous CRM operations
          </Text>
        </View>

        {/* SSO Quick Provisioning */}
        <View style={{ gap: 8, marginBottom: 16 }}>
          <Button
            title="REGISTER WITH GOOGLE WORKSPACE"
            variant="outline"
            size="md"
            onPress={() => handleSsoClick('google')}
            disabled={isLoading}
          />
          <Button
            title="REGISTER WITH MICROSOFT ENTRA"
            variant="outline"
            size="md"
            onPress={() => handleSsoClick('microsoft')}
            disabled={isLoading}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 14 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ marginHorizontal: 10, color: colors.textMuted, fontSize: 10, fontFamily: fonts.mono }}>
            OR ENROLL VIA CREDENTIALS
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        {/* Form Card */}
        <Card variant="highlight" style={{ padding: 18 }}>
          <Input
            label="FULL NAME"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Alex Mercer"
            autoCapitalize="words"
          />

          <Input
            label="OFFICIAL WORK EMAIL"
            value={email}
            onChangeText={setEmail}
            placeholder="alex.mercer@enterprise.io"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Role Assignment Selector */}
          <View style={{ marginBottom: 14 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: colors.textMuted,
                fontFamily: fonts.mono,
                marginBottom: 6,
                letterSpacing: 0.5,
              }}
            >
              DEPLOYMENT ROLE (RBAC LEVEL):
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['sales', 'support', 'auditor'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 6,
                    backgroundColor: role === r ? colors.primary : colors.surface,
                    borderColor: role === r ? colors.primary : colors.border,
                    borderWidth: 1,
                    borderRadius: 2,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      fontFamily: fonts.mono,
                      color: role === r ? colors.background : colors.textSecondary,
                      textTransform: 'uppercase',
                    }}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ fontSize: 9, color: colors.textMuted, fontFamily: fonts.mono, marginTop: 4 }}>
              * Super Admin (admin) requires manual authorization by root officer.
            </Text>
          </View>

          <Input
            label="SECURITY PASSWORD"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            secureTextEntry
          />

          {/* Password Strength Meter */}
          {password.length > 0 && (
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
              <Text style={{ fontSize: 8, color: colors.textMuted, fontFamily: fonts.mono, marginTop: 4 }}>
                Requirements: 8+ chars • Uppercase • Lowercase • Digit • Special symbol
              </Text>
            </View>
          )}

          <Input
            label="CONFIRM PASSWORD"
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
                OPERATOR REGISTERED. INITIALIZING HUD...
              </Text>
            </View>
          ) : null}

          <Button
            title="PROVISION & INITIALIZE COMMAND"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            onPress={handleRegister}
            style={{ marginTop: 4 }}
          />
        </Card>

        {/* Existing Account Footer */}
        <View style={{ marginTop: 24, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: fonts.mono }}>
            ALREADY ENROLLED IN FLEET?
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login' as any)}>
            <Text style={{ color: colors.primary, fontSize: 11, fontFamily: fonts.mono, fontWeight: '700' }}>
              SIGN IN
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
