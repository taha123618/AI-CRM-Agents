/**
 * Deals & Pipeline Intelligence Screen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, Briefcase, Plus, ArrowUpRight, X, DollarSign, Building, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useDealsStore } from '@/stores/dealsStore';
import { DealStage, Deal, DealCreateInput } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HealthIndicator } from '@/components/ui/HealthIndicator';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const STAGES: { key: DealStage | 'all'; label: string }[] = [
  { key: 'all', label: 'ALL DEALS' },
  { key: 'discovery', label: 'DISCOVERY' },
  { key: 'qualification', label: 'QUALIFIED' },
  { key: 'proposal', label: 'PROPOSAL' },
  { key: 'negotiation', label: 'NEGOTIATION' },
  { key: 'closed_won', label: 'CLOSED WON' },
];

export default function DealsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const { deals, isLoading, fetchDeals, createDeal, filterStage, setFilterStage, searchQuery, setSearchQuery } =
    useDealsStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Deal Form State
  const [dealName, setDealName] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [dealStage, setDealStage] = useState<DealStage>('discovery');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');

  useEffect(() => {
    fetchDeals();
  }, []);

  const filteredDeals = deals.filter((deal) => {
    const matchesStage = filterStage === 'all' || deal.stage === filterStage;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      deal.name.toLowerCase().includes(query) ||
      deal.company_name?.toLowerCase().includes(query) ||
      deal.contact_name?.toLowerCase().includes(query);
    return matchesStage && matchesSearch;
  });

  const totalValue = filteredDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  const handleCreateDeal = async () => {
    if (!dealName.trim()) {
      Alert.alert('Validation Error', 'Please enter a deal title.');
      return;
    }
    const val = parseFloat(dealValue) || 0;
    if (val <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid deal value.');
      return;
    }

    setIsSubmitting(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await createDeal({
        name: dealName.trim(),
        value: val,
        stage: dealStage,
        company_name: companyName.trim() || 'Target Account',
        contact_name: contactName.trim() || 'Prospect Contact',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsCreateModalOpen(false);
      setDealName('');
      setDealValue('');
      setCompanyName('');
      setContactName('');
      Alert.alert('Deal Created', 'New deal added to pipeline with AI health monitoring enabled.');
    } catch (e) {
      Alert.alert('Creation Failed', 'Could not create deal. Saved to offline queue.');
    } finally {
      setIsSubmitting(false);
    }
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
              PIPELINE INTELLIGENCE
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: colors.text,
              }}
            >
              Deals & Health Radar
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsCreateModalOpen(true)}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 2,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Plus size={14} color={colors.primaryText} />
              <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primaryText, fontFamily: fonts.mono }}>
                NEW DEAL
              </Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>
                VALUE
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.primary, fontFamily: fonts.mono }}>
                ${(totalValue / 1000).toFixed(0)}k
              </Text>
            </View>
          </View>
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
            placeholder="Search deals, companies, contacts..."
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

      {/* Stage Filter Tabs */}
      <View
        style={{
          backgroundColor: colors.cardSubtle,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}>
          {STAGES.map((s) => {
            const active = filterStage === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                activeOpacity={0.7}
                onPress={() => setFilterStage(s.key)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
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
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Deals List */}
      <FlatList
        data={filteredDeals}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchDeals} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <Briefcase size={36} color={colors.textMuted} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary }}>
              No deals match the filter criteria.
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4, fontFamily: fonts.mono }}>
              Pull down to refresh or add a new deal.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/deals/${item.id}` as any)}
            style={{ marginBottom: 12 }}
          >
            <Card variant={item.is_stalled ? 'danger' : 'default'} style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 2 }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {item.company_name || 'Target Account'} {item.contact_name ? `• ${item.contact_name}` : ''}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.primary, fontFamily: fonts.mono }}>
                    ${item.value ? item.value.toLocaleString() : '0'}
                  </Text>
                  <Badge label={item.stage.replace('_', ' ').toUpperCase()} variant="primary" />
                </View>
              </View>

              {/* Health Score & Stalled Telemetry */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderMuted }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <HealthIndicator score={item.health_score || 50} isStalled={item.is_stalled} />
                </View>
                <ArrowUpRight size={14} color={colors.primary} />
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />

      {/* CREATE DEAL MODAL */}
      <Modal visible={isCreateModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: colors.card,
              borderTopWidth: 1,
              borderTopColor: colors.borderHighlight,
              padding: 20,
              maxHeight: '85%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, fontFamily: fonts.mono }}>
                  PIPELINE ACCELERATOR
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>Create New Deal</Text>
              </View>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 12 }}>
              <Input
                label="DEAL TITLE *"
                placeholder="e.g. Acme Corp — Enterprise AI Cloud"
                value={dealName}
                onChangeText={setDealName}
              />

              <Input
                label="TARGET VALUE (USD) *"
                placeholder="e.g. 150000"
                keyboardType="numeric"
                value={dealValue}
                onChangeText={setDealValue}
              />

              <Input
                label="COMPANY / TARGET ACCOUNT"
                placeholder="e.g. Acme Corporation"
                value={companyName}
                onChangeText={setCompanyName}
              />

              <Input
                label="KEY CONTACT NAME"
                placeholder="e.g. Sarah Connor (CTO)"
                value={contactName}
                onChangeText={setContactName}
              />

              {/* Stage Selector */}
              <View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 6 }}>
                  INITIAL PIPELINE STAGE:
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {(['discovery', 'qualification', 'proposal', 'negotiation'] as DealStage[]).map((stg) => {
                    const active = dealStage === stg;
                    return (
                      <TouchableOpacity
                        key={stg}
                        onPress={() => setDealStage(stg)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 2,
                          backgroundColor: active ? colors.primary : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                          borderWidth: 1,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '700', fontFamily: fonts.mono, color: active ? colors.primaryText : colors.textSecondary }}>
                          {stg.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Button
                  title="SAVE & DISPATCH TO PIPELINE"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  onPress={handleCreateDeal}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
