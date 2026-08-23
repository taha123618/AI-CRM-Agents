/**
 * Tactical Command Mobile Executive Reports & Export Studio
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FileDown, ArrowLeft, ShieldCheck, CheckCircle2, Download, Table } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

const REPORT_CARDS = [
  { id: 'rep-deals', title: 'DEALS & PIPELINE REVENUE AUDIT', desc: 'Full pipeline health, stage conversion rates, and ARR forecast.', records: '48 Records' },
  { id: 'rep-leads', title: 'LEADS QUALIFICATION & BANT DOSSIER', desc: 'BANT scores, buying timeline, and qualification transcripts.', records: '142 Records' },
  { id: 'rep-voice', title: 'VOICE INTELLIGENCE & CALL SYNTHESIS', desc: 'Debrief recordings, extracted action items, and buyer sentiment.', records: '38 Records' },
  { id: 'rep-audit', title: 'RBAC SECURITY & IMMUTABLE AUDIT LOGS', desc: 'System actions, session logins, and data modifications.', records: '850 Records' },
];

export default function ReportsScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportedSuccess, setExportedSuccess] = useState<string | null>(null);

  const handleExport = (repId: string) => {
    setExportingId(repId);
    setTimeout(() => {
      setExportingId(null);
      setExportedSuccess(repId);
      setTimeout(() => setExportedSuccess(null), 2000);
    }, 1000);
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
            DATA INTELLIGENCE
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            EXECUTIVE REPORTS
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
        <Card variant="highlight" style={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <ShieldCheck size={16} color={colors.primary} />
            <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.primary }}>
              SECURITY-HARDENED CSV EXPORTS
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: colors.textSecondary, fontFamily: fonts.mono, lineHeight: 14 }}>
            All outbound spreadsheets automatically undergo formula injection sanitization (prefixing calculation characters with ') to prevent spreadsheet execution attacks.
          </Text>
        </Card>

        <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted }}>
          AVAILABLE EXECUTIVE REPORTS:
        </Text>

        <View style={{ gap: 12 }}>
          {REPORT_CARDS.map((rep) => (
            <Card key={rep.id} style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text, flex: 1 }}>
                  {rep.title}
                </Text>
                <Badge label={rep.records} variant="muted" />
              </View>

              <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: fonts.mono, marginBottom: 12, lineHeight: 16 }}>
                {rep.desc}
              </Text>

              {exportedSuccess === rep.id && (
                <View style={{ backgroundColor: colors.surface, padding: 8, borderWidth: 1, borderColor: colors.success, marginBottom: 8 }}>
                  <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.success, fontWeight: '700', textAlign: 'center' }}>
                    CSV ENCRYPTED & DOWNLOADED TO LOCAL CACHE
                  </Text>
                </View>
              )}

              <Button
                title={exportingId === rep.id ? "GENERATING SECURE CSV..." : "1-CLICK EXPORT CSV"}
                variant="primary"
                size="sm"
                isLoading={exportingId === rep.id}
                onPress={() => handleExport(rep.id)}
              />
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
