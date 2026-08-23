/**
 * Tactical Command Mobile Multi-Language & Localization Studio
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Globe, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

const LANGUAGES = [
  { code: 'en', name: 'English (US)', dir: 'LTR', status: 'active' },
  { code: 'ur', name: 'Urdu (اردو)', dir: 'RTL', status: 'available' },
  { code: 'ar', name: 'Arabic (العربية)', dir: 'RTL', status: 'available' },
  { code: 'es', name: 'Spanish (Español)', dir: 'LTR', status: 'available' },
  { code: 'fr', name: 'French (Français)', dir: 'LTR', status: 'available' },
  { code: 'de', name: 'German (Deutsch)', dir: 'LTR', status: 'available' },
  { code: 'ja', name: 'Japanese (日本語)', dir: 'LTR', status: 'available' },
  { code: 'zh', name: 'Chinese (中文)', dir: 'LTR', status: 'available' },
];

export default function MultiLanguageScreen() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState('en');
  const [synced, setSynced] = useState(false);

  const handleSelect = (code: string) => {
    setSelectedLang(code);
    setSynced(true);
    setTimeout(() => setSynced(false), 1500);
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
            I18N LOCALIZATION
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
            MULTI-LANGUAGE
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <StatCard label="SUPPORTED LOCALES" value="8 LOCALES" subValue="RTL / LTR Synced" trend="up" variant="primary" />
          </View>
          <View style={{ flex: 1 }}>
            <StatCard label="TRANSLATION COVERAGE" value="100%" subValue="Dynamic LLM i18n" trend="up" variant="success" />
          </View>
        </View>

        {synced && (
          <View style={{ backgroundColor: colors.surface, padding: 10, borderWidth: 1, borderColor: colors.success }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} color={colors.success} />
              <Text style={{ fontSize: 11, fontFamily: fonts.mono, color: colors.success, fontWeight: '700' }}>
                LOCALE SWITCHED & UI STRINGS RE-SYNCHRONIZED
              </Text>
            </View>
          </View>
        )}

        <Text style={{ fontSize: 11, fontFamily: fonts.mono, fontWeight: '700', color: colors.textMuted }}>
          SELECT ACTIVE CRM LOCALE:
        </Text>

        <View style={{ gap: 10 }}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity key={lang.code} onPress={() => handleSelect(lang.code)}>
              <Card
                variant={selectedLang === lang.code ? 'highlight' : 'default'}
                style={{ padding: 14 }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                      {lang.name}
                    </Text>
                    <Text style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.textMuted, marginTop: 2 }}>
                      Direction: {lang.dir} • Locale Key: [{lang.code}]
                    </Text>
                  </View>

                  <Badge
                    label={selectedLang === lang.code ? 'CURRENT ACTIVE' : 'SWITCH'}
                    variant={selectedLang === lang.code ? 'success' : 'muted'}
                  />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
