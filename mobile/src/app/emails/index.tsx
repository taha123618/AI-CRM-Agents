/**
 * Tactical Command Mobile Autonomous Email Intelligence Studio
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, Send, Sparkles, CheckCircle2, ShieldCheck, Filter } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

export default function EmailsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [to, setTo] = useState('executive@targetcompany.com');
  const [subject, setSubject] = useState('Enterprise Tier Proposal & Platform Architecture Review');
  const [body, setBody] = useState('Hi Sarah,\n\nFollowing up on our discovery session yesterday, I have attached our enterprise architecture overview and SLA terms for your team.\n\nBest regards,\nAlex Mercer');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await api.getEmails();
    setEmails(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSend = async () => {
    setSending(true);
    try {
      await api.sendEmail({
        to_email: to,
        subject,
        body,
      });
      await loadData();
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setComposing(false);
      }, 1000);
    } catch (e) {
      console.warn('[Emails] Send error', e);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Tactical Bar */}
      <View
        style={{
          paddingTop: 54,
          paddingBottom: 14,
          paddingHorizontal: 16,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 11, fontFamily: fonts.mono, fontWeight: '700' }}>
            COMMAND
          </Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 9, fontFamily: fonts.mono, color: colors.textMuted, textTransform: 'uppercase' }}>
            TASK QUEUE RFC-5321
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            EMAIL INTELLIGENCE
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 14, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
      >
        {/* Compose CTA Button */}
        <Button
          title={composing ? "COLLAPSE COMPOSER" : "COMPOSE AI SMART EMAIL"}
          variant="primary"
          size="md"
          onPress={() => setComposing(!composing)}
        />

        {/* AI Email Composer Drawer */}
        {composing && (
          <Card variant="highlight" style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Sparkles size={16} color={colors.primary} />
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary }}>
                AI-ENHANCED OUTBOUND COMPOSER
              </Text>
            </View>

            <View style={{ gap: 8, marginBottom: 12 }}>
              <TextInput
                value={to}
                onChangeText={setTo}
                placeholder="Recipient Email"
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  padding: 8,
                  color: colors.text,
                  fontFamily: fonts.mono,
                  fontSize: 11,
                }}
              />
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Subject Line"
                placeholderTextColor={colors.textMuted}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  padding: 8,
                  color: colors.text,
                  fontFamily: fonts.mono,
                  fontSize: 11,
                }}
              />
              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder="Email content..."
                placeholderTextColor={colors.textMuted}
                multiline
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  padding: 10,
                  color: colors.text,
                  fontFamily: fonts.mono,
                  fontSize: 11,
                  minHeight: 90,
                }}
              />
            </View>

            {sentSuccess && (
              <View style={{ backgroundColor: colors.surface, padding: 8, borderWidth: 1, borderColor: colors.success, marginBottom: 10 }}>
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.success, fontWeight: '700', textAlign: 'center' }}>
                  ENQUEUED TO TASK QUEUE & DISPATCHED VIA GMAIL SMTP
                </Text>
              </View>
            )}

            <Button
              title={sending ? "DISPATCHING VIA TASK QUEUE..." : "DISPATCH OUTBOUND EMAIL"}
              variant="primary"
              size="sm"
              isLoading={sending}
              onPress={handleSend}
            />
          </Card>
        )}

        {/* Email Stream */}
        <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted }}>
          SYNTHESIZED EMAIL INBOX:
        </Text>

        <View style={{ gap: 10 }}>
          {emails.map((em) => (
            <Card key={em.id} style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text, flex: 1 }}>
                  {em.subject}
                </Text>
                <Badge
                  label={String(em?.sentiment || 'NEUTRAL').toUpperCase()}
                  variant={em.sentiment === 'positive' ? 'success' : 'warning'}
                />
              </View>

              <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 8 }}>
                From: {em.sender}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 9, fontFamily: fonts.mono, color: colors.textMuted }}>
                  {em.date}
                </Text>
                <Badge label={`${String(em?.urgency || 'MEDIUM').toUpperCase()} URGENCY`} variant={em.urgency === 'high' ? 'danger' : 'primary'} />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
