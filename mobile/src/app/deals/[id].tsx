/**
 * Deal Details & Dynamic Custom Fields Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Briefcase,
  Building,
  User as UserIcon,
  Calendar,
  Zap,
  Mic,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useDealsStore } from '@/stores/dealsStore';
import { useVoiceNotesStore } from '@/stores/voiceNotesStore';
import { DealStage, Deal } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { HealthIndicator } from '@/components/ui/HealthIndicator';
import { DynamicFieldRenderer } from '@/components/dynamic-fields/DynamicFieldRenderer';

const PIPELINE_STAGES: { key: DealStage; label: string }[] = [
  { key: 'discovery', label: '1. Discovery' },
  { key: 'qualification', label: '2. Qualified' },
  { key: 'proposal', label: '3. Proposal' },
  { key: 'negotiation', label: '4. Negotiation' },
  { key: 'closed_won', label: '5. Won' },
];

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, fonts } = useTheme();

  const { deals, customFields, fetchDeals, fetchCustomFields, updateDealStage, updateDealCustomFields } =
    useDealsStore();
  const { notes, fetchNotes } = useVoiceNotesStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'custom_fields' | 'voice_notes'>('overview');

  useEffect(() => {
    fetchDeals();
    fetchCustomFields('deal');
    fetchNotes();
  }, [id]);

  const deal = deals.find((d) => d.id === id);
  const dealNotes = notes.filter((n) => n.entity_id === id);

  if (!deal) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
          Deal Not Found
        </Text>
        <Button title="GO BACK" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const handleStageChange = async (newStage: DealStage) => {
    await updateDealStage(deal.id, newStage);
  };

  const handleSaveCustomFields = async (values: Record<string, any>) => {
    await updateDealCustomFields(deal.id, values);
  };

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
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color: colors.primary,
              fontFamily: fonts.mono,
              textTransform: 'uppercase',
            }}
          >
            DEAL COMMAND • {deal.id}
          </Text>
          <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
            {deal.name}
          </Text>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.primary, fontFamily: fonts.mono }}>
          ${deal.value.toLocaleString()}
        </Text>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.cardSubtle,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {(['overview', 'custom_fields', 'voice_notes'] as const).map((tab) => {
          const isSelected = activeTab === tab;
          const label =
            tab === 'overview'
              ? 'OVERVIEW & HEALTH'
              : tab === 'custom_fields'
              ? `CUSTOM FIELDS (${customFields.length})`
              : `VOICE NOTES (${dealNotes.length})`;

          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.7}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                borderBottomWidth: 2,
                borderBottomColor: isSelected ? colors.primary : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: isSelected ? colors.primary : colors.textMuted,
                  fontFamily: fonts.mono,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, flexGrow: 1 }}
        showsVerticalScrollIndicator={true}
      >
        {activeTab === 'overview' && (
          <>
            {/* Interactive Pipeline Stage Funnel */}
            <Card style={{ marginBottom: 14 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: colors.textSecondary,
                  fontFamily: fonts.mono,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                }}
              >
                ADVANCE PIPELINE STAGE:
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {PIPELINE_STAGES.map((s) => {
                  const isCurrent = deal.stage === s.key;
                  return (
                    <TouchableOpacity
                      key={s.key}
                      activeOpacity={0.7}
                      onPress={() => handleStageChange(s.key)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        backgroundColor: isCurrent ? colors.primary : colors.surface,
                        borderColor: isCurrent ? colors.primary : colors.border,
                        borderWidth: 1,
                        borderRadius: 2,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          fontFamily: fonts.mono,
                          color: isCurrent ? colors.primaryText : colors.text,
                        }}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            {/* AI Health Score Radar */}
            <View style={{ marginBottom: 14 }}>
              <HealthIndicator
                score={deal.health_score}
                isStalled={deal.is_stalled}
                riskFactors={deal.risk_factors}
                compact={false}
              />
            </View>

            {/* Deal Metadata Details */}
            <Card style={{ marginBottom: 14 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: colors.textSecondary,
                  fontFamily: fonts.mono,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                }}
              >
                DEAL METADATA & TELEMETRY
              </Text>

              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Target Company:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                    {deal.company_name || 'Acme Global'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Key Contact:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                    {deal.contact_name || 'Sarah Connor'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Close Probability:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success, fontFamily: fonts.mono }}>
                    {deal.close_probability || 80}%
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Forecast Close Date:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, fontFamily: fonts.mono }}>
                    {deal.forecast_close_date || '2026-09-30'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>Days in Current Stage:</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: deal.is_stalled ? colors.danger : colors.text, fontFamily: fonts.mono }}>
                    {deal.days_in_stage || 4} days
                  </Text>
                </View>
              </View>
            </Card>

            {/* Next AI Actions */}
            {deal.next_actions && deal.next_actions.length > 0 && (
              <Card variant="highlight" style={{ backgroundColor: colors.surface }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Zap size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: colors.primary,
                      fontFamily: fonts.mono,
                      textTransform: 'uppercase',
                    }}
                  >
                    RECOMMENDED AI NEXT ACTIONS
                  </Text>
                </View>

                {deal.next_actions.map((act, i) => (
                  <Text key={i} style={{ fontSize: 13, color: colors.text, marginBottom: 4, lineHeight: 18 }}>
                    • {act}
                  </Text>
                ))}
              </Card>
            )}
          </>
        )}

        {/* Tab 2: Dynamic Custom Fields */}
        {activeTab === 'custom_fields' && (
          <Card>
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: colors.primary,
                  fontFamily: fonts.mono,
                  textTransform: 'uppercase',
                }}
              >
                DYNAMIC CUSTOM FIELDS
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>
                Configured via Dynamic Custom Field Builder. Edit values and sync directly to CRM.
              </Text>
            </View>

            <DynamicFieldRenderer
              definitions={customFields}
              initialValues={deal.custom_fields || {}}
              onSave={handleSaveCustomFields}
            />
          </Card>
        )}

        {/* Tab 3: Attached Voice Notes */}
        {activeTab === 'voice_notes' && (
          <View>
            <Button
              title="RECORD VOICE NOTE FOR THIS DEAL"
              variant="primary"
              size="md"
              icon={<Mic size={14} color={colors.primaryText} />}
              onPress={() => router.push('/voice/record' as any)}
              style={{ marginBottom: 14 }}
            />

            {dealNotes.length === 0 ? (
              <Card style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                  No voice notes linked to this deal yet.
                </Text>
              </Card>
            ) : (
              dealNotes.map((n) => (
                <Card key={n.id} style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                    {n.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>
                    {n.summary}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.primary, fontFamily: fonts.mono }}>
                    {n.action_items.length} ACTION ITEMS EXTRACTED
                  </Text>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
