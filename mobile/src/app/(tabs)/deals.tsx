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
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, Briefcase, Plus, ArrowUpRight } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useDealsStore } from '@/stores/dealsStore';
import { DealStage, Deal } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HealthIndicator } from '@/components/ui/HealthIndicator';
import { Button } from '@/components/ui/Button';

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

  const { deals, isLoading, fetchDeals, filterStage, setFilterStage, searchQuery, setSearchQuery } =
    useDealsStore();

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

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>
              FILTERED VALUE
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.primary, fontFamily: fonts.mono }}>
              ${(totalValue / 1000).toFixed(0)}k
            </Text>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}
        >
          {STAGES.map((s) => {
            const isSelected = filterStage === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                activeOpacity={0.7}
                onPress={() => setFilterStage(s.key)}
                style={{
                  paddingHorizontal: 12,
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
                    color: isSelected ? colors.primaryText : colors.textSecondary,
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
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchDeals} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Card style={{ padding: 24, alignItems: 'center', marginTop: 20 }}>
            <Briefcase size={32} color={colors.textMuted} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 4 }}>
              No Deals Found
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center' }}>
              No deals match your selected stage or search query.
            </Text>
          </Card>
        }
        renderItem={({ item: deal }) => (
          <Card
            key={deal.id}
            onPress={() => router.push(`/deals/${deal.id}` as any)}
            variant={deal.is_stalled ? 'danger' : 'default'}
            style={{ marginBottom: 12 }}
          >
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
                  {deal.name}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.mono }}>
                  {deal.company_name || 'Prospect Company'} • {deal.contact_name || 'Key Buyer'}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: colors.primary,
                  fontFamily: fonts.mono,
                }}
              >
                ${deal.value.toLocaleString()}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Badge label={deal.stage.replace('_', ' ')} variant="primary" size="sm" />
              {deal.close_probability && (
                <Badge
                  label={`${deal.close_probability}% PROBABILITY`}
                  variant={deal.close_probability >= 70 ? 'success' : 'muted'}
                  size="sm"
                />
              )}
            </View>

            <HealthIndicator
              score={deal.health_score}
              isStalled={deal.is_stalled}
              riskFactors={deal.risk_factors}
              compact={false}
            />

            <View
              style={{
                marginTop: 10,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: colors.borderMuted,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.mono }}>
                Last activity: {deal.last_activity_date || 'Recently'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '700', fontFamily: fonts.mono, marginRight: 2 }}>
                  VIEW DETAILS
                </Text>
                <ArrowUpRight size={12} color={colors.primary} />
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}
