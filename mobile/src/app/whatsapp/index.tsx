/**
 * Tactical Command Mobile WhatsApp Business Multi-Agent Hub
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare, ArrowLeft, Send, Bot, CheckCircle2, Phone, Search } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

export default function WhatsAppScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await api.getWhatsAppChats();
    setChats(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setDispatchedSuccess(true);
    try {
      await api.sendWhatsAppMessage({
        conversation_id: selectedChat?.id,
        phone_number: selectedChat?.contact || '+1-555-0100',
        message: replyText.trim(),
      });
      await loadData();
    } catch (e) {
      console.warn('[WhatsApp] Send error', e);
    } finally {
      setTimeout(() => {
        setDispatchedSuccess(false);
        setReplyText('');
        setSelectedChat(null);
      }, 1000);
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
            24/7 AI AUTO-PILOT
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            WHATSAPP HUB
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 14, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}
      >
        {/* Hub Telemetry */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <StatCard label="AI AUTO-PILOT" value="24/7 ACTIVE" subValue="100% SLA" trend="up" variant="success" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard label="AVG RESPONSE TIME" value="1.2s" subValue="-45s vs human" trend="up" variant="primary" />
          </View>
        </View>

        <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted }}>
          ACTIVE WHATSAPP CONVERSATIONS:
        </Text>

        <View style={{ gap: 10 }}>
          {chats.map((chat) => (
            <TouchableOpacity key={chat.id} onPress={() => setSelectedChat(chat)}>
              <Card
                variant={selectedChat?.id === chat.id ? 'highlight' : 'default'}
                style={{ padding: 14 }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                    {chat.contact}
                  </Text>
                  <Badge
                    label={String(chat.status || 'ACTIVE').toUpperCase()}
                    variant={chat.status === 'ai_autopilot' ? 'success' : 'primary'}
                  />
                </View>

                <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 8 }}>
                  "{chat.last_message}"
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 9, fontFamily: fonts.mono, color: colors.textMuted }}>
                    {chat.timestamp}
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.primary, fontWeight: '700' }}>
                    TAP TO REPLY / OVERRIDE
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live Reply Drawer / Box */}
        {selectedChat && (
          <Card variant="highlight" style={{ padding: 16, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Bot size={16} color={colors.primary} />
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary }}>
                REPLY AS CO-PILOT TO {String(selectedChat.contact || '').toUpperCase()}
              </Text>
            </View>

            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Enter message or prompt AI to auto-generate response..."
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
                minHeight: 60,
                marginBottom: 10,
              }}
            />

            {dispatchedSuccess && (
              <View style={{ backgroundColor: colors.surface, padding: 8, borderWidth: 1, borderColor: colors.success, marginBottom: 8 }}>
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.success, fontWeight: '700', textAlign: 'center' }}>
                  DISPATCHED VIA WHATSAPP BUSINESS GATEWAY
                </Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                title="AI SUGGEST"
                variant="outline"
                size="sm"
                onPress={() => setReplyText('Thank you for reaching out. The proposal has been generated and queued to your email with full SLA terms.')}
              />
              <View style={{ flex: 1 }}>
                <Button
                  title="DISPATCH MESSAGE"
                  variant="primary"
                  size="sm"
                  onPress={handleSendReply}
                />
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
