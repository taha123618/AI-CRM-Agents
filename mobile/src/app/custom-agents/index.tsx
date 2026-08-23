/**
 * Tactical Command Mobile No-Code Custom Agent Builder
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Wrench, ArrowLeft, Plus, Play, CheckCircle2, Bot, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

export default function CustomAgentsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [agents, setAgents] = useState([
    { id: 'ca-1', name: 'Contract Risk Scanner', trigger: 'deal.proposal_created', tools: ['pdf_parser', 'llm_risk_eval'], status: 'active' },
    { id: 'ca-2', name: 'Competitor Mention Sentinel', trigger: 'voice.transcript_ready', tools: ['vector_search', 'battlecard_lookup'], status: 'active' },
  ]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('lead.created');
  const [prompt, setPrompt] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    setAgents((prev) => [
      { id: `ca-${Date.now()}`, name: name.trim(), trigger, tools: ['llm_think', 'db_query'], status: 'active' },
      ...prev,
    ]);
    setName('');
    setPrompt('');
    setCreating(false);
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
            NO-CODE STUDIO
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            CUSTOM AGENTS
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
        <Button
          title={creating ? "CANCEL PROVISIONING" : "+ BUILD NEW CUSTOM AGENT"}
          variant="primary"
          size="md"
          onPress={() => setCreating(!creating)}
        />

        {creating && (
          <Card variant="highlight" style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Bot size={16} color={colors.primary} />
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary }}>
                PROVISION NEW CUSTOM AGENT
              </Text>
            </View>

            <View style={{ gap: 8, marginBottom: 12 }}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Agent Name (e.g. Executive Briefing Agent)"
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
                value={trigger}
                onChangeText={setTrigger}
                placeholder="Trigger Event (e.g. deal.stalled, voice.recorded)"
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
                value={prompt}
                onChangeText={setPrompt}
                placeholder="Agent Instructions / System Prompt..."
                placeholderTextColor={colors.textMuted}
                multiline
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  padding: 8,
                  color: colors.text,
                  fontFamily: fonts.mono,
                  fontSize: 11,
                  minHeight: 70,
                }}
              />
            </View>

            <Button
              title="SAVE & DEPLOY AGENT TO SWARM"
              variant="primary"
              size="sm"
              onPress={handleCreate}
            />
          </Card>
        )}

        <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted }}>
          CONFIGURED CUSTOM AGENTS:
        </Text>

        <View style={{ gap: 10 }}>
          {agents.map((agent) => (
            <Card key={agent.id} style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                  {agent.name}
                </Text>
                <Badge label="ACTIVE" variant="success" />
              </View>

              <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.primary, marginBottom: 6 }}>
                TRIGGER: {agent.trigger}
              </Text>

              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {agent.tools.map((tool, idx) => (
                  <Badge key={idx} label={tool} variant="primary" />
                ))}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
