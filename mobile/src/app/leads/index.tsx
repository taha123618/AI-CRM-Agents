/**
 * Leads & Prospects Intelligence Radar Screen
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
  Linking,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Search,
  Plus,
  ArrowLeft,
  Users,
  Sparkles,
  Phone,
  MessageSquare,
  Bot,
  X,
  Zap,
  CheckCircle2,
  Briefcase,
  ArrowUpRight,
  Send,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useLeadsStore } from '@/stores/leadsStore';
import { useDealsStore } from '@/stores/dealsStore';
import { Lead } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const STATUS_FILTERS = [
  { key: 'all', label: 'ALL LEADS' },
  { key: 'new', label: 'NEW' },
  { key: 'contacted', label: 'CONTACTED' },
  { key: 'qualified', label: 'QUALIFIED' },
  { key: 'converted', label: 'CONVERTED' },
];

const WHATSAPP_TEMPLATES = [
  {
    id: 'intro',
    title: 'Autonomous AI Intro Briefing',
    text: 'Hi {name}, this is the AI CRM executive team. We saw your interest in enterprise AI agents and would love to share a custom platform briefing.',
  },
  {
    id: 'demo',
    title: 'Product Demo & ROI Battle-Card',
    text: 'Hi {name}, following up regarding {company}. We have prepared an ROI analysis demonstrating a 40% reduction in sales velocity latency.',
  },
  {
    id: 'meeting',
    title: 'Executive Discovery Invitation',
    text: 'Hi {name}, are you available for a 15-minute discovery call this Thursday to discuss tailored AI multi-agent orchestration for {company}?',
  },
];

export default function LeadsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();

  const {
    leads,
    isLoading,
    isQualifyingId,
    fetchLeads,
    createLead,
    qualifyLead,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
  } = useLeadsStore();

  const { createDeal } = useDealsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // WhatsApp Action Sheet State
  const [selectedWhatsAppLead, setSelectedWhatsAppLead] = useState<Lead | null>(null);

  // Convert to Deal Modal State
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [dealValue, setDealValue] = useState('125000');

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter((l) => {
    const matchesStatus = filterStatus === 'all' || l.lead_status === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const fullName = `${l.first_name} ${l.last_name}`.toLowerCase();
    const matchesSearch =
      !query ||
      fullName.includes(query) ||
      l.email.toLowerCase().includes(query) ||
      l.company_name?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const handleCreateLead = async () => {
    if (!firstName.trim() || !email.trim()) {
      Alert.alert('Validation Error', 'Please provide at least first name and email.');
      return;
    }

    setIsSubmitting(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await createLead({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        company_name: companyName.trim() || 'Enterprise Account',
        job_title: jobTitle.trim() || 'Executive Decision Maker',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setCompanyName('');
      setJobTitle('');
      Alert.alert('Lead Created', 'New prospect enrolled into AI SDR Cadence.');
    } catch (e) {
      Alert.alert('Error', 'Could not create lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQualify = async (leadId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await qualifyLead(leadId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Qualification Error', 'Could not complete AI qualification.');
    }
  };

  const handleCall = (phone?: string | null) => {
    const num = phone || '+15550199';
    Linking.openURL(`tel:${num}`).catch(() => {
      Alert.alert('Call', `Simulating voice dial to ${num}`);
    });
  };

  const handleSendWhatsAppTemplate = (templateText: string) => {
    if (!selectedWhatsAppLead) return;
    const phoneNum = (selectedWhatsAppLead.phone || '15550199').replace(/[^0-9]/g, '');
    const personalized = templateText
      .replace('{name}', selectedWhatsAppLead.first_name)
      .replace('{company}', selectedWhatsAppLead.company_name || 'your company');

    const url = `whatsapp://send?phone=${phoneNum}&text=${encodeURIComponent(personalized)}`;
    setSelectedWhatsAppLead(null);
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp Auto-Pilot', `Template dispatched:\n\n"${personalized}"`);
    });
  };

  const handleConvertLeadToDeal = async () => {
    if (!convertingLead) return;
    const val = parseFloat(dealValue) || 100000;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const created = await createDeal({
        name: `${convertingLead.company_name || 'Account'} — Enterprise Swarm`,
        value: val,
        stage: 'qualification',
        contact_name: `${convertingLead.first_name} ${convertingLead.last_name}`,
        company_name: convertingLead.company_name || 'Enterprise Account',
      });
      setConvertingLead(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Lead Converted', 'Deal successfully added to Pipeline radar.', [
        { text: 'View Deals', onPress: () => router.push('/(tabs)/deals' as any) },
        { text: 'OK' },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not convert lead to deal.');
    }
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
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
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
              PROSPECT INTELLIGENCE
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>
              Leads & BANT Radar
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsModalOpen(true)}
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
              NEW LEAD
            </Text>
          </TouchableOpacity>
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
            placeholder="Search leads, companies, emails..."
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
          {STATUS_FILTERS.map((s) => {
            const active = filterStatus === s.key;
            return (
              <TouchableOpacity
                key={s.key}
                onPress={() => setFilterStatus(s.key)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 2,
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                  borderWidth: 1,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '700', fontFamily: fonts.mono, color: active ? colors.primaryText : colors.textSecondary }}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Leads List */}
      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchLeads} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <Users size={36} color={colors.textMuted} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary }}>
              No leads found.
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4, fontFamily: fonts.mono }}>
              Pull down to refresh or add a new lead.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isHighIntent = item.lead_score >= 80;
          const tierLabel = isHighIntent ? 'TIER 1 • HIGH INTENT' : item.lead_score >= 50 ? 'TIER 2 • NURTURE' : 'TIER 3';
          const isQualifying = isQualifyingId === item.id;

          return (
            <Card style={{ marginBottom: 12, padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>
                    {item.first_name} {item.last_name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {item.job_title || 'Decision Maker'} • {item.company_name || 'Enterprise'}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.mono, marginTop: 2 }}>
                    {item.email}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Badge label={tierLabel} variant={isHighIntent ? 'primary' : 'muted'} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>BANT: </Text>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: isHighIntent ? colors.success : colors.primary, fontFamily: fonts.mono }}>
                      {item.lead_score}/100
                    </Text>
                  </View>
                </View>
              </View>

              {/* Buying Signals & AI Recommendation */}
              {item.recommended_action && (
                <View style={{ backgroundColor: colors.surface, padding: 8, borderWidth: 1, borderColor: colors.borderMuted, borderRadius: 2, marginVertical: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Sparkles size={11} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary, fontFamily: fonts.mono }}>
                      AI SDR ACTION:
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.text }}>{item.recommended_action}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.borderMuted }}>
                <Button
                  title="QUALIFY"
                  size="sm"
                  variant="outline"
                  icon={<Bot size={12} color={colors.primary} />}
                  isLoading={isQualifying}
                  onPress={() => handleQualify(item.id)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="WHATSAPP"
                  size="sm"
                  variant="primary"
                  icon={<MessageSquare size={12} color={colors.primaryText} />}
                  onPress={() => setSelectedWhatsAppLead(item)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="TO DEAL"
                  size="sm"
                  variant="secondary"
                  icon={<Briefcase size={12} color={colors.text} />}
                  onPress={() => setConvertingLead(item)}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          );
        }}
      />

      {/* WHATSAPP TEMPLATE PICKER MODAL */}
      <Modal visible={!!selectedWhatsAppLead} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.borderHighlight, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary, fontFamily: fonts.mono }}>
                  WHATSAPP AUTO-PILOT
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                  Send AI SDR Cadence to {selectedWhatsAppLead?.first_name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedWhatsAppLead(null)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10 }}>
              {WHATSAPP_TEMPLATES.map((tmpl) => (
                <TouchableOpacity
                  key={tmpl.id}
                  activeOpacity={0.8}
                  onPress={() => handleSendWhatsAppTemplate(tmpl.text)}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 2,
                    padding: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>
                      {tmpl.title}
                    </Text>
                    <Send size={12} color={colors.primary} />
                  </View>
                  <Text style={{ fontSize: 11, color: colors.textMuted }} numberOfLines={2}>
                    {tmpl.text.replace('{name}', selectedWhatsAppLead?.first_name || 'Prospect').replace('{company}', selectedWhatsAppLead?.company_name || 'Account')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* CONVERT LEAD TO DEAL MODAL */}
      <Modal visible={!!convertingLead} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.borderHighlight, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary, fontFamily: fonts.mono }}>
                  PIPELINE CONVERSION
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                  Convert {convertingLead?.first_name} to Deal
                </Text>
              </View>
              <TouchableOpacity onPress={() => setConvertingLead(null)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <Input
                label="ESTIMATED ARR VALUE (USD)"
                placeholder="125000"
                keyboardType="numeric"
                value={dealValue}
                onChangeText={setDealValue}
              />
              <Button
                title="CONFIRM CONVERSION TO PIPELINE"
                variant="primary"
                size="lg"
                icon={<Briefcase size={16} color={colors.primaryText} />}
                onPress={handleConvertLeadToDeal}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* CREATE LEAD MODAL */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.borderHighlight, padding: 20, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary, fontFamily: fonts.mono }}>
                  AUTONOMOUS SDR
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>Add New Prospect</Text>
              </View>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 12 }}>
              <Input label="FIRST NAME *" placeholder="e.g. Sarah" value={firstName} onChangeText={setFirstName} />
              <Input label="LAST NAME" placeholder="e.g. Connor" value={lastName} onChangeText={setLastName} />
              <Input label="WORK EMAIL *" placeholder="e.g. sarah.connor@acme.com" keyboardType="email-address" value={email} onChangeText={setEmail} />
              <Input label="COMPANY / ORGANIZATION" placeholder="e.g. Acme Global" value={companyName} onChangeText={setCompanyName} />
              <Input label="JOB TITLE" placeholder="e.g. Chief Technology Officer" value={jobTitle} onChangeText={setJobTitle} />

              <View style={{ marginTop: 12 }}>
                <Button title="ENROLL INTO CADENCE" variant="primary" size="lg" isLoading={isSubmitting} onPress={handleCreateLead} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
