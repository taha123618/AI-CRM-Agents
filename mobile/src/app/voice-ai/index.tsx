/**
 * Tactical Command Mobile Voice AI Call Intelligence Studio
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Mic, ArrowLeft, Play, ShieldAlert, Sparkles, CheckCircle2, PhoneCall, Volume2, Square } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { VoicePlaybackService } from '@/services/voicePlaybackService';

export default function VoiceAIScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [speakingCard, setSpeakingCard] = useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      VoicePlaybackService.stopVoice();
    };
  }, []);

  const playObjection = async (id: string, text: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    if (speakingCard === id) {
      await VoicePlaybackService.stopVoice();
      setSpeakingCard(null);
    } else {
      setSpeakingCard(id);
      await VoicePlaybackService.playVoice(text, {
        onStart: () => setSpeakingCard(id),
        onDone: () => setSpeakingCard(null),
        onStopped: () => setSpeakingCard(null),
        rate: 1.05,
      });
    }
  };

  const triggerAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 1200);
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
            AUDIO INTELLIGENCE
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            VOICE AI STUDIO
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 14, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Record New Call Debrief Action */}
        <Card variant="highlight" style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <View style={{ width: 36, height: 36, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}>
              <Mic size={20} color={colors.background} />
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                FIELD VOICE DEBRIEF STUDIO
              </Text>
              <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.primary }}>
                LIVE SPEECH-TO-CRM EXTRACTION
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 12, lineHeight: 16 }}>
            Record on-site client interactions to extract buyer intent, synthesize CRM notes, and generate action items automatically.
          </Text>

          <Button
            title="LAUNCH RECORDING STUDIO"
            variant="primary"
            size="md"
            onPress={() => router.push('/voice/record' as any)}
          />
        </Card>

        {/* Real-time Intent & Sentiment Radar */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <StatCard label="AVG BUYER INTENT" value="88 / 100" subValue="+12 pts vs last wk" trend="up" variant="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard label="OBJECTION WIN RATE" value="79.3%" subValue="AI Battlecards" trend="up" variant="success" />
          </View>
        </View>

        {/* Objection Battlecards */}
        <Card style={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary }}>
              LIVE OBJECTION BATTLECARDS
            </Text>
            <Badge label="AI ACTIVE" variant="success" />
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ backgroundColor: colors.surface, padding: 10, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.danger, fontFamily: fonts.mono, flex: 1 }}>
                  OBJECTION: "We already have Salesforce licenses for 2 years."
                </Text>
                <TouchableOpacity
                  onPress={() => playObjection('sf', 'We sit directly alongside your existing database as an autonomous multi-agent co-pilot with zero data migration required.')}
                  style={{ padding: 4 }}
                >
                  {speakingCard === 'sf' ? <Square size={14} color={colors.primary} /> : <Volume2 size={14} color={colors.primary} />}
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 10, color: colors.textSecondary, fontFamily: fonts.mono, lineHeight: 14 }}>
                COUNTER: "We sit directly alongside your existing database as an autonomous multi-agent co-pilot with zero data migration required."
              </Text>
            </View>

            <View style={{ backgroundColor: colors.surface, padding: 10, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.danger, fontFamily: fonts.mono, flex: 1 }}>
                  OBJECTION: "Is client call data retained for model training?"
                </Text>
                <TouchableOpacity
                  onPress={() => playObjection('gdpr', 'No. Enterprise Zero Data Retention SLA applies with end-to-end encryption.')}
                  style={{ padding: 4 }}
                >
                  {speakingCard === 'gdpr' ? <Square size={14} color={colors.primary} /> : <Volume2 size={14} color={colors.primary} />}
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 10, color: colors.textSecondary, fontFamily: fonts.mono, lineHeight: 14 }}>
                COUNTER: "No. Enterprise Zero Data Retention SLA applies with end-to-end encryption."
              </Text>
            </View>
          </View>
        </Card>

        {/* Post-Call Synthesis Demo */}
        <Card variant="highlight" style={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary }}>
              AI CALL SYNTHESIS ENGINE
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 12, lineHeight: 16 }}>
            Run deep NLP extraction on recent call transcript to detect decision maker sentiment and update CRM deals.
          </Text>

          {analyzed ? (
            <View style={{ backgroundColor: colors.surface, padding: 10, borderWidth: 1, borderColor: colors.success, marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={16} color={colors.success} />
                <Text style={{ fontSize: 11, fontFamily: fonts.mono, color: colors.success, fontWeight: '700' }}>
                  CRM SYNTHESIZED • BUYER INTENT: 92/100
                </Text>
              </View>
              <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textMuted, marginTop: 4 }}>
                Extracted 3 action items and synced to Deal War Room.
              </Text>
            </View>
          ) : null}

          <Button
            title={analyzing ? "SYNTHESIZING CALL INTELLIGENCE..." : "RUN AI TRANSCRIPT ANALYSIS"}
            variant="outline"
            size="md"
            isLoading={analyzing}
            onPress={triggerAnalysis}
          />
        </Card>
      </ScrollView>
    </View>
  );
}
