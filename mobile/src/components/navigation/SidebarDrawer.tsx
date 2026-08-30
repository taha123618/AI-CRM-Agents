/**
 * Tactical Command Mobile Sidebar Drawer
 * Full-featured categorized navigation drawer with quick search & profile telemetry
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  X,
  Search,
  LayoutDashboard,
  Briefcase,
  Users,
  Compass,
  Mic,
  Sparkles,
  BarChart3,
  Zap,
  MessageSquare,
  Mail,
  TrendingUp,
  Bot,
  Calendar,
  Sliders,
  GitBranch,
  FileSpreadsheet,
  Globe,
  Shield,
  Layers,
  LogOut,
  ChevronRight,
  User as UserIcon,
  CircleDot,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useAuthStore } from '@/stores/authStore';
import { Badge } from '@/components/ui/Badge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavItem {
  name: string;
  title: string;
  route: string;
  icon: any;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'info' | 'purple';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'CORE CRM & SALES',
    items: [
      { name: 'dashboard', title: 'Dashboard', route: '/(tabs)', icon: LayoutDashboard },
      { name: 'deals', title: 'Deals & Pipeline', route: '/(tabs)/deals', icon: Briefcase, badge: 'ACTIVE', badgeVariant: 'primary' },
      { name: 'leads', title: 'Leads & BANT Radar', route: '/(tabs)/leads', icon: Users, badge: 'RADAR', badgeVariant: 'info' },
      { name: 'customers', title: 'Customer 360 & Churn', route: '/(tabs)/customers', icon: Compass },
      { name: 'activities', title: 'Voice Notes & Debriefs', route: '/(tabs)/activities', icon: Mic, badge: 'AUDIO', badgeVariant: 'purple' },
      { name: 'workflows', title: 'Workflow Automations', route: '/(tabs)/workflows', icon: GitBranch },
    ],
  },
  {
    title: 'AI INTELLIGENCE STUDIOS',
    items: [
      { name: 'war-room', title: 'Deal War Room', route: '/(tabs)/war-room', icon: Sparkles, badge: 'SWOT', badgeVariant: 'primary' },
      { name: 'forecasting', title: 'Monte Carlo Forecast', route: '/(tabs)/forecasting', icon: BarChart3, badge: 'ARR', badgeVariant: 'success' },
      { name: 'journey', title: 'Autonomous Journey', route: '/(tabs)/journey', icon: Compass },
      { name: 'sequences', title: 'AI SDR Cadences', route: '/(tabs)/sequences', icon: Zap, badge: 'MULTI-TOUCH', badgeVariant: 'primary' },
      { name: 'voice-ai', title: 'Voice AI Studio', route: '/(tabs)/voice-ai', icon: Mic },
      { name: 'whatsapp', title: 'WhatsApp 24/7 Hub', route: '/(tabs)/whatsapp', icon: MessageSquare, badge: 'LIVE', badgeVariant: 'success' },
      { name: 'emails', title: 'Email Intelligence', route: '/(tabs)/emails', icon: Mail },
      { name: 'agents', title: 'AI Swarm Fleet', route: '/(tabs)/agents', icon: Bot, badge: '9 AGENTS', badgeVariant: 'primary' },
      { name: 'meetings', title: 'Meeting Briefings', route: '/(tabs)/meetings', icon: Calendar },
      { name: 'custom-agents', title: 'Custom Agent Builder', route: '/(tabs)/custom-agents', icon: Sliders },
    ],
  },
  {
    title: 'GOVERNANCE & ANALYTICS',
    items: [
      { name: 'analytics', title: 'Executive Analytics', route: '/(tabs)/analytics', icon: TrendingUp },
      { name: 'reports', title: 'Reports & CSV Export', route: '/(tabs)/reports', icon: FileSpreadsheet },
      { name: 'multi-language', title: 'Multi-Language I18n', route: '/(tabs)/multi-language', icon: Globe, badge: '8 LOCALES', badgeVariant: 'purple' },
      { name: 'settings', title: 'Platform Governance & RBAC', route: '/(tabs)/settings', icon: Shield, badge: 'SECURITY', badgeVariant: 'warning' },
      { name: 'explore', title: 'SaaS Showcase & ROI', route: '/(tabs)/explore', icon: Layers },
    ],
  },
];

export function SidebarDrawer() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const [search, setSearch] = useState('');

  const handleNavigate = (route: string) => {
    closeSidebar();
    router.push(route as any);
  };

  const handleLogout = async () => {
    closeSidebar();
    await logout();
    router.replace('/(auth)/login' as any);
  };

  const width = Dimensions.get('window').width;
  const drawerWidth = Math.min(width * 0.82, 340);

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={closeSidebar}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', flexDirection: 'row' }}>
        {/* Slide-out Drawer Panel */}
        <View
          style={{
            width: drawerWidth,
            height: '100%',
            backgroundColor: colors.background,
            borderRightWidth: 1,
            borderRightColor: colors.borderHighlight,
            paddingTop: Platform.OS === 'ios' ? 50 : 36,
            paddingBottom: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Drawer Header & Operator Telemetry */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                  borderWidth: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Shield size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>
                  TACTICAL COMMAND
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <CircleDot size={9} color={colors.success} />
                  <Text style={{ fontSize: 9, fontFamily: fonts.mono, color: colors.textMuted }}>
                    {user?.role ? user.role.toUpperCase() : 'OPERATOR'} • ONLINE
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={closeSidebar}
              style={{
                width: 28,
                height: 28,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <X size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Quick Search Filter */}
          <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                paddingHorizontal: 10,
                paddingVertical: 6,
                gap: 8,
              }}
            >
              <Search size={13} color={colors.textMuted} />
              <TextInput
                placeholder="QUICK FIND PAGE..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                style={{
                  flex: 1,
                  color: colors.text,
                  fontSize: 10,
                  fontFamily: fonts.mono,
                  padding: 0,
                }}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <X size={12} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Categorized Navigation List */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, paddingBottom: 40, gap: 14 }}
            showsVerticalScrollIndicator={false}
          >
            {NAV_SECTIONS.map((section, sIdx) => {
              const filteredItems = section.items.filter((item) =>
                item.title.toLowerCase().includes(search.toLowerCase())
              );

              if (filteredItems.length === 0) return null;

              return (
                <View key={sIdx}>
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: '800',
                      fontFamily: fonts.mono,
                      color: colors.primary,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      paddingHorizontal: 6,
                      marginBottom: 6,
                    }}
                  >
                    {section.title}
                  </Text>

                  <View style={{ gap: 2 }}>
                    {filteredItems.map((item, iIdx) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.route || pathname.startsWith(item.route + '/');

                      return (
                        <TouchableOpacity
                          key={iIdx}
                          activeOpacity={0.7}
                          onPress={() => handleNavigate(item.route)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingVertical: 9,
                            paddingHorizontal: 10,
                            backgroundColor: isActive ? 'rgba(255, 184, 0, 0.12)' : 'transparent',
                            borderLeftWidth: isActive ? 2 : 0,
                            borderLeftColor: colors.primary,
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <Icon
                              size={15}
                              color={isActive ? colors.primary : colors.textSecondary}
                            />
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: isActive ? '700' : '500',
                                color: isActive ? colors.primary : colors.text,
                                fontFamily: fonts.mono,
                              }}
                              numberOfLines={1}
                            >
                              {item.title}
                            </Text>
                          </View>

                          {item.badge ? (
                            <Badge label={item.badge} variant={item.badgeVariant || 'primary'} size="sm" />
                          ) : (
                            <ChevronRight size={12} color={colors.textMuted} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Bottom Profile & Sign Out Bar */}
          <View
            style={{
              paddingTop: 12,
              paddingHorizontal: 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              gap: 8,
            }}
          >
            {/* Theme Switcher in Drawer */}
            <ThemeToggle showLabel size="md" style={{ width: '100%' }} />

            <TouchableOpacity
              onPress={() => handleNavigate('/(tabs)/settings')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 8,
                paddingHorizontal: 10,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <UserIcon size={14} color={colors.textMuted} />
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>
                    {user?.full_name || 'System Operator'}
                  </Text>
                  <Text style={{ fontSize: 9, fontFamily: fonts.mono, color: colors.textMuted }}>
                    {user?.email || 'admin@gmail.com'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={14} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 8,
                backgroundColor: 'rgba(255, 42, 84, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(255, 42, 84, 0.3)',
              }}
            >
              <LogOut size={13} color={colors.danger} />
              <Text style={{ fontSize: 10, fontWeight: '800', fontFamily: fonts.mono, color: colors.danger }}>
                LOGOUT SESSION
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Backdrop overlay to tap and close */}
        <TouchableWithoutFeedback onPress={closeSidebar}>
          <View style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}
