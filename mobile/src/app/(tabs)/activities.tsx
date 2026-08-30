/**
 * Voice Notes & Field Activity Logging Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import {
  Mic,
  CheckCircle2,
  Circle,
  Clock,
  Check,
  Volume2,
  Plus,
  Search,
  Play,
  Square,
  Sparkles,
  Menu,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useVoiceNotesStore } from '@/stores/voiceNotesStore';
import { VoiceNote } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AnimatedEntrance } from '@/components/ui/AnimatedEntrance';
import { ScalePressable } from '@/components/ui/ScalePressable';
import { VoicePlaybackService } from '@/services/voicePlaybackService';

const FILTER_TABS = [
  { key: 'all', label: 'ALL DEBRIEFS' },
  { key: 'high', label: 'HIGH INTENT (≥80%)' },
  { key: 'positive', label: 'POSITIVE' },
  { key: 'offline', label: 'CACHED OFFLINE' },
];

export default function ActivitiesScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const openSidebar = useSidebarStore((state) => state.openSidebar);

  const { notes, isLoading, fetchNotes } = useVoiceNotesStore();
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
    return () => {
      VoicePlaybackService.stopVoice();
    };
  }, []);

  const toggleTask = (taskId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setCompletedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handlePlayToggle = async (note: VoiceNote) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    if (playingId === note.id) {
      await VoicePlaybackService.stopVoice();
      setPlayingId(null);
    } else {
      setPlayingId(note.id);
      const textToSpeak = `${note.title}. Executive summary: ${note.summary}. Transcript snippet: ${note.transcript}`;

      await VoicePlaybackService.playVoice(textToSpeak, {
        onStart: () => setPlayingId(note.id),
        onDone: () => setPlayingId(null),
        onStopped: () => setPlayingId(null),
        rate: 1.05,
      });
    }
  };

  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.summary.toLowerCase().includes(q) ||
      n.transcript.toLowerCase().includes(q) ||
      n.entity_name?.toLowerCase().includes(q);

    let matchesFilter = true;
    if (selectedFilter === 'high') matchesFilter = n.buyer_intent_score >= 80;
    else if (selectedFilter === 'positive') matchesFilter = n.sentiment === 'positive';
    else if (selectedFilter === 'offline') matchesFilter = !n.is_synced;

    return matchesSearch && matchesFilter;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Header */}
      <View
        style={{
          paddingTop: 54,
          paddingBottom: 14,
          paddingHorizontal: 16,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: colors.primary,
                fontFamily: fonts.mono,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              FIELD INTELLIGENCE
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: colors.text,
              }}
            >
              Voice Notes & Debriefs
            </Text>
          </View>

          <Button
            title="RECORD"
            size="sm"
            variant="primary"
            icon={<Mic size={14} color={colors.primaryText} />}
            onPress={() => router.push('/voice/record' as any)}
          />
        </View>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 2,
            paddingHorizontal: 10,
          }}
        >
          <Search size={16} color={colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search transcripts, summaries, accounts..."
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 8,
              color: colors.text,
              fontSize: 13,
            }}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={{ backgroundColor: colors.cardSubtle, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}>
          {FILTER_TABS.map((tab) => {
            const active = selectedFilter === tab.key;
            return (
              <ScalePressable
                key={tab.key}
                scaleTo={0.94}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setSelectedFilter(tab.key);
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 2,
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                  borderWidth: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    fontFamily: fonts.mono,
                    color: active ? colors.primaryText : colors.textSecondary,
                  }}
                >
                  {tab.label}
                </Text>
              </ScalePressable>
            );
          })}
        </ScrollView>
      </View>

      {/* High-Performance FlashList */}
      <FlashList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchNotes} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Card style={{ padding: 24, alignItems: 'center', marginTop: 20 }}>
            <Mic size={32} color={colors.textMuted} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 4 }}>
              No Voice Notes Found
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
              Capture meeting audio in the field to automatically generate AI summaries and CRM action items.
            </Text>
            <Button
              title="START RECORDING"
              variant="primary"
              onPress={() => router.push('/voice/record' as any)}
            />
          </Card>
        }
        renderItem={({ item: note, index }) => {
          const isPlaying = playingId === note.id;

          return (
            <AnimatedEntrance animation="fadeInUp" index={index} staggerMs={40}>
              <Card key={note.id} style={{ marginBottom: 14 }}>
              {/* Title & Intent Score */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: colors.text,
                      marginBottom: 2,
                    }}
                  >
                    {note.title}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.mono }}>
                    ⏱️ {note.duration_seconds}s • Linked to {note.entity_name || 'Prospect'}
                  </Text>
                </View>

                <Badge
                  label={`${note.buyer_intent_score}% INTENT`}
                  variant={
                    note.buyer_intent_score >= 80
                      ? 'success'
                      : note.buyer_intent_score >= 60
                      ? 'warning'
                      : 'danger'
                  }
                />
              </View>

              {/* Audio Playback Bar with Real Speech Synthesis */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surface,
                  padding: 8,
                  borderWidth: 1,
                  borderColor: isPlaying ? colors.primary : colors.borderMuted,
                  borderRadius: 2,
                  marginVertical: 4,
                  gap: 8,
                }}
              >
                <TouchableOpacity
                  onPress={() => handlePlayToggle(note)}
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor: isPlaying ? colors.primary : colors.card,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 2,
                  }}
                >
                  {isPlaying ? (
                    <Square size={12} color={colors.primaryText} />
                  ) : (
                    <Play size={12} color={colors.primary} />
                  )}
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        width: isPlaying ? '100%' : '0%',
                        backgroundColor: isPlaying ? colors.primary : colors.textMuted,
                      }}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {isPlaying && <Volume2 size={12} color={colors.primary} />}
                  <Text style={{ fontSize: 10, color: isPlaying ? colors.primary : colors.textMuted, fontFamily: fonts.mono, fontWeight: isPlaying ? '700' : '400' }}>
                    {isPlaying ? 'AUDIO ACTIVE' : `00:${note.duration_seconds < 10 ? '0' : ''}${note.duration_seconds}`}
                  </Text>
                </View>
              </View>

              {/* AI Summary */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  padding: 10,
                  borderRadius: 2,
                  marginVertical: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: colors.primary,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: colors.primary,
                    fontFamily: fonts.mono,
                    marginBottom: 2,
                  }}
                >
                  AI SYNTHESIZED EXECUTIVE SUMMARY:
                </Text>
                <Text style={{ fontSize: 13, color: colors.text, lineHeight: 18 }}>
                  {note.summary}
                </Text>
              </View>

              {/* Transcript Snippet */}
              <Text
                numberOfLines={2}
                style={{
                  fontSize: 12,
                  color: colors.textMuted,
                  fontStyle: 'italic',
                  marginBottom: 10,
                }}
              >
                "{note.transcript}"
              </Text>

              {/* Action Items List */}
              {note.action_items && note.action_items.length > 0 && (
                <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderMuted }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: colors.textSecondary,
                      fontFamily: fonts.mono,
                      marginBottom: 6,
                    }}
                  >
                    EXTRACTED ACTION ITEMS ({note.action_items.length}):
                  </Text>

                  {note.action_items.map((item, idx) => {
                    const itemKey = `${note.id}_item_${idx}`;
                    const isDone = !!completedTasks[itemKey];

                    return (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.7}
                        onPress={() => toggleTask(itemKey)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 6,
                        }}
                      >
                        {isDone ? (
                          <CheckCircle2 size={16} color={colors.success} style={{ marginRight: 8 }} />
                        ) : (
                          <Circle size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
                        )}
                        <Text
                          style={{
                            fontSize: 12,
                            color: isDone ? colors.textMuted : colors.text,
                            textDecorationLine: isDone ? 'line-through' : 'none',
                            flex: 1,
                          }}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Footer Metadata */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 8,
                  paddingTop: 6,
                }}
              >
                <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>
                  {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Today'}
                </Text>
                <Badge
                  label={note.is_synced ? 'SYNCED TO CRM' : 'CACHED OFFLINE'}
                  variant={note.is_synced ? 'muted' : 'warning'}
                  size="sm"
                />
              </View>
            </Card>
          </AnimatedEntrance>
        );
      }}
      />
    </View>
  );
}
