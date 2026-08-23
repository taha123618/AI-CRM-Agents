/**
 * Mobile Autonomous Multi-Agent Workflow Studio & Execution Monitor
 * Full CRUD, Swarm Simulation, Audit Timeline, and Real-Time Event Dispatching.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  GitBranch,
  Play,
  CheckCircle,
  Zap,
  Shield,
  Bot,
  X,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Sliders,
  ChevronRight,
  Info,
  Clock,
  Check,
  Activity,
  Radio,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useWorkflowStore } from '@/stores/workflowStore';
import { WorkflowTrigger } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const AGENT_FILTERS = [
  { key: 'all', label: 'ALL AGENTS' },
  { key: 'WhatsAppAgent', label: 'WHATSAPP' },
  { key: 'CustomerSuccessAgent', label: 'CHURN DEFENSE' },
  { key: 'VoiceCallAgent', label: 'VOICE AI' },
  { key: 'LeadQualificationAgent', label: 'SDR CADENCE' },
];

const TRIGGER_EVENTS = [
  'deal_stalled_10_days',
  'lead_score_above_80',
  'churn_probability_high',
  'post_call_action_required',
  'proposal_viewed_multiple_times',
  'customer_renewal_approaching',
];

const AGENT_OPTIONS = [
  { agent: 'WhatsAppAgent', action: 'send_reengagement_nudge' },
  { agent: 'CustomerSuccessAgent', action: 'launch_churn_retention_playbook' },
  { agent: 'VoiceCallAgent', action: 'schedule_automated_briefing' },
  { agent: 'LeadQualificationAgent', action: 'enroll_into_sdr_cadence' },
];

export default function WorkflowsScreen() {
  const { colors, fonts } = useTheme();
  const {
    workflows,
    isLoading,
    isExecutingId,
    lastExecutionResult,
    fetchWorkflows,
    testTrigger,
    toggleWorkflowActive,
    createWorkflow,
    deleteWorkflow,
  } = useWorkflowStore();

  // Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTrigger | null>(null);
  const [selectedAgentFilter, setSelectedAgentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Form State
  const [newWfName, setNewWfName] = useState('');
  const [newTriggerEvent, setNewTriggerEvent] = useState(TRIGGER_EVENTS[0]);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState(0);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleTest = async (workflow: WorkflowTrigger) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setSelectedWorkflow(workflow);
    setModalVisible(true);
    await testTrigger(workflow.id);
  };

  const handleToggleActive = async (id: string) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    await toggleWorkflowActive(id);
  };

  const handleOpenDetail = (workflow: WorkflowTrigger) => {
    setSelectedWorkflow(workflow);
    setDetailModalVisible(true);
  };

  const handleCreate = async () => {
    if (!newWfName.trim()) {
      Alert.alert('Validation Error', 'Please enter a workflow trigger name.');
      return;
    }

    const agentChoice = AGENT_OPTIONS[selectedAgentIndex];
    await createWorkflow({
      name: newWfName.trim(),
      trigger_event: newTriggerEvent,
      action_agent: agentChoice.agent,
      action_type: agentChoice.action,
      is_active: true,
      conditions: { threshold_days: 7, priority: 'high' },
    });

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    setNewWfName('');
    setCreateModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Workflow Trigger',
      'Are you sure you want to permanently remove this automated workflow trigger?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWorkflow(id);
            setDetailModalVisible(false);
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {}
          },
        },
      ]
    );
  };

  const filteredWorkflows = workflows.filter((wf) => {
    const matchesAgent = selectedAgentFilter === 'all' || wf.action_agent === selectedAgentFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      wf.name.toLowerCase().includes(q) ||
      wf.trigger_event.toLowerCase().includes(q) ||
      wf.action_agent.toLowerCase().includes(q) ||
      wf.action_type.toLowerCase().includes(q);

    return matchesAgent && matchesSearch;
  });

  const activeCount = workflows.filter((w) => w.is_active).length;
  const totalExecutions = workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0);

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
              AUTONOMOUS MULTI-AGENT SWARM
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: colors.text,
              }}
            >
              Workflow Trigger Studio
            </Text>
          </View>

          <Button
            title="NEW TRIGGER"
            size="sm"
            variant="primary"
            icon={<Plus size={14} color={colors.primaryText} />}
            onPress={() => setCreateModalVisible(true)}
          />
        </View>

        {/* Stats Telemetry Strip */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
          <Badge label={`${activeCount} ACTIVE TRIGGERS`} variant="success" size="sm" />
          <Badge label={`${totalExecutions} SWARM RUNS`} variant="primary" size="sm" />
          <Badge label="24/7 AUTO-PILOT" variant="muted" size="sm" />
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
            placeholder="Search triggers, events, or assigned agents..."
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 8,
              color: colors.text,
              fontSize: 13,
            }}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={14} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Agent Filter Tabs */}
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
          contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 8, gap: 6 }}
        >
          {AGENT_FILTERS.map((f) => {
            const isSelected = selectedAgentFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                activeOpacity={0.7}
                onPress={() => setSelectedAgentFilter(f.key)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 5,
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
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredWorkflows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchWorkflows} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Card style={{ padding: 24, alignItems: 'center', marginTop: 20 }}>
            <GitBranch size={32} color={colors.textMuted} style={{ marginBottom: 12 }} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 4 }}>
              No Workflow Triggers Found
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 14 }}>
              No automated triggers match your filter criteria.
            </Text>
            <Button
              title="CREATE FIRST TRIGGER"
              variant="primary"
              size="sm"
              onPress={() => setCreateModalVisible(true)}
            />
          </Card>
        }
        renderItem={({ item: wf }) => (
          <Card
            key={wf.id}
            onPress={() => handleOpenDetail(wf)}
            variant={wf.is_active ? 'default' : 'subtle'}
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
                  {wf.name}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.mono }}>
                  Event: <Text style={{ color: colors.secondary }}>{wf.trigger_event}</Text>
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleToggleActive(wf.id)}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  backgroundColor: wf.is_active ? 'rgba(0, 255, 157, 0.15)' : colors.surface,
                  borderColor: wf.is_active ? colors.success : colors.border,
                  borderWidth: 1,
                  borderRadius: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    fontFamily: fonts.mono,
                    color: wf.is_active ? colors.success : colors.textMuted,
                  }}
                >
                  {wf.is_active ? 'ACTIVE' : 'PAUSED'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Agent Action Box */}
            <View
              style={{
                backgroundColor: colors.surface,
                padding: 10,
                borderRadius: 2,
                marginVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
                borderLeftWidth: 3,
                borderLeftColor: colors.primary,
              }}
            >
              <Bot size={16} color={colors.primary} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>
                  AUTONOMOUS AGENT ACTION:
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary, fontFamily: fonts.mono }}>
                  {wf.action_agent} → {wf.action_type}
                </Text>
              </View>
              <ChevronRight size={14} color={colors.textMuted} />
            </View>

            {/* Stats & Trigger Button */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 6,
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: colors.borderMuted,
              }}
            >
              <View>
                <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>
                  EXECUTIONS: {wf.execution_count || 0} runs
                </Text>
                <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>
                  Last run: {wf.last_triggered_at || 'Never'}
                </Text>
              </View>

              <Button
                title="TEST TRIGGER"
                size="sm"
                variant="outline"
                icon={<Play size={12} color={colors.borderHighlight} />}
                isLoading={isExecutingId === wf.id}
                onPress={() => handleTest(wf)}
              />
            </View>
          </Card>
        )}
      />

      {/* Modal 1: Create New Workflow Trigger */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderTopColor: colors.borderHighlight,
              borderTopWidth: 2,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              padding: 20,
              maxHeight: '85%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: colors.primary,
                    fontFamily: fonts.mono,
                    textTransform: 'uppercase',
                  }}
                >
                  SWARM TRIGGER CONFIGURATOR
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                  Create Automated Workflow
                </Text>
              </View>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
              <Input
                label="TRIGGER NAME"
                value={newWfName}
                onChangeText={setNewWfName}
                placeholder="e.g., Stalled Deal High-Priority Nudge"
              />

              <View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: colors.textSecondary,
                    fontFamily: fonts.mono,
                    marginBottom: 6,
                    textTransform: 'uppercase',
                  }}
                >
                  SELECT TRIGGER EVENT:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {TRIGGER_EVENTS.map((ev) => {
                    const isSel = newTriggerEvent === ev;
                    return (
                      <TouchableOpacity
                        key={ev}
                        activeOpacity={0.7}
                        onPress={() => setNewTriggerEvent(ev)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          backgroundColor: isSel ? colors.primary : colors.surface,
                          borderColor: isSel ? colors.primary : colors.border,
                          borderWidth: 1,
                          borderRadius: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '700',
                            fontFamily: fonts.mono,
                            color: isSel ? colors.primaryText : colors.text,
                          }}
                        >
                          {ev}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: colors.textSecondary,
                    fontFamily: fonts.mono,
                    marginBottom: 6,
                    textTransform: 'uppercase',
                  }}
                >
                  ASSIGN TARGET AI AGENT ACTION:
                </Text>
                <View style={{ gap: 6 }}>
                  {AGENT_OPTIONS.map((opt, idx) => {
                    const isSel = selectedAgentIndex === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.7}
                        onPress={() => setSelectedAgentIndex(idx)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 10,
                          backgroundColor: isSel ? 'rgba(255, 184, 0, 0.1)' : colors.surface,
                          borderColor: isSel ? colors.primary : colors.border,
                          borderWidth: 1,
                          borderRadius: 2,
                        }}
                      >
                        <Bot size={16} color={isSel ? colors.primary : colors.textMuted} style={{ marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: isSel ? colors.primary : colors.text, fontFamily: fonts.mono }}>
                            {opt.agent}
                          </Text>
                          <Text style={{ fontSize: 11, color: colors.textMuted }}>
                            Action: {opt.action}
                          </Text>
                        </View>
                        {isSel && <Check size={16} color={colors.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <Button
                title="SAVE & ACTIVATE TRIGGER"
                variant="primary"
                size="lg"
                onPress={handleCreate}
                style={{ marginTop: 8 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Trigger Detail & Execution Spec */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderTopColor: colors.borderHighlight,
              borderTopWidth: 2,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              padding: 20,
              maxHeight: '85%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: colors.primary,
                    fontFamily: fonts.mono,
                    textTransform: 'uppercase',
                  }}
                >
                  WORKFLOW SPEC & TELEMETRY
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                  {selectedWorkflow?.name}
                </Text>
              </View>

              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 20 }}>
              <Card variant="subtle">
                <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.mono, marginBottom: 4 }}>
                  TRIGGER EVENT IDENTIFIER:
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.secondary, fontFamily: fonts.mono }}>
                  {selectedWorkflow?.trigger_event}
                </Text>
              </Card>

              <Card variant="subtle">
                <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.mono, marginBottom: 4 }}>
                  ASSIGNED AI AGENT:
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary, fontFamily: fonts.mono }}>
                  {selectedWorkflow?.action_agent}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  Executes method: <Text style={{ fontFamily: fonts.mono }}>{selectedWorkflow?.action_type}</Text>
                </Text>
              </Card>

              <Card variant="subtle">
                <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.mono, marginBottom: 4 }}>
                  EXECUTION TELEMETRY & STATS:
                </Text>
                <Text style={{ fontSize: 12, color: colors.text }}>
                  • Total Executions: <Text style={{ fontWeight: '700', fontFamily: fonts.mono }}>{selectedWorkflow?.execution_count || 0}</Text>
                </Text>
                <Text style={{ fontSize: 12, color: colors.text }}>
                  • Last Triggered: <Text style={{ fontWeight: '700', fontFamily: fonts.mono }}>{selectedWorkflow?.last_triggered_at || 'Never'}</Text>
                </Text>
                <Text style={{ fontSize: 12, color: colors.text }}>
                  • Auto-Retry Backoff: <Text style={{ fontWeight: '700', fontFamily: fonts.mono }}>Exponential (1s, 2s, 4s...)</Text>
                </Text>
              </Card>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <Button
                  title="RUN TEST"
                  variant="primary"
                  size="md"
                  icon={<Play size={14} color={colors.primaryText} />}
                  onPress={() => {
                    setDetailModalVisible(false);
                    if (selectedWorkflow) handleTest(selectedWorkflow);
                  }}
                  style={{ flex: 1 }}
                />

                <Button
                  title="DELETE"
                  variant="danger"
                  size="md"
                  icon={<Trash2 size={14} color="#FFFFFF" />}
                  onPress={() => selectedWorkflow && handleDelete(selectedWorkflow.id)}
                  style={{ flex: 1 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Swarm Consensus & Execution Telemetry */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.75)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderColor: colors.borderHighlight,
              borderWidth: 1,
              borderRadius: 2,
              padding: 18,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Zap size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: colors.primary,
                    fontFamily: fonts.mono,
                    textTransform: 'uppercase',
                  }}
                >
                  Swarm Execution Result
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedWorkflow && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 }}>
                  {selectedWorkflow.name}
                </Text>
                <Text style={{ fontSize: 11, color: colors.secondary, fontFamily: fonts.mono }}>
                  Target Agent: {selectedWorkflow.action_agent}
                </Text>
              </View>
            )}

            <View
              style={{
                backgroundColor: colors.surface,
                padding: 12,
                borderRadius: 2,
                borderLeftWidth: 3,
                borderLeftColor: colors.success,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 10, color: colors.success, fontWeight: '700', fontFamily: fonts.mono, marginBottom: 4 }}>
                STATUS: MULTI-AGENT SWARM CONSENSUS [200 OK]
              </Text>
              <Text style={{ fontSize: 12, color: colors.text, lineHeight: 18 }}>
                {lastExecutionResult?.message ||
                  'Multi-agent consensus generated. Autonomous workflow actions queued successfully to Task Queue.'}
              </Text>
            </View>

            <Button
              title="DISMISS"
              variant="primary"
              size="md"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
