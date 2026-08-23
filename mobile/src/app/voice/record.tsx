/**
 * Dedicated Voice Note & Field Audio Intelligence Recording Studio
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Mic,
  Square,
  ArrowLeft,
  Zap,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  Bot,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useVoiceNotesStore } from '@/stores/voiceNotesStore';
import { useDealsStore } from '@/stores/dealsStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export default function VoiceRecordScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const { saveNote } = useVoiceNotesStore();
  const { deals } = useDealsStore();

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || '');
  const [title, setTitle] = useState('');
  const [recordedState, setRecordedState] = useState<'idle' | 'recording' | 'analyzing' | 'completed'>('idle');

  // Simulated AI Generated Output after recording
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [buyerIntent, setBuyerIntent] = useState(85);
  const [actionItems, setActionItems] = useState<string[]>([]);

  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startRecording = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    setIsRecording(true);
    setSeconds(0);
    setRecordedState('recording');
  };

  const stopRecording = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setIsRecording(false);
    setRecordedState('analyzing');

    // Simulate AI synthesis
    setTimeout(() => {
      const selectedDeal = deals.find((d) => d.id === selectedDealId);
      const company = selectedDeal?.company_name || 'Prospect Client';

      setTitle(`Meeting Debrief with ${company}`);
      setTranscript(
        `Discussed Q4 expansion with ${company} executive committee. Pricing tier approved at $185k ARR. Primary objection regarding GDPR data residency was resolved with dedicated EU tenant configuration. Action item to send final contract addendum.`
      );
      setSummary(
        `Strong buying signal. Pricing approved at $185k. GDPR data residency resolved. Ready for contract execution.`
      );
      setBuyerIntent(92);
      setActionItems([
        `Dispatch GDPR data residency architecture brief to ${company}`,
        `Update deal stage to Negotiation`,
        `Draft executive contract addendum for review`,
      ]);
      setRecordedState('completed');
    }, 1200);
  };

  const handleSave = async () => {
    const selectedDeal = deals.find((d) => d.id === selectedDealId);

    await saveNote({
      title: title || `Field Note: ${selectedDeal?.name || 'Prospect'}`,
      duration_seconds: seconds || 45,
      transcript: transcript || 'Client meeting summary recorded.',
      summary: summary || 'Positive engagement. Next steps established.',
      sentiment: buyerIntent >= 75 ? 'positive' : 'neutral',
      buyer_intent_score: buyerIntent,
      action_items: actionItems,
      entity_type: 'deal',
      entity_id: selectedDealId,
      entity_name: selectedDeal?.name || 'General Prospect',
    });

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
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
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: colors.primary,
              fontFamily: fonts.mono,
              textTransform: 'uppercase',
            }}
          >
            AI INTELLIGENCE RECORDER
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
            Voice Field Note Studio
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        {/* Deal Association Dropdown */}
        <Card style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: colors.textSecondary,
              fontFamily: fonts.mono,
              marginBottom: 8,
              textTransform: 'uppercase',
            }}
          >
            ASSOCIATE AUDIO NOTE WITH DEAL:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {deals.map((d) => {
              const isSelected = selectedDealId === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedDealId(d.id)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: 1,
                    borderRadius: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      fontFamily: fonts.mono,
                      color: isSelected ? colors.primaryText : colors.text,
                    }}
                  >
                    {d.name.split('—')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Card>

        {/* Central Audio Recording Studio Card */}
        <Card
          variant={isRecording ? 'danger' : 'highlight'}
          style={{
            alignItems: 'center',
            paddingVertical: 28,
            marginBottom: 16,
            backgroundColor: isRecording ? colors.cardSubtle : colors.card,
          }}
        >
          {/* Waveform Visualizer Simulation */}
          <View style={{ flexDirection: 'row', alignItems: 'center', height: 40, gap: 4, marginBottom: 16 }}>
            {[12, 28, 18, 36, 24, 40, 16, 32, 20, 38, 22, 14].map((h, i) => (
              <View
                key={i}
                style={{
                  width: 4,
                  height: isRecording ? (h * ((i % 3) + 1)) % 38 + 6 : 8,
                  backgroundColor: isRecording ? colors.danger : colors.borderHighlight,
                  borderRadius: 2,
                }}
              />
            ))}
          </View>

          {/* Timer Display */}
          <Text
            style={{
              fontSize: 36,
              fontWeight: '800',
              fontFamily: fonts.mono,
              color: isRecording ? colors.danger : colors.text,
              marginBottom: 20,
            }}
          >
            {formatTime(seconds)}
          </Text>

          {/* Record Control Button */}
          {!isRecording ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={startRecording}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.danger,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 4,
                borderColor: 'rgba(255, 42, 84, 0.3)',
              }}
            >
              <Mic size={32} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={stopRecording}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: colors.danger,
              }}
            >
              <Square size={28} color={colors.danger} />
            </TouchableOpacity>
          )}

          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: isRecording ? colors.danger : colors.textMuted,
              fontFamily: fonts.mono,
              marginTop: 14,
              textTransform: 'uppercase',
            }}
          >
            {isRecording ? '● RECORDING IN PROGRESS...' : recordedState === 'analyzing' ? 'SYNTHESIZING WITH VOICE AI...' : 'TAP MIC TO START RECORDING'}
          </Text>
        </Card>

        {/* AI Synthesis Preview Card */}
        {recordedState === 'completed' && (
          <Card variant="highlight" style={{ backgroundColor: colors.surface, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Sparkles size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: colors.primary,
                    fontFamily: fonts.mono,
                    textTransform: 'uppercase',
                  }}
                >
                  Voice AI Analysis
                </Text>
              </View>

              <Badge label={`${buyerIntent}% BUYER INTENT`} variant="success" size="sm" />
            </View>

            <Input
              label="NOTE TITLE"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter note title..."
            />

            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 4 }}>
                EXECUTIVE SUMMARY:
              </Text>
              <Text style={{ fontSize: 13, color: colors.text, lineHeight: 18 }}>
                {summary}
              </Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 6 }}>
                EXTRACTED ACTION ITEMS:
              </Text>
              {actionItems.map((act, i) => (
                <Text key={i} style={{ fontSize: 12, color: colors.text, marginBottom: 3 }}>
                  • {act}
                </Text>
              ))}
            </View>

            <Button
              title="SAVE TO CRM & DISPATCH ACTION TASKS"
              variant="primary"
              size="lg"
              onPress={handleSave}
            />
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
