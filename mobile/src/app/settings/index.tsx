/**
 * Tactical Command Mobile Platform Governance, Settings & Security Hub
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Sliders, ArrowLeft, Shield, Users, Activity, Globe, Cpu, History, CheckCircle2, UserPlus, Server } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { OfflineStorage } from '@/services/offlineStorage';

type SettingsTab = 'rbac' | 'observability' | 'webhooks' | 'tasks' | 'audits' | 'diagnostics';

export default function SettingsHubScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<SettingsTab>('rbac');
  const [users, setUsers] = useState([
    { id: 'usr-1', name: 'Super Admin', email: 'admin@gmail.com', role: 'admin', status: 'active', last_active: 'Now' },
    { id: 'usr-2', name: 'Alex Mercer', email: 'alex@company.com', role: 'sales', status: 'active', last_active: '12m ago' },
    { id: 'usr-3', name: 'Support Sentinel', email: 'support@company.com', role: 'support', status: 'active', last_active: '1h ago' },
    { id: 'usr-4', name: 'Security Compliance', email: 'auditor@company.com', role: 'auditor', status: 'active', last_active: '3h ago' },
  ]);

  const [webhooks, setWebhooks] = useState([
    { id: 'wh-1', name: 'Slack War Room Channel', url: 'https://hooks.slack.com/services/T00/B00/X00', events: ['deal.closed_won', 'war_room.consensus'], status: 'active' },
    { id: 'wh-2', name: 'ERP Billing Gateway', url: 'https://api.enterprise-erp.com/v1/billing', events: ['deal.contract_signed'], status: 'active' },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 'aud-1', actor: 'admin@gmail.com', action: 'ROLE_UPDATE', target: 'alex@company.com (sales -> admin)', timestamp: '10:42 AM', ip: '192.168.1.1' },
    { id: 'aud-2', actor: 'alex@company.com', action: 'PROPOSAL_GENERATE', target: 'Acme Corp Deal ($120k)', timestamp: '10:15 AM', ip: '192.168.1.42' },
    { id: 'aud-3', actor: 'system@swarm', action: 'AUTONOMOUS_INTERVENTION', target: 'Cyberdyne Systems (Churn 85%)', timestamp: '09:30 AM', ip: '10.0.0.1' },
  ]);

  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    OfflineStorage.getOfflineQueue().then((q) => setQueueCount(q.length));
  }, []);

  const tabs = [
    { id: 'rbac' as const, label: 'RBAC USERS', icon: Shield },
    { id: 'observability' as const, label: 'METRICS', icon: Activity },
    { id: 'webhooks' as const, label: 'WEBHOOKS', icon: Globe },
    { id: 'tasks' as const, label: 'TASK QUEUE', icon: Cpu },
    { id: 'audits' as const, label: 'AUDIT TRAIL', icon: History },
    { id: 'diagnostics' as const, label: 'DIAGNOSTICS', icon: Server },
  ];

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
            ENTERPRISE GOVERNANCE
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            SETTINGS &amp; SECURITY
          </Text>
        </View>
      </View>

      {/* Subtabs Bar */}
      <View style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : colors.border,
                }}
              >
                <Icon size={12} color={isActive ? colors.background : colors.textMuted} />
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: fonts.mono,
                    fontWeight: '800',
                    color: isActive ? colors.background : colors.textSecondary,
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
        {/* TAB: RBAC USERS */}
        {activeTab === 'rbac' && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <StatCard label="TOTAL OPERATORS" value={users.length} subValue="4 active accounts" trend="up" variant="primary" />
              </View>
              <View style={{ flex: 1 }}>
                <StatCard label="YOUR ROLE" value={String(user?.role || 'ADMIN').toUpperCase()} subValue="Full Access" trend="up" variant="success" />
              </View>
            </View>

            <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted }}>
              ACTIVE CRM OPERATORS &amp; PERMISSIONS:
            </Text>

            <View style={{ gap: 8 }}>
              {users.map((usr) => (
                <Card key={usr.id} style={{ padding: 14 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                      {usr.name}
                    </Text>
                    <Badge
                      label={String(usr.role || 'USER').toUpperCase()}
                      variant={usr.role === 'admin' ? 'purple' : usr.role === 'sales' ? 'primary' : 'info'}
                    />
                  </View>
                  <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 4 }}>
                    {usr.email}
                  </Text>
                  <Text style={{ fontSize: 9, fontFamily: fonts.mono, color: colors.textMuted }}>
                    Last Active: {usr.last_active} • Status: {String(usr.status || 'ACTIVE').toUpperCase()}
                  </Text>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* TAB: OBSERVABILITY */}
        {activeTab === 'observability' && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <StatCard label="API UPTIME" value="99.98%" subValue="FastAPI / Uvicorn" trend="up" variant="success" />
              </View>
              <View style={{ flex: 1 }}>
                <StatCard label="P99 LATENCY" value="28ms" subValue="Redis Cached" trend="up" variant="primary" />
              </View>
            </View>

            <Card style={{ padding: 14 }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary, marginBottom: 8 }}>
                SWARM TELEMETRY &amp; TRACING
              </Text>
              <Text style={{ fontSize: 10, color: colors.textSecondary, fontFamily: fonts.mono, lineHeight: 16 }}>
                • BaseAgent TraceMixin: Enabled on all 9 agents
                {'\n'}• Redis Pub/Sub: Connected (crm:events)
                {'\n'}• PostgreSQL Connection Pool: 10 active / 20 max
                {'\n'}• WebSocket Stream (/ws): Active &amp; synchronized
              </Text>
            </Card>
          </View>
        )}

        {/* TAB: WEBHOOKS */}
        {activeTab === 'webhooks' && (
          <View style={{ gap: 12 }}>
            <Card variant="highlight" style={{ padding: 14 }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary, marginBottom: 4 }}>
                SSRF HARDENING ACTIVE
              </Text>
              <Text style={{ fontSize: 10, color: colors.textSecondary, fontFamily: fonts.mono }}>
                All outbound webhook URLs are sanitized with `is_safe_webhook_url` preventing AWS/GCP metadata service traversal.
              </Text>
            </Card>

            <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted }}>
              CONFIGURED OUTBOUND WEBHOOKS:
            </Text>

            {webhooks.map((wh) => (
              <Card key={wh.id} style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                    {wh.name}
                  </Text>
                  <Badge label="ACTIVE" variant="success" />
                </View>
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textMuted, marginBottom: 6 }}>
                  {wh.url}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  {wh.events.map((ev, idx) => (
                    <Badge key={idx} label={ev} variant="primary" size="sm" />
                  ))}
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* TAB: TASK QUEUE */}
        {activeTab === 'tasks' && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <StatCard label="WORKER STATUS" value="ONLINE" subValue="worker.py daemon" trend="up" variant="success" />
              </View>
              <View style={{ flex: 1 }}>
                <StatCard label="EXPONENTIAL RETRIES" value="ACTIVE" subValue="1s, 2s, 4s, 8s backoff" trend="up" variant="primary" />
              </View>
            </View>

            <Card style={{ padding: 14 }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary, marginBottom: 8 }}>
                PERSISTENT TASK QUEUE ENGINE
              </Text>
              <Text style={{ fontSize: 10, color: colors.textSecondary, fontFamily: fonts.mono, lineHeight: 16 }}>
                Outbound SMTP emails and heavy Monte Carlo forecasting jobs run asynchronously via `services/task_queue_service.py` with Redis state persistence.
              </Text>
            </Card>
          </View>
        )}

        {/* TAB: AUDIT TRAIL */}
        {activeTab === 'audits' && (
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted }}>
              IMMUTABLE FORENSIC AUDIT TRAIL:
            </Text>

            {auditLogs.map((log) => (
              <Card key={log.id} style={{ padding: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Badge label={log.action} variant="primary" size="sm" />
                  <Text style={{ fontSize: 9, fontFamily: fonts.mono, color: colors.textMuted }}>
                    {log.timestamp} • {log.ip}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text, marginBottom: 2 }}>
                  {log.actor}
                </Text>
                <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textSecondary }}>
                  {log.target}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {/* TAB: DIAGNOSTICS */}
        {activeTab === 'diagnostics' && (
          <View style={{ gap: 12 }}>
            <Button
              title="GO TO USER PROFILE &amp; CACHE MANAGER"
              variant="primary"
              size="md"
              onPress={() => router.push('/settings/profile' as any)}
            />

            <Card style={{ padding: 14 }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary, marginBottom: 6 }}>
                OFFLINE ACTION QUEUE
              </Text>
              <Text style={{ fontSize: 10, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 10 }}>
                {queueCount} pending mutations queued in local AsyncStorage.
              </Text>
              <Button
                title="PURGE OFFLINE QUEUE"
                variant="danger"
                size="sm"
                onPress={() => {
                  OfflineStorage.clearOfflineQueue().then(() => setQueueCount(0));
                  Alert.alert('Storage Cleared', 'Offline action queue purged.');
                }}
              />
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
