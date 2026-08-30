/**
 * Tactical Command Mobile OTP Verification Screen
 * 2FA email verification after registration — 6-digit code entry with countdown.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ShieldCheck,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Clock,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const OTP_LENGTH = 6;
const OTP_EXPIRE_SECONDS = 2 * 60; // 2 minutes (120 seconds)

export default function VerifyOtpScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email || '';

  const { verifyOtp, resendOtp, isLoading } = useAuthStore();

  // 6-digit OTP input cells
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resending, setResending] = useState(false);

  // Countdown timer
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRE_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isExpired = secondsLeft <= 0;
  const otp = digits.join('');
  const isComplete = otp.length === OTP_LENGTH && !digits.includes('');

  const handleDigitChange = (value: string, index: number) => {
    // Handle paste: if multiple chars arrive, distribute across cells
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const newDigits = [...digits];
      cleaned.slice(0, OTP_LENGTH - index).split('').forEach((ch, i) => {
        if (index + i < OTP_LENGTH) newDigits[index + i] = ch;
      });
      setDigits(newDigits);
      setError('');
      const nextFocus = Math.min(index + cleaned.length, OTP_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }
    // Single digit
    const digit = cleaned.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError('');
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    if (!isComplete) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }
    if (isExpired) {
      setError('This code has expired. Please request a new one.');
      return;
    }

    setError('');
    try {
      await verifyOtp(email, otp);
      setSuccess(true);
      setTimeout(() => {
        router.replace('/(tabs)' as any);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
      // Shake/clear on error
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendMessage('');
    setError('');
    try {
      const res = await resendOtp(email);
      setResendMessage(res.message || 'A new code has been sent.');
      setSecondsLeft(OTP_EXPIRE_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.+)(?=@)/, (_, a, b) => `${a}${'*'.repeat(b.length)}`)
    : '****@****.com';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Back Link */}
      <TouchableOpacity
        onPress={() => router.push('/(auth)/register' as any)}
        style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingHorizontal: 20, marginBottom: 8, gap: 6 }}
      >
        <ArrowLeft size={16} color={colors.primary} />
        <Text style={{ color: colors.primary, fontSize: 11, fontFamily: fonts.mono, fontWeight: '700' }}>
          BACK TO REGISTER
        </Text>
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 28 }}>
          <View
            style={{
              width: 56,
              height: 56,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: success ? colors.success : colors.borderHighlight,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            {success ? (
              <CheckCircle2 size={28} color={colors.success} />
            ) : (
              <ShieldCheck size={28} color={colors.primary} />
            )}
          </View>

          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: colors.primary,
              fontFamily: fonts.mono,
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            2-FACTOR AUTHENTICATION
          </Text>

          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 6 }}>
            {success ? 'Identity Verified' : 'Verify Your Email'}
          </Text>

          {!success && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Mail size={12} color={colors.textMuted} />
              <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.mono, textAlign: 'center' }}>
                Code sent to {maskedEmail}
              </Text>
            </View>
          )}
        </View>

        {success ? (
          // ── Success State ─────────────────────────────────────────────
          <Card variant="highlight" style={{ padding: 28, alignItems: 'center' }}>
            <CheckCircle2 size={40} color={colors.success} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.success, fontFamily: fonts.mono, textTransform: 'uppercase', marginBottom: 8 }}>
              ACCOUNT ACTIVATED
            </Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, textAlign: 'center', lineHeight: 17 }}>
              Your identity has been confirmed. Routing to Command Dashboard...
            </Text>
            <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
          </Card>
        ) : (
          // ── OTP Entry Card ─────────────────────────────────────────────
          <Card variant="highlight" style={{ padding: 20 }}>
            {/* Countdown Timer */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginBottom: 20,
                padding: 8,
                backgroundColor: isExpired ? `${colors.danger}18` : `${colors.primary}15`,
                borderWidth: 1,
                borderColor: isExpired ? colors.danger : colors.border,
              }}
            >
              <Clock size={12} color={isExpired ? colors.danger : colors.primary} />
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: fonts.mono,
                  fontWeight: '700',
                  color: isExpired ? colors.danger : colors.primary,
                  letterSpacing: 1,
                }}
              >
                {isExpired ? 'CODE EXPIRED' : `EXPIRES IN ${formatTime(secondsLeft)}`}
              </Text>
            </View>

            {/* OTP Instructions */}
            <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono, textAlign: 'center', marginBottom: 16, letterSpacing: 0.5 }}>
              ENTER THE 6-DIGIT CODE FROM YOUR EMAIL
            </Text>

            {/* 6-Box Digit Input */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(ref) => { inputRefs.current[i] = ref; }}
                  value={digit}
                  onChangeText={(val) => handleDigitChange(val, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                  keyboardType="number-pad"
                  maxLength={6}
                  selectTextOnFocus
                  style={{
                    width: 44,
                    height: 54,
                    backgroundColor: colors.surface,
                    borderWidth: 1.5,
                    borderColor: digit
                      ? colors.primary
                      : error
                      ? colors.danger
                      : colors.border,
                    color: colors.text,
                    fontSize: 22,
                    fontWeight: '900',
                    fontFamily: fonts.mono,
                    textAlign: 'center',
                  }}
                  autoFocus={i === 0}
                />
              ))}
            </View>

            {/* Error Display */}
            {error ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14, padding: 10, backgroundColor: `${colors.danger}15`, borderWidth: 1, borderColor: colors.danger }}>
                <AlertCircle size={13} color={colors.danger} />
                <Text style={{ color: colors.danger, fontSize: 11, fontFamily: fonts.mono, flex: 1 }}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Resend success message */}
            {resendMessage ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14, padding: 10, backgroundColor: `${colors.success}15`, borderWidth: 1, borderColor: colors.success }}>
                <CheckCircle2 size={13} color={colors.success} />
                <Text style={{ color: colors.success, fontSize: 11, fontFamily: fonts.mono, flex: 1 }}>
                  {resendMessage}
                </Text>
              </View>
            ) : null}

            {/* Verify Button */}
            <Button
              title={isLoading ? 'VERIFYING...' : 'VERIFY & ACTIVATE ACCOUNT'}
              variant="primary"
              size="lg"
              isLoading={isLoading}
              onPress={handleVerify}
              style={{ marginBottom: 14 }}
            />

            {/* Resend OTP */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>
                DIDN'T RECEIVE THE CODE?
              </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={resending}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                {resending ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <RefreshCw size={11} color={colors.primary} />
                )}
                <Text style={{ color: colors.primary, fontSize: 10, fontFamily: fonts.mono, fontWeight: '700' }}>
                  {resending ? 'SENDING...' : 'RESEND CODE'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Security Notice */}
        {!success && (
          <View style={{ marginTop: 16, padding: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 9, color: colors.textMuted, fontFamily: fonts.mono, textAlign: 'center', lineHeight: 14 }}>
              🔒 SECURITY: Never share this code. AI CRM will never ask you for it via phone or chat.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
